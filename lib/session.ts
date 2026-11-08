import { DEFAULT_ACCESS, normalizeAccess, type AccessPreferences } from "./access-preferences";
import { instructionActions, explainTerm, plainInstruction } from "./adaptive-instructions";
import { describeIngredient, getRecipe, type Recipe, type Step } from "./recipe";

export type Timer = {
  id: string;
  label: string;
  seconds: number;
  /** Epoch ms when the timer ends. */
  endsAt: number;
  status: "running" | "fired" | "cancelled";
};

export type Substitution = { ingredient: string; substitute: string };

export type SessionState = {
  id: string;
  recipeId: string;
  secret: string;
  /** 0-based. Equal to steps.length means the dish is finished. */
  stepIndex: number;
  /** False until the cook has been given the first step; the first next_step reveals step one. */
  started: boolean;
  servings: number;
  substitutions: Substitution[];
  timers: Timer[];
  /** Reserved for a future voice "pause" command. */
  voiceCommand: { name: "sleep"; at: number } | null;
  access?: {
    preferences: AccessPreferences;
    actionIndex: number;
    paused: boolean;
    assistance?: { concern: string; accepted: boolean | null };
  };
  status: "cooking" | "finished";
  callId: string | null;
  toolCalls: number;
  updatedAt: number;
};

/** What a tool hands back to the agent. `spoken` is written for the voice. */
export type ToolResult = Record<string, unknown> & { spoken: string };

export type Transition = { state: SessionState; result: ToolResult };

const ORDINALS = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh", "eighth", "ninth", "tenth", "eleventh", "twelfth"];
const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
export const numWord = (n: number) => WORDS[n] ?? String(n);
export const ordinalWord = (n: number) => ORDINALS[n - 1] ?? `number ${n}`;

export function newSession(recipeId: string, id: string, secret: string, now = Date.now()): SessionState {
  const recipe = mustRecipe(recipeId);
  return {
    id,
    recipeId,
    secret,
    stepIndex: 0,
    started: false,
    servings: recipe.servings,
    substitutions: [],
    timers: [],
    voiceCommand: null,
    status: "cooking",
    callId: null,
    toolCalls: 0,
    updatedAt: now,
  };
}

function mustRecipe(id: string): Recipe {
  const r = getRecipe(id);
  if (!r) throw new Error(`Unknown recipe ${id}`);
  return r;
}

function touch(state: SessionState, patch: Partial<SessionState>, now: number): SessionState {
  return { ...state, ...patch, updatedAt: now };
}

/** The step as the agent should hear it. */
export function describeStep(recipe: Recipe, state: SessionState, step: Step, index: number): ToolResult {
  const total = recipe.steps.length;
  const ingredients = (step.ingredients ?? [])
    .map((name) => recipe.ingredients.find((i) => i.name === name))
    .filter((i): i is NonNullable<typeof i> => Boolean(i))
    .map((i) => describeIngredient(i, recipe.servings, state.servings, "spoken"));
  const preferences = normalizeAccess(state.access?.preferences);
  const actions = instructionActions(step);
  const actionIndex = Math.min(state.access?.actionIndex ?? 0, actions.length - 1);
  const sourceInstruction = preferences.oneAction ? actions[actionIndex] : step.instruction;
  const instruction = preferences.simplified ? plainInstruction(sourceInstruction) : sourceInstruction;
  return {
    spoken: instruction + (preferences.oneAction && actionIndex === 0 && step.safety ? ` Safety: ${step.safety}` : ""),
    note: preferences.oneAction ? "This is the confirmed current action. Read only this action and its safety note; wait for an explicit next request before advancing. Do not rewrite quantities or temperatures." : "This is the cook's current step now.",
    whereTheyAre: `step ${numWord(index + 1)} of ${numWord(total)}, ${step.title}`,
    stepNumber: index + 1,
    totalSteps: total,
    title: step.title,
    instruction,
    originalInstruction: step.instruction,
    actionNumber: preferences.oneAction ? actionIndex + 1 : null,
    totalActions: preferences.oneAction ? actions.length : null,
    guidancePaused: state.access?.paused ?? false,
    accessPreferences: preferences,
    ingredientsForThisStep: ingredients,
    tip: step.tip ?? null,
    safety: step.safety ?? null,
    suggestedTimerSeconds: step.durationSeconds ?? null,
    isLastStep: index === total - 1,
    finished: false,
  };
}

function finishedResult(recipe: Recipe): ToolResult {
  return {
    spoken: `That's the last step done. ${recipe.title} is finished. Plate it up and enjoy.`,
    finished: true,
    stepNumber: recipe.steps.length,
    totalSteps: recipe.steps.length,
  };
}

export function currentStep(state: SessionState, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  if (state.stepIndex >= recipe.steps.length) return { state, result: finishedResult(recipe) };
  const next = state.started ? state : touch(state, { started: true }, now);
  return { state: next, result: describeStep(recipe, next, recipe.steps[next.stepIndex], next.stepIndex) };
}

export function nextStep(state: SessionState, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  if (state.access?.paused) return {state, result:{spoken:"Guidance is paused. Say continue or choose Resume guidance when ready. Cooking timers are still running.",guidancePaused:true}};
  if (!state.started) return currentStep(state, now); // the first "what's next" is step one
  if (state.stepIndex >= recipe.steps.length) {
    return { state, result: { ...finishedResult(recipe), spoken: `You're already done. ${recipe.title} is finished, so go enjoy it.` } };
  }
  if (state.access?.preferences.oneAction) {
    const actions = instructionActions(recipe.steps[state.stepIndex]);
    if (state.access.actionIndex < actions.length - 1) {
      const next = touch(state, {access:{...state.access,actionIndex:state.access.actionIndex+1}}, now);
      return {state:next,result:describeStep(recipe,next,recipe.steps[next.stepIndex],next.stepIndex)};
    }
  }
  const idx = state.stepIndex + 1;
  if (idx >= recipe.steps.length) {
    const next = touch(state, { stepIndex: idx, status: "finished", ...(state.access ? {access:{...state.access,actionIndex:0}} : {}) }, now);
    return { state: next, result: finishedResult(recipe) };
  }
  const next = touch(state, { stepIndex: idx, ...(state.access ? {access:{...state.access,actionIndex:0}} : {}) }, now);
  return { state: next, result: describeStep(recipe, next, recipe.steps[idx], idx) };
}

export function previousStep(state: SessionState, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  if (state.access?.paused) return {state,result:{spoken:"Guidance is paused. Resume guidance before moving back.",guidancePaused:true}};
  if (state.access?.preferences.oneAction && state.access.actionIndex > 0 && state.stepIndex < recipe.steps.length) {
    const next=touch(state,{access:{...state.access,actionIndex:state.access.actionIndex-1}},now);
    return {state:next,result:describeStep(recipe,next,recipe.steps[next.stepIndex],next.stepIndex)};
  }
  if (state.stepIndex === 0) {
    const r = describeStep(recipe, state, recipe.steps[0], 0);
    return { state, result: { ...r, spoken: `This is the very first step. ${r.spoken}` } };
  }
  const idx = Math.min(state.stepIndex - 1, recipe.steps.length - 1);
  const next = touch(state, { stepIndex: idx, status: "cooking", started: true, ...(state.access ? {access:{...state.access,actionIndex:state.access.preferences.oneAction ? instructionActions(recipe.steps[idx]).length-1 : 0}} : {}) }, now);
  return { state: next, result: describeStep(recipe, next, recipe.steps[idx], idx) };
}

export function jumpToStep(state: SessionState, stepNumber: number, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  const total = recipe.steps.length;
  if (state.access?.paused) return {state,result:{spoken:"Guidance is paused. Resume guidance before changing steps.",guidancePaused:true}};
  if (!Number.isFinite(stepNumber) || stepNumber < 1 || stepNumber > total) {
    const cur = currentStep(state).result;
    return { state, result: { ...cur, spoken: `This recipe has ${numWord(total)} steps, so there's no step ${numWord(Math.round(stepNumber) || 0)}. ${cur.spoken}` } };
  }
  const idx = Math.round(stepNumber) - 1;
  const next = touch(state, { stepIndex: idx, status: "cooking", started: true, ...(state.access ? {access:{...state.access,actionIndex:0}} : {}) }, now);
  return { state: next, result: describeStep(recipe, next, recipe.steps[idx], idx) };
}

export function setServings(state: SessionState, servings: number, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  const n = Math.round(servings);
  if (!Number.isFinite(n) || n < 1 || n > 12) {
    return { state, result: { spoken: `I can scale this between one and twelve servings. You're set for ${numWord(state.servings)} right now.`, servings: state.servings } };
  }
  const next = touch(state, { servings: n }, now);
  const key = recipe.ingredients
    .filter((i) => i.amount !== null)
    .slice(0, 4)
    .map((i) => describeIngredient(i, recipe.servings, n, "spoken"));
  const spoken = `Done, the recipe is now for ${numWord(n)}. That means ${key.slice(0, 3).join(", ")}, and everything else scales the same way.`;
  return { state: next, result: { spoken, servings: n, scaledIngredients: recipe.ingredients.map((i) => describeIngredient(i, recipe.servings, n, "spoken")) } };
}

export function noteSubstitution(state: SessionState, ingredient: string, substitute: string, now = Date.now()): Transition {
  const ing = ingredient.trim();
  const sub = substitute.trim();
  if (!ing || !sub) return { state, result: { spoken: "Tell me which ingredient you're missing and what you'd like to use instead." } };
  const others = state.substitutions.filter((s) => s.ingredient.toLowerCase() !== ing.toLowerCase());
  const next = touch(state, { substitutions: [...others, { ingredient: ing, substitute: sub }] }, now);
  return { state: next, result: { spoken: `Noted, ${sub} in place of ${ing}. I'll keep that in mind for the rest of the recipe.`, substitutions: next.substitutions } };
}

function spokenDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const parts: string[] = [];
  if (m) parts.push(`${numWord(m)} minute${m === 1 ? "" : "s"}`);
  if (s) parts.push(`${numWord(s)} second${s === 1 ? "" : "s"}`);
  return parts.join(" and ") || "zero seconds";
}

export function startTimer(state: SessionState, label: string | undefined, seconds: number | undefined, id: string, now = Date.now()): Transition {
  const recipe = mustRecipe(state.recipeId);
  const step = recipe.steps[Math.min(state.stepIndex, recipe.steps.length - 1)];
  const secs = Math.round(seconds ?? step?.durationSeconds ?? 0);
  if (!Number.isFinite(secs) || secs < 5 || secs > 6 * 3600) {
    return { state, result: { spoken: "How long should the timer be?" } };
  }
  const name = (label?.trim() || step?.title || "Timer").slice(0, 40);
  const timer: Timer = { id, label: name, seconds: secs, endsAt: now + secs * 1000, status: "running" };
  const next = touch(state, { timers: [...state.timers.filter((t) => t.status === "running"), timer] }, now);
  return { state: next, result: { spoken: `Timer set, ${spokenDuration(secs)} for ${name}. I'll let you know when it's done.`, timer } };
}

export function cancelTimer(state: SessionState, label: string | undefined, now = Date.now()): Transition {
  const running = state.timers.filter((t) => t.status === "running");
  if (running.length === 0) return { state, result: { spoken: "There's no timer running right now." } };
  const wanted = label?.trim().toLowerCase();
  const target = (wanted && running.find((t) => t.label.toLowerCase().includes(wanted))) || running[running.length - 1];
  const next = touch(state, { timers: state.timers.map((t) => (t.id === target.id ? { ...t, status: "cancelled" as const } : t)) }, now);
  return { state: next, result: { spoken: `Okay, I cancelled the ${target.label} timer.`, cancelled: target.label } };
}

export function markTimerFired(state: SessionState, timerId: string, now = Date.now()): Transition {
  const t = state.timers.find((x) => x.id === timerId);
  if (!t) return { state, result: { spoken: "" } };
  const next = touch(state, { timers: state.timers.map((x) => (x.id === timerId ? { ...x, status: "fired" as const } : x)) }, now);
  return { state: next, result: { spoken: `The ${t.label} timer is done.`, timer: next.timers.find((x) => x.id === timerId) } };
}


/** Presentation progress lives beside, never inside, the source recipe. */
export function configureAccess(state: SessionState, preferences: unknown, now = Date.now()): Transition {
 const recipe=mustRecipe(state.recipeId);
 const step=recipe.steps[Math.min(state.stepIndex,recipe.steps.length-1)];
 const access={...state.access,preferences:normalizeAccess(preferences),actionIndex:Math.min(state.access?.actionIndex ?? 0,instructionActions(step).length-1),paused:state.access?.paused ?? false};
 const next=touch(state,{access},now);
 return {state:next,result:{spoken:"Your guidance preferences are updated. Your recipe, action and timers have not changed.",accessPreferences:access.preferences}};
}
export function pauseGuidance(state: SessionState, paused: boolean, now = Date.now()): Transition {
 const next=touch(state,{access:{preferences:normalizeAccess(state.access?.preferences),actionIndex:state.access?.actionIndex ?? 0,...state.access,paused}},now);
 const resumed=paused ? null : currentStep(next,now);
 return {state:resumed?.state ?? next,result:{spoken:paused ? "Guidance paused. Your microphone is still available. Timers and hot cookware have not been paused." : "Guidance resumed. "+resumed!.result.spoken,guidancePaused:paused}};
}
const ASSISTANCE: Record<string,string> = {
 lifting:"Do not lift cookware that feels unsafe to handle. Keep it on a stable surface and ask another person for help moving it. A suitable lightweight pan may help for a future cook; do not transfer hot contents just to change pans.",
 measuring:"Do not guess an amount from markings you cannot read. Consider a tactile measuring tool or an accessible scale suitable for the ingredient, or ask someone to confirm the measurement. Keep the recipe quantity unchanged.",
 one_hand:"Pause before handling knives or hot cookware. A stable, non-slip preparation surface or a purpose-designed one-handed kitchen tool may help. Ask for assistance if the current action cannot be done safely. I cannot verify your equipment or surroundings.",
 hot_water:"Do not lift or drain hot water if you cannot do so safely. Leave the pan stable, turn off the heat only if safely reachable, and ask for help. I do not have a verified no-drain alternative for this recipe.",
 knife:"Keep your fingers clear of the blade and the board stable. Stop and ask for help or use suitable pre-prepared ingredients if the cutting action is not comfortable. Do not change required ingredient amounts.",
 raw_food:"Keep raw meat and its utensils separate from ready-to-eat food. Wash hands and utensils after handling it. Follow the selected recipe's safety and thermometer instructions.",
 doneness:"Use the food thermometer check in this recipe. I cannot measure the food temperature. Time, appearance and color alone cannot confirm that it is safe.",
 smoke:"Stop recipe progression. If safely reachable, turn off the heat. Stay clear of hot cookware. If there is fire, spreading smoke or you feel unsafe, leave the area and contact local emergency services. I cannot detect or assess the smoke.",
 fire:"Stop cooking and keep away from danger. Never use water on a grease fire or move a burning pan. If you cannot safely control the situation, leave the area and contact local emergency services. I cannot assess the fire or make the kitchen safe.",
};
export function accessGuidance(state: SessionState, args: Record<string,unknown>, now = Date.now()): Transition {
 const recipe=mustRecipe(state.recipeId);const action=String(args.action ?? "repeat");
 switch(action){
  case "pause": return pauseGuidance(state,true,now);
  case "resume": return pauseGuidance(state,false,now);
  case "preferences": return configureAccess(state,{...DEFAULT_ACCESS,...state.access?.preferences,...Object.fromEntries(Object.keys(DEFAULT_ACCESS).filter(k=>typeof args[k]==="boolean").map(k=>[k,args[k]]))},now);
  case "repeat": return currentStep(state,now);
  case "recipe": return {state,result:{spoken:`You're cooking ${recipe.title} for ${numWord(state.servings)}.`,recipeId:recipe.id}};
  case "ingredients": return {state,result:{spoken:recipe.ingredients.map(i=>describeIngredient(i,recipe.servings,state.servings,"spoken")).join("; ")}};
  case "remaining": return {state,result:{spoken:state.stepIndex>=recipe.steps.length ? "All steps are finished." : "Remaining steps: "+recipe.steps.slice(state.stepIndex).map(s=>s.title).join("; ")}};
  case "timers": {
   const timers=state.timers.filter(t=>t.status==="running");
   return {state,result:{spoken:timers.length ? timers.map(t=>`${t.label}: ${spokenDuration(Math.max(0,Math.ceil((t.endsAt-now)/1000)))} remaining`).join(". ") : "No timers are running.",timers}};
  }
  case "explain": {
   const term=String(args.term ?? "").slice(0,40);return {state,result:{spoken:term ? explainTerm(term) : currentStep(state,now).result.spoken+" You can ask about a cooking term or request one action at a time."}};
  }
  case "help": {
   const concern=String(args.concern ?? "");const spoken=ASSISTANCE[concern];
   if(!spoken)return {state,result:{spoken:"I do not have a verified alternative for that action. Pause if needed and ask someone for help rather than attempting an unsafe movement."}};
   const paused=pauseGuidance(state,true,now).state;
   const next={...paused,access:{...paused.access!,assistance:{concern,accepted:null}}};
   return {state:next,result:{spoken,assistance:next.access.assistance,guidancePaused:true,awaitingChoice:concern!=="fire" && concern!=="smoke"}};
  }
  case "accept": case "decline": {
   if(!state.access?.assistance)return {state,result:{spoken:"There is no assistance suggestion to confirm."}};
   const next=touch(state,{access:{...state.access,assistance:{...state.access.assistance,accepted:action==="accept"}}},now);
   return {state:next,result:{spoken:"Noted. Your recipe and timers are unchanged. Guidance stays paused until you choose Resume guidance."}};
  }
  default: return {state,result:{spoken:"That guidance action is not supported. Your cooking progress has not changed."}};
 }
}
