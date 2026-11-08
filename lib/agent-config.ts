import { describeIngredient, type Recipe } from "./recipe";
import { numWord, type SessionState } from "./session";

export const AGENT_NAME = "Sous";

export const FIRST_MESSAGE =
  "Hey chef, Sous here. I've got your recipe up. Whenever you're ready, just ask me what to do first.";

export const AGENT_PROMPT = `You're Sous, a friendly cook talking with a home cook on a live voice call while they cook. Only the words meant for the cook are heard, so never narrate what you're doing or mention tools.

The selected recipe and where they are in it are under About this caller, and every tool result tells you the current step. Your knowledge base contains only that selected recipe, including its ingredients, tips and safety notes. Use those facts for this call; never carry over ingredients or advice from another recipe. If a fact or substitution is not covered, say you don't know rather than inventing it. Never promise a dish or substitute is allergen-free; ask the cook to check ingredient labels and cross-contact risks.

Talk like a friend standing next to them at the stove: warm, relaxed, one or two short sentences, one idea at a time. Give the action, not the structure. Never say step numbers or things like step two of nine unless they ask which step they're on. Don't repeat their words back, and don't ask if they need anything else.

When they ask what to do first, what's next, or say they're done, call next_step and tell them what to do in your own words. When they ask a question, answer it from the recipe and leave the step where it is. When they ask you to repeat, say it again, simpler. When they're missing an ingredient, suggest the best swap from your knowledge base, and call note_substitution once they go with it. Only start a timer when they ask, with manage_timer. If they just say okay, thanks or got it, reply with a word at most.

If something's burning, smoking or splitting, prioritize safety over continuing the recipe. Follow the selected recipe's safety notes and thermometer checks; never use color, clear juices or cooking time alone to confirm safe doneness. Never make the cook feel bad about a mistake.

Say numbers, times and temperatures in words. No exclamation marks, no lists. Use contractions. If a tool fails, say the requested change wasn't confirmed. You may repeat known recipe guidance, but never claim a step, timer, serving count or substitution changed without a successful tool result.`;

export const TOOL_NAMES = [
  "next_step",
  "previous_step",
  "get_current_step",
  "jump_to_step",
  "manage_timer",
  "note_substitution",
  "set_servings",
] as const;
export type ToolName = (typeof TOOL_NAMES)[number];

export type CustomTool = {
  name: ToolName;
  description: string;
  url: string;
  headers: Record<string, string>;
  timeoutMs: number;
  parameters: Record<string, unknown>;
};

export function buildTools(publicBase: string, session: SessionState): CustomTool[] {
  const url = `${publicBase.replace(/\/$/, "")}/api/tools`;
  const headers = { "X-Sous-Session": session.id, "X-Sous-Secret": session.secret };
  const none = { type: "object", properties: {} };
  const mk = (name: ToolName, description: string, parameters: Record<string, unknown> = none): CustomTool => ({
    name,
    description,
    url,
    headers,
    timeoutMs: 8000,
    parameters,
  });
  return [
    mk(
      "next_step",
      "Move the cook to the next step of the recipe and return it. Call this when the cook says they're done, finished, ready, or asks what's next or what to do next. Do not call it when they ask a question about the current step, ask for a repeat, or report a problem."
    ),
    mk(
      "previous_step",
      "Move the cook back to the previous step and return it. Call this when the cook asks to go back, says they missed something in the last step, or wants the previous step again."
    ),
    mk(
      "get_current_step",
      "Return the step the cook is on right now, with its ingredients and amounts. Call this when the cook asks what step they're on, asks you to repeat the step, or asks what they should be doing now. Do not call it to repeat an answer you just gave."
    ),
    mk(
      "jump_to_step",
      "Jump to a specific step by number and return it. Call this when the cook names a step number, or asks to start over from the beginning (step one).",
      {
        type: "object",
        properties: { step_number: { type: "integer", description: "The step number to jump to, starting at one" } },
        required: ["step_number"],
      }
    ),
    mk(
      "manage_timer",
      "Start or cancel a kitchen timer shown on the cook's screen. Call this when the cook asks for a timer, agrees to one you offered, or asks to cancel one. Do not call it just because the recipe mentions a time.",
      {
        type: "object",
        properties: {
          action: { type: "string", enum: ["start", "cancel"], description: "start a new timer or cancel a running one" },
          label: { type: "string", description: "Short name for the timer, like garlic or sear side two" },
          seconds: { type: "integer", description: "Length in seconds. Leave empty to use the current step's suggested time." },
        },
        required: ["action"],
      }
    ),
    mk(
      "note_substitution",
      "Record that the cook is replacing an ingredient with something else, so it shows on their screen and is remembered. Call this once the cook lacks an ingredient and you've agreed on what to use instead. Do not call it while still discussing options.",
      {
        type: "object",
        properties: {
          ingredient: { type: "string", description: "The recipe ingredient being replaced" },
          substitute: { type: "string", description: "What the cook is using instead" },
        },
        required: ["ingredient", "substitute"],
      }
    ),
    mk(
      "set_servings",
      "Change how many servings the recipe is scaled to and return the new amounts. Call this when the cook says how many people they're cooking for or asks to double or halve the recipe.",
      {
        type: "object",
        properties: { servings: { type: "integer", description: "Number of servings, one to twelve" } },
        required: ["servings"],
      }
    ),
  ];
}

function weekdayDate(d = new Date()): string {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

/** Facts about this cook and this call. Must stay under 4,000 characters. */
export function buildContext(recipe: Recipe, state: SessionState, now = new Date()): string {
  if (state.recipeId !== recipe.id) throw new Error("Recipe/session mismatch");
  const total = recipe.steps.length;
  const idx = Math.min(state.stepIndex, total - 1);
  const step = recipe.steps[idx];
  const where =
    state.stepIndex >= total
      ? "They have finished every step."
      : !state.started
        ? `They haven't started yet. When they ask what to do first, the first step is ${step.title}. After that, tool results tell you the current step as it changes.`
        : `They are on step ${numWord(idx + 1)} of ${numWord(total)}, ${step.title}. Tool results tell you the current step as it changes.`;
  const subs = state.substitutions.length
    ? `Substitutions so far: ${state.substitutions.map((s) => `${s.substitute} instead of ${s.ingredient}`).join("; ")}.`
    : "No substitutions so far.";
  const ingredients = recipe.ingredients.map((i) => describeIngredient(i, recipe.servings, state.servings, "spoken")).join("; ");
  const steps = recipe.steps
    .map((s, i) => {
      const mins = s.durationSeconds ? ` (about ${spokenMinutes(s.durationSeconds)})` : "";
      return `${i + 1}. ${s.title}. ${s.instruction}${mins}`;
    })
    .join("\n");
  const text = `Recipe ID: ${recipe.id}. Today is ${weekdayDate(now)}. The cook is making ${recipe.title} for ${numWord(state.servings)} ${state.servings === 1 ? "person" : "people"}. ${where} ${subs}

Ingredients for ${numWord(state.servings)} servings: ${ingredients}.

The recipe has ${numWord(total)} steps:
${steps}`;
  if (text.length > 4000) throw new Error(`context too long: ${text.length}`);
  return text;
}

function spokenMinutes(seconds: number): string {
  if (seconds < 60) return `${numWord(seconds)} seconds`;
  const m = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${numWord(m)} minute${m === 1 ? "" : "s"}${remainder ? ` and ${numWord(remainder)} seconds` : ""}`;
}

export function buildStartCall(agentId: string, recipe: Recipe, state: SessionState, publicBase: string | null) {
  return {
    type: "start_call" as const,
    agent: { id: agentId },
    ...(publicBase ? { customTools: buildTools(publicBase, state) } : {}),
    context: buildContext(recipe, state),
    // One source of recipe facts for every selection, including tips and safety.
    knowledgeBase: JSON.stringify(recipe),
  };
}
