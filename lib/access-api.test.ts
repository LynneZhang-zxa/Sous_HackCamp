import { beforeEach, describe, expect, it, vi } from "vitest";
import { newSession, configureAccess, currentStep, nextStep, startTimer } from "./session";
import { listRecipes } from "./recipe";
import type { SessionState } from "./session";
import { POST as screenStart } from "../app/api/session/route";
import { POST as voiceStart } from "../app/api/call/start/route";
import { POST as tool } from "../app/api/tools/route";
import { RECOVERY_MAX_AGE } from "./cooking-recovery";
const mocks=vi.hoisted(()=>({sessions:new Map<string,SessionState>(),token:vi.fn(async()=>"mock-token")}));
vi.mock("./store",async importOriginal=>{
 const actual=await importOriginal<typeof import("./store")>();
 return {...actual,createSession:vi.fn(async(id:string,prefs?:unknown)=>{let s=newSession(id,"s","secret");if(prefs!==undefined)s=configureAccess(s,prefs).state;mocks.sessions.set(s.id,s);return s;}),getSession:vi.fn(async(id:string)=>mocks.sessions.get(id)??null),saveSession:vi.fn(async(s:SessionState)=>{mocks.sessions.set(s.id,s);})};
});
vi.mock("./alebex",()=>({mintWsToken:mocks.token,requireEnv:()=>"mock-agent",WS_URL:"wss://example.test",resolvePublicBase:async()=>({base:"https://example.test",source:"test"})}));
beforeEach(()=>{mocks.sessions.clear();mocks.token.mockClear();});
const req=(body:unknown,secret="secret")=>new Request("https://example.test",{method:"POST",headers:{"Content-Type":"application/json","X-Sous-Session":"s","X-Sous-Secret":secret},body:JSON.stringify(body)});
const recipe=listRecipes()[0];
describe("access API routes without external calls",()=>{
 it("starts on-screen guidance with the selected recipe, preferences and no ALEBEX token request",async()=>{
  const res=await screenStart(req({recipeId:recipe.id,preferences:{oneAction:true}}));expect(res.status).toBe(200);const cfg=await res.json();expect(cfg.recipe.id).toBe(recipe.id);expect(cfg.state.access.preferences.oneAction).toBe(true);expect(cfg.state.started).toBe(true);expect(mocks.token).not.toHaveBeenCalled();
 });
 it("restores confirmed action, servings, substitution and running timer rather than restarting",async()=>{
  let s=configureAccess(newSession(recipe.id,"s","secret"),{oneAction:true}).state;s=currentStep(s).state;s=nextStep(s).state;s=startTimer(s,"test",90,"timer").state;mocks.sessions.set("s",s);
  const res=await screenStart(req({recipeId:recipe.id,resumeSessionId:"s",resumeSecret:"secret"}));expect(res.status).toBe(200);const cfg=await res.json();expect(cfg.state.stepIndex).toBe(s.stepIndex);expect(cfg.state.access.actionIndex).toBe(s.access?.actionIndex);expect(cfg.state.timers).toEqual(s.timers);
 });
 it("recovers a voice session using mocked token minting and the same selected recipe",async()=>{
  const s=configureAccess(newSession(recipe.id,"s","secret"),{oneAction:true}).state;mocks.sessions.set("s",s);
  const res=await voiceStart(req({recipeId:recipe.id,resumeSessionId:"s",resumeSecret:"secret"}));expect(res.status).toBe(200);expect((await res.json()).state.recipeId).toBe(recipe.id);expect(mocks.token).toHaveBeenCalledTimes(1);
 });
 it("rejects invalid, expired and cross-recipe recovery before contacting ALEBEX",async()=>{
  for(const patch of [{secret:"wrong"},{recipeId:listRecipes()[1].id},{updatedAt:Date.now()-RECOVERY_MAX_AGE-1}]){
   mocks.sessions.set("s",{...newSession(recipe.id,"s","secret"),...patch});const res=await voiceStart(req({recipeId:recipe.id,resumeSessionId:"s",resumeSecret:"secret"}));expect([409,410]).toContain(res.status);expect(mocks.token).not.toHaveBeenCalled();
  }
  expect((await screenStart(req({recipeId:recipe.id,resumeSessionId:"missing",resumeSecret:"secret"}))).status).toBe(410);
 });
 it("rejects unknown recipes, malformed bodies and invalid preferences",async()=>{
  for(const body of [null,[],{}, {recipeId:3},{recipeId:recipe.id,preferences:[]}])expect((await screenStart(req(body))).status).toBe(400);
  expect((await screenStart(req({recipeId:"missing"}))).status).toBe(404);expect(mocks.token).not.toHaveBeenCalled();
 });
 it("uses the same pause/next/repeat rules for manual and voice tool calls",async()=>{
  mocks.sessions.set("s",currentStep(configureAccess(newSession(recipe.id,"s","secret"),{oneAction:true}).state).state);
  const before=mocks.sessions.get("s")!;
  expect((await tool(req({tool:"access_guidance",arguments:{action:"pause"}}))).status).toBe(200);
  await tool(req({tool:"next_step"}));expect(mocks.sessions.get("s")?.stepIndex).toBe(before.stepIndex);expect(mocks.sessions.get("s")?.access?.actionIndex).toBe(before.access?.actionIndex);
  await tool(req({tool:"access_guidance",arguments:{action:"resume"}}));await tool(req({tool:"access_guidance",arguments:{action:"repeat"}}));expect(mocks.sessions.get("s")?.access?.actionIndex).toBe(before.access?.actionIndex);
  await tool(req({tool:"next_step"}));expect(mocks.sessions.get("s")?.access?.actionIndex).toBe(before.access!.actionIndex+1);
 });
 it("serializes concurrent actions and rejects unauthorized or malformed tools",async()=>{
  mocks.sessions.set("s",currentStep(configureAccess(newSession(recipe.id,"s","secret"),{oneAction:true}).state).state);
  expect((await tool(req({tool:"next_step"},"wrong"))).status).toBe(401);
  expect((await tool(req({tool:"manage_timer",arguments:{label:42}}))).status).toBe(400);
  expect((await tool(req({tool:"next_step",arguments:[]}))).status).toBe(400);
  const before=mocks.sessions.get("s")!;await Promise.all([tool(req({tool:"access_guidance",arguments:{action:"preferences",slower:true}})),tool(req({tool:"set_servings",arguments:{servings:4}}))]);
  const after=mocks.sessions.get("s")!;expect(after.access?.preferences.slower).toBe(true);expect(after.servings).toBe(4);expect(after.stepIndex).toBe(before.stepIndex);
 });
});
