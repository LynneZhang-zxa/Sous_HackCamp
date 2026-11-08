import assert from "node:assert/strict";
import { mkdirSync } from "node:fs";
import { chromium } from "playwright";
import { listRecipes, getRecipe } from "../lib/recipe.ts";
import { newSession, configureAccess, currentStep, nextStep, previousStep, jumpToStep, accessGuidance, setServings, startTimer, cancelTimer, markTimerFired } from "../lib/session.ts";
import { instructionActions } from "../lib/adaptive-instructions.ts";
const base=process.env.SOUS_TEST_URL || "http://localhost:3000";
const output=process.env.SOUS_TEST_OUTPUT || "/private/tmp/sous-access-checks";
mkdirSync(output,{recursive:true});
const browser=await chromium.launch({channel:"chrome",headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const sessions=new Map();const errors=[];let voiceRequests=0,toolRequests=0;
page.on("pageerror",error=>errors.push(error.message));
// All cooking writes and voice calls are local mocks. No ALEBEX or Supabase request is made.
await page.route("**/api/call/start",async route=>{voiceRequests++;await route.fulfill({status:503,json:{error:"Mock voice connection unavailable. Your progress is kept; use on-screen guidance."}});});
await page.route("**/api/session",async route=>{
 const body=route.request().postDataJSON(),recipe=getRecipe(body.recipeId);
 if(!recipe)return route.fulfill({status:404,json:{error:"Unknown recipe"}});
 let state;
 if(body.resumeSessionId){state=sessions.get(body.resumeSessionId);if(!state || state.secret!==body.resumeSecret)return route.fulfill({status:410,json:{error:"Saved session expired. Start a new session."}});}
 else state=configureAccess(newSession(recipe.id,"mock-session","mock-secret"),body.preferences).state;
 state=currentStep(state).state;sessions.set(state.id,state);
 await route.fulfill({json:{sessionId:state.id,secret:state.secret,state,recipe,warnings:[]}});
});
await page.route("**/api/session/*",async route=>{
 const state=sessions.get(route.request().url().split("/").pop());
 if(!state)return route.fulfill({status:404,json:{error:"Not found"}});
 const {secret,...safe}=state;await route.fulfill({json:safe});
});
await page.route("**/api/tools",async route=>{
 toolRequests++;const body=route.request().postDataJSON();let state=sessions.get("mock-session");if(!state)return route.fulfill({status:401,json:{error:"Unknown cooking session"}});
 const args=body.arguments ?? {};let result;
 switch(body.tool){
  case "next_step":result=nextStep(state);break;
  case "previous_step":result=previousStep(state);break;
  case "jump_to_step":result=jumpToStep(state,Number(args.step_number));break;
  case "get_current_step":result=currentStep(state);break;
  case "access_guidance":result=accessGuidance(state,args);break;
  case "set_servings":result=setServings(state,Number(args.servings));break;
  case "manage_timer":result=args.action==="cancel" ? cancelTimer(state,args.label) : args.action==="fired" ? markTimerFired(state,args.timer_id) : startTimer(state,args.label,args.seconds,"mock-timer");break;
  default:return route.fulfill({status:400,json:{error:"Unsupported test action"}});
 }
 sessions.set(state.id,result.state);await route.fulfill({json:result.result});
});
async function keyboardCook(locator,key) {
 await page.waitForFunction(()=>{const b=[...document.querySelectorAll(".cook-controls-dock button")].find(b=>b.textContent==="Repeat instruction");return b && !b.disabled;});
 await locator.focus();
 const response=page.waitForResponse(r=>r.url().endsWith("/api/tools") && r.request().method()==="POST");
 await page.keyboard.press(key);await response;
 await page.waitForFunction(()=>{const b=[...document.querySelectorAll(".cook-controls-dock button")].find(b=>b.textContent==="Repeat instruction");return b && !b.disabled;});
}
async function tabTo(locator) {
 for(let i=0;i<260;i++){if(await locator.evaluate(e=>e===document.activeElement))return;await page.keyboard.press("Tab");}
 throw new Error("Keyboard could not reach the requested control");
}
try{
 await page.goto(base);
 await page.keyboard.press("Tab");assert.equal(await page.locator(":focus").textContent(),"Skip to main content");
 await page.keyboard.press("Enter");assert.equal(await page.locator(":focus").getAttribute("id"),"main-content");
 const composer=page.locator(".voice-composer-dock");const before=await composer.boundingBox();
 await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(120);
 const after=await composer.boundingBox();assert.ok(Math.abs(before.y-after.y)<1,"composer moved with page scroll");
 await page.evaluate(()=>window.scrollTo(0,0));
 const settings=page.getByRole("button",{name:/Settings.*SOUS Access/});await tabTo(settings);await page.keyboard.press("Enter");
 const dialog=page.getByRole("dialog",{name:"SOUS Access"});await dialog.waitFor();
 for(let i=0;i<12;i++){await page.keyboard.press("Tab");assert.equal(await page.evaluate(()=>!!document.querySelector("dialog[open]")?.contains(document.activeElement)),true,"focus escaped dialog");}
 await page.keyboard.press("Shift+Tab");assert.equal(await page.evaluate(()=>!!document.querySelector("dialog[open]")?.contains(document.activeElement)),true);
 for(const label of ["One action at a time","Simplified instructions","Large text & high contrast","Reduced touch interaction","Slower guidance"])await dialog.getByRole("checkbox",{name:new RegExp(label,"i")}).check();
 await page.keyboard.press("Escape");assert.equal(await page.locator(":focus").getAttribute("class"),"access-settings-trigger");
 await page.reload();await page.waitForFunction(()=>document.documentElement.dataset.sousContrast==="true");
 await settings.click();assert.equal(await dialog.getByRole("checkbox",{name:/One action at a time/i}).isChecked(),true);await page.keyboard.press("Escape");
 await page.getByRole("link",{name:"Browse recipes"}).focus();await page.keyboard.press("Enter");await page.waitForURL("**/recipes");await page.waitForFunction(()=>document.activeElement?.tagName==="H1");
 await page.getByRole("button",{name:"Japanese",exact:true}).focus();await page.keyboard.press("Space");assert.equal(await page.getByRole("button",{name:"Japanese",exact:true}).getAttribute("aria-pressed"),"true");
 const detail=page.locator('a[href="/recipes/miso-soup"]').first();await detail.focus();await page.keyboard.press("Enter");await page.waitForURL("**/recipes/miso-soup");
 await page.getByRole("link",{name:"Cook by Voice",exact:true}).focus();await page.keyboard.press("Enter");await page.waitForURL("**/cook?recipeId=miso-soup");
 await page.getByRole("button",{name:/Use on-screen guidance/}).focus();await page.keyboard.press("Enter");await page.locator(".cook-controls-dock").waitFor();
 const recipe=getRecipe("miso-soup");let state=sessions.get("mock-session");assert.equal(state.recipeId,"miso-soup");assert.equal(state.access.preferences.oneAction,true);
 let originalStep=state.stepIndex,originalAction=state.access.actionIndex;
 await keyboardCook(page.getByRole("button",{name:"Repeat instruction",exact:true}),"Enter");assert.equal(sessions.get("mock-session").access.actionIndex,originalAction);
 await keyboardCook(page.getByRole("button",{name:"Pause guidance",exact:true}),"Space");assert.equal(sessions.get("mock-session").access.paused,true);
 assert.equal(await page.getByRole("button",{name:"Next action",exact:true}).last().isDisabled(),true);
 await page.getByRole("button",{name:"Repeat instruction",exact:true}).click();assert.equal(sessions.get("mock-session").stepIndex,originalStep);
 await keyboardCook(page.getByRole("button",{name:"Resume guidance",exact:true}),"Space");await page.locator("h1").click();
 await page.keyboard.press("Alt+Shift+ArrowRight");await page.waitForFunction(()=>document.querySelector(".cook-action-announcement")?.textContent?.length>0);
 await page.waitForTimeout(100);state=sessions.get("mock-session");assert.equal(state.access.actionIndex,originalAction+1);
 const checkpoint={stepIndex:state.stepIndex,actionIndex:state.access.actionIndex};
 await page.reload();await page.getByRole("button",{name:"Resume on-screen session",exact:true}).click();await page.locator(".cook-controls-dock").waitFor();
 assert.deepEqual({stepIndex:sessions.get("mock-session").stepIndex,actionIndex:sessions.get("mock-session").access.actionIndex},checkpoint);
 await page.locator(".guidance-help summary").click();
 await page.getByRole("textbox",{name:"Timer label",exact:true}).fill("Rest timer");await page.getByRole("button",{name:"Start timer",exact:true}).click();
 const timerEnd=sessions.get("mock-session").timers[0].endsAt;
 await page.getByRole("timer",{name:/Rest timer/}).waitFor();
 await page.getByRole("button",{name:/Settings.*SOUS Access/}).click();await dialog.getByRole("checkbox",{name:/One action at a time/i}).uncheck();await page.waitForFunction(()=>!JSON.parse(localStorage.getItem("sous-access-preferences-v1")).oneAction);
 await page.waitForTimeout(100);assert.equal(sessions.get("mock-session").access.preferences.oneAction,false);assert.equal(sessions.get("mock-session").access.actionIndex,checkpoint.actionIndex);
 await dialog.getByRole("checkbox",{name:/One action at a time/i}).check();await page.keyboard.press("Escape");await page.waitForTimeout(100);
 assert.equal(sessions.get("mock-session").access.actionIndex,checkpoint.actionIndex);assert.equal(sessions.get("mock-session").timers[0].endsAt,timerEnd);
 await page.getByRole("button",{name:"Explain term",exact:true}).click();assert.equal(sessions.get("mock-session").access.actionIndex,checkpoint.actionIndex);
 await page.getByRole("combobox",{name:"Help with an action"}).selectOption("lifting");await page.getByRole("button",{name:"Get safe guidance",exact:true}).click();assert.equal(sessions.get("mock-session").access.paused,true);
 await page.getByRole("button",{name:"Accept suggestion",exact:true}).click();assert.equal(sessions.get("mock-session").access.assistance.accepted,true);
 await page.getByRole("button",{name:"Resume guidance",exact:true}).click();
 await page.getByRole("button",{name:"Start voice from here",exact:true}).click();await page.getByRole("alert").filter({hasText:"Mock voice"}).first().waitFor();
 assert.equal(sessions.get("mock-session").access.actionIndex,checkpoint.actionIndex);assert.ok(voiceRequests>0);
 await page.getByRole("button",{name:"Continue on-screen",exact:true}).click();await page.waitForFunction(()=>document.querySelector(".cook-dock-status")?.textContent==="On-screen guidance");
 await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:output+"/access-cooking-desktop.png"});
 for(const width of [1440,768,390,320]){
  await page.setViewportSize({width,height:900});
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)){
   console.log(await page.evaluate(()=>[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+1 && e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,cls:e.className,width:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right)})).slice(0,18)));
   await page.screenshot({path:output+"/overflow-debug.png",fullPage:true});
  }
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"cook high-contrast overflow @"+width);
  if(width===390)await page.screenshot({path:output+"/access-cooking-mobile.png",fullPage:true});
 }
 await page.evaluate(()=>document.documentElement.style.fontSize="200%");await page.waitForTimeout(150);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))console.log(await page.evaluate(()=>({viewport:innerWidth,htmlWidth:document.documentElement.scrollWidth,bodyWidth:document.body.scrollWidth,overflow:[...document.querySelectorAll("body *")].filter(e=>e.scrollWidth>e.clientWidth+1).map(e=>({tag:e.tagName,cls:e.className,scroll:e.scrollWidth,client:e.clientWidth})).slice(0,20)})));
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))await page.screenshot({path:output+"/text-zoom-debug.png",fullPage:true});
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))console.log(await page.evaluate(()=>[...document.querySelectorAll("body *")].filter(e=>e.getBoundingClientRect().right>innerWidth+.1&&e.getBoundingClientRect().width>0).map(e=>({tag:e.tagName,cls:e.className,width:Math.round(e.getBoundingClientRect().width),right:Math.round(e.getBoundingClientRect().right)})).slice(0,15)));
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"200% text caused overflow");await page.evaluate(()=>document.documentElement.style.fontSize="");
 sessions.clear();await page.reload();await page.getByRole("button",{name:"Resume on-screen session",exact:true}).click();await page.getByRole("alert").filter({hasText:"expired"}).waitFor();
 await page.getByRole("button",{name:/Use on-screen guidance/}).click();await page.locator(".cook-controls-dock").waitFor();
 await page.goto(base+"/recipes");await page.getByRole("button",{name:/Settings.*SOUS Access/}).click();await dialog.getByRole("button",{name:"Reset preferences",exact:true}).click();await page.keyboard.press("Escape");
 await page.waitForFunction(()=>document.documentElement.dataset.sousContrast==="false");
 for(const width of [390,320]){
  await page.setViewportSize({width,height:844});await page.goto(base);const initial=await composer.boundingBox();await page.evaluate(()=>window.scrollTo(0,document.body.scrollHeight));await page.waitForTimeout(100);const final=await composer.boundingBox();assert.ok(Math.abs(initial.y-final.y)<1);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,"homepage overflow @"+width);
 }
 await page.screenshot({path:output+"/composer-mobile.png"});
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+"/recipes");
 const tools=page.getByText("Tools",{exact:true});await tools.focus();await page.keyboard.press("Enter");assert.equal(await page.locator("details").first().getAttribute("open"),"");await page.keyboard.press("Escape");assert.equal(await page.locator("details").first().getAttribute("open"),null);
 const client=await page.context().newCDPSession(page);await client.send("Accessibility.enable");const ax=await client.send("Accessibility.getFullAXTree");
 for(const role of ["main","navigation","heading","searchbox","button"])assert.ok(ax.nodes.some(n=>!n.ignored && n.role?.value===role),"missing accessibility role "+role);
 assert.deepEqual(errors,[]);
 console.log(JSON.stringify({result:"PASS",viewports:[1440,768,390,320],checks:"fixed composer, keyboard and dialog focus, preference persistence/reset, route focus, keyboard recipe selection, substeps, repeat, pause/resume, recovery, safe assistance, mocked connection errors, 200% text, accessibility tree",mockVoiceRequests:voiceRequests,mockToolRequests:toolRequests,externalPaidCalls:0}));
}finally{await browser.close();}
