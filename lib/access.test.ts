import { describe, expect, it } from "vitest";
import { ACCESS_KEY, DEFAULT_ACCESS, normalizeAccess, parseAccess, persistAccess } from "./access-preferences";
import { instructionActions, plainInstruction } from "./adaptive-instructions";
import { parseRecovery, RECOVERY_MAX_AGE } from "./cooking-recovery";
import { listRecipes } from "./recipe";
import { accessGuidance, configureAccess, currentStep, jumpToStep, newSession, nextStep, noteSubstitution, pauseGuidance, previousStep, setServings, startTimer } from "./session";
import { AGENT_PROMPT, buildStartCall, buildTools } from "./agent-config";
const recipes=listRecipes();
const base=(id=recipes[0].id)=>newSession(id,"access-test","secret",1000);
const enabled=(id=recipes[0].id)=>configureAccess(base(id),{oneAction:true},1000).state;

describe("access preferences and recovery",()=>{
 it("persists only the six non-sensitive boolean settings",()=>{
  const values=new Map<string,string>();const storage={setItem:(k:string,v:string)=>{values.set(k,v);}};
  const prefs=normalizeAccess({oneAction:true,slower:true,highContrast:false,diagnosis:"must not be stored",voiceFirst:"yes"});
  expect(persistAccess(storage,prefs)).toBe(true);expect(parseAccess(values.get(ACCESS_KEY)!)).toEqual(prefs);
  expect(values.get(ACCESS_KEY)).not.toContain("diagnosis");expect(prefs.voiceFirst).toBe(false);
 });
 it("handles corrupt or unavailable storage and reset defaults",()=>{
  for(const raw of [null,"{","null","[]","42"])expect(parseAccess(raw)).toEqual(DEFAULT_ACCESS);
  expect(persistAccess({setItem:()=>{throw new Error("blocked");}},DEFAULT_ACCESS)).toBe(false);
 });
 it("accepts recovery only for the selected recipe and bounded timestamp",()=>{
  const s={sessionId:"s",secret:"secret",recipeId:recipes[1].id,savedAt:2000};
  expect(parseRecovery(JSON.stringify(s),recipes[1].id,3000)).toEqual(s);
  expect(parseRecovery(JSON.stringify(s),recipes[0].id,3000)).toBeNull();
  expect(parseRecovery(JSON.stringify(s),s.recipeId,2000+RECOVERY_MAX_AGE+1)).toBeNull();
  expect(parseRecovery(JSON.stringify(s),s.recipeId,1000)).toBeNull();
  expect(parseRecovery("{",s.recipeId)).toBeNull();
 });
});

describe("deterministic adaptive instructions",()=>{
 for(const recipe of recipes)it(recipe.id+" preserves source, quantities, safety and one-action progression",()=>{
  const original=JSON.stringify(recipe);let state=enabled(recipe.id);
  state=currentStep(state,1100).state;
  for(let stepIndex=0;stepIndex<recipe.steps.length;stepIndex++){
   const step=recipe.steps[stepIndex],actions=instructionActions(step);
   expect(actions.join(" ")).toBe(step.instruction);
   for(let actionIndex=0;actionIndex<actions.length;actionIndex++){
    expect(state.stepIndex).toBe(stepIndex);expect(state.access?.actionIndex).toBe(actionIndex);
    const before=JSON.stringify(state);const repeated=accessGuidance(state,{action:"repeat"},1200);
    expect(repeated.result.instruction).toBe(actions[actionIndex]);expect(repeated.result.safety).toBe(step.safety ?? null);
    expect(JSON.stringify(repeated.state)).toBe(before);
    const paused=pauseGuidance(state,true,1300).state;
    expect(nextStep(paused,1400).state).toBe(paused);
    expect(previousStep(paused,1400).state).toBe(paused);
    state=pauseGuidance(paused,false,1500).state;
    expect(state.stepIndex).toBe(stepIndex);expect(state.access?.actionIndex).toBe(actionIndex);
    state=nextStep(state,1600).state;
   }
  }
  expect(state.status).toBe("finished");expect(state.stepIndex).toBe(recipe.steps.length);
  expect(JSON.stringify(recipe)).toBe(original);
 });
 it("does not split decimal temperatures, quantities or detach dependent clauses",()=>{
  const step={id:"s",title:"Safety",instruction:"Use 1.5 cups of liquid. Cook until a thermometer reads 165°F (74°C). Leave it covered until ready."};
  expect(instructionActions(step)).toEqual(["Use 1.5 cups of liquid.","Cook until a thermometer reads 165°F (74°C).","Leave it covered until ready."]);
  expect(plainInstruction("Simmer 1.5 cups until 165°F (74°C).")).toContain("1.5 cups until 165°F (74°C).");
 });
 it("splits clear imperative clauses but keeps dependent conditions and ingredient lists together",()=>{
  const step={id:"s",title:"Prep",instruction:"Dice the onion, mince the garlic and grate the ginger. If the sauce is too thick, add water. Add salt and pepper. Cover and cook the rice."};
  const actions=instructionActions(step);
  expect(actions).toContain("Dice the onion,");expect(actions).toContain("mince the garlic");expect(actions).toContain("and grate the ginger.");
  expect(actions).toContain("If the sauce is too thick, add water.");expect(actions).toContain("Add salt and pepper.");expect(actions).toContain("Cover and cook the rice.");expect(actions.join(" ")).toBe(step.instruction);
 });
 it("keeps original behavior when access preferences are disabled",()=>{
  let state=base();expect(currentStep(state).result.instruction).toBe(recipes[0].steps[0].instruction);
  state=nextStep(state).state;expect(state.stepIndex).toBe(0);state=nextStep(state).state;expect(state.stepIndex).toBe(1);
 });
 it("resumes an unstarted session at its first action without skipping or redelivering it on next",()=>{
  const paused=pauseGuidance(enabled(),true).state;
  const resumed=pauseGuidance(paused,false).state;
  expect(resumed.started).toBe(true);expect(resumed.stepIndex).toBe(0);expect(resumed.access?.actionIndex).toBe(0);
  const next=nextStep(resumed).state;expect(next.access?.actionIndex).toBe(1);
 });
 it("moves back by an action across a step boundary and preserves progress during preference changes",()=>{
  let state=currentStep(enabled()).state;const actions=instructionActions(recipes[0].steps[0]);
  for(let i=0;i<actions.length;i++)state=nextStep(state).state;
  expect(state.stepIndex).toBe(1);state=previousStep(state).state;
  expect(state.stepIndex).toBe(0);expect(state.access?.actionIndex).toBe(actions.length-1);
  const changed=configureAccess(state,{oneAction:false,simplified:true}).state;
  expect(changed.stepIndex).toBe(state.stepIndex);expect(changed.access?.actionIndex).toBe(state.access?.actionIndex);
  expect(configureAccess(changed,{oneAction:true}).state.access?.actionIndex).toBe(actions.length-1);
 });
 it("preserves servings, substitutions and timer end times through pause/repeat/preferences",()=>{
  let state=startTimer(enabled(),"test",90,"t",1000).state;
  state=setServings(state,4).state;state=noteSubstitution(state,"milk","oat milk").state;
  const unchanged={timers:state.timers,substitutions:state.substitutions,servings:state.servings};
  for(const action of ["pause","repeat","explain","remaining","timers","recipe","ingredients","resume"]){state=accessGuidance(state,{action,term:"simmer"},1100).state;expect({timers:state.timers,substitutions:state.substitutions,servings:state.servings}).toEqual(unchanged);}
  expect(accessGuidance(state,{action:"timers"},1100).result.spoken).toContain("test");
 });
 it("does not advance for explanations, unsupported words or uncertain accommodations",()=>{
  const state=currentStep(enabled()).state;
  for(const args of [{action:"explain",term:"simmer"},{action:"explain",term:"unknown"},{action:"unsupported"},{action:"help",concern:"unknown"}]){
   const next=accessGuidance(state,args).state;expect(next.stepIndex).toBe(state.stepIndex);expect(next.access?.actionIndex).toBe(state.access?.actionIndex);
  }
 });
 it("pauses for reported danger without changing timers or inventing safe doneness",()=>{
  const state=startTimer(currentStep(enabled()).state,"pan",90,"t",1000).state;
  for(const concern of ["lifting","measuring","one_hand","hot_water","knife","raw_food","doneness","smoke","fire"]){
   const t=accessGuidance(state,{action:"help",concern});expect(t.state.access?.paused).toBe(true);expect(t.state.stepIndex).toBe(state.stepIndex);expect(t.state.timers).toEqual(state.timers);
   const accepted=accessGuidance(t.state,{action:"accept"}).state;expect(accepted.access?.paused).toBe(true);expect(accepted.access?.assistance?.accepted).toBe(true);
   expect(accessGuidance(t.state,{action:"decline"}).state.access?.assistance?.accepted).toBe(false);
  }
  expect(accessGuidance(state,{action:"help",concern:"fire"}).result.spoken).toContain("Never use water");
  expect(accessGuidance(state,{action:"help",concern:"doneness"}).result.spoken).toContain("cannot measure");
 });
 it("rejects an invalid recipe and does not let a paused jump skip a step",()=>{
  expect(()=>newSession("missing","s","secret")).toThrow("Unknown recipe");
  const state=pauseGuidance(enabled(),true).state;expect(jumpToStep(state,3).state).toBe(state);
 });
});

describe("existing voice provider access integration",()=>{
 for(const recipe of recipes)it(recipe.id+" keeps context limits and the exact recipe facts",()=>{
  const state=configureAccess(base(recipe.id),{oneAction:true,slower:true,simplified:true,voiceFirst:true}).state;
  const call=buildStartCall("mock-agent",recipe,state,"https://example.test");
  expect(call.context.length).toBeLessThanOrEqual(4000);expect(call.context).toContain('"oneAction":true');
  expect(JSON.parse(call.knowledgeBase)).toEqual(recipe);expect(call.customTools).toHaveLength(8);
  expect(buildTools("https://example.test",state).find(t=>t.name==="access_guidance")).toBeTruthy();
 });
 it("distinguishes slower pacing and pausing from audio speed, microphone and heat",()=>{
  expect(AGENT_PROMPT).toContain("not a configurable TTS playback rate");expect(AGENT_PROMPT).toContain("not the microphone, timers, stove or cooking");
  expect(AGENT_PROMPT).toContain("never because of okay, silence or ambiguous speech");
 });
});
