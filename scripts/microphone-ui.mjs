import assert from "node:assert/strict";
import {chromium} from "playwright";
import {getRecipe} from "../lib/recipe.ts";
import {newSession} from "../lib/session.ts";
const base=process.env.SOUS_TEST_URL || "http://localhost:3000";
const browser=await chromium.launch({channel:"chrome",headless:true,args:["--use-fake-ui-for-media-stream","--use-fake-device-for-media-stream"]});
const page=await browser.newPage();let starts=0;const messages=[];let callStarted=false;const packets=[];let connection;const echoedMarks=[];
const recipe=getRecipe("miso-soup"),state=newSession(recipe.id,"microphone-test","mock-secret");
await page.route("**/api/call/start",route=>{starts++;return route.fulfill({json:{sessionId:state.id,secret:state.secret,wsUrl:"wss://sous-microphone-test.invalid/call",subprotocol:"alebex.token.test",startCall:{type:"start_call",agent:{id:"mock"}},state,recipe,warnings:[]}});});
await page.route("**/api/session/*",route=>route.fulfill({json:state}));
await page.addInitScript(()=>{const Original=window.AudioContext;window.__sousAudioContexts=[];window.AudioContext=class extends Original{constructor(options){super(options);window.__sousAudioContexts.push(this);}};});
await page.routeWebSocket("wss://sous-microphone-test.invalid/call",ws=>{
 connection=ws;
 ws.onMessage(message=>{
  if(typeof message==="string"){
   const frame=JSON.parse(message);messages.push(frame.type);if(frame.type==="mark")echoedMarks.push(frame.name);
   if(frame.type==="start_call"){callStarted=true;ws.send(JSON.stringify({type:"call_started",call_id:"test-call"}));}
  }else{
   assert.equal(callStarted,true,"microphone audio preceded start_call");assert.equal(message.byteLength,640);
   const pcm=new Int16Array(message.buffer,message.byteOffset,message.byteLength/2);
   packets.push({at:Date.now(),nonzero:pcm.some(n=>Math.abs(n)>10)});
  }
 });
});
try{
 await page.goto(base+"/cook?recipeId=miso-soup");await page.getByRole("button",{name:"Start cooking",exact:true}).click();
 await page.getByRole("region",{name:"Microphone input"}).waitFor();
 for(let i=0;i<80 && !packets.some(p=>p.nonzero);i++)await page.waitForTimeout(100);
 assert.ok(packets.some(p=>p.nonzero),"real browser worklet produced no audible samples");
 await page.getByRole("button",{name:"Mute microphone",exact:true}).click();await page.waitForTimeout(500);
 assert.ok(packets.slice(-8).every(p=>!p.nonzero),"mute did not send silence");
 const beforeUnmute=packets.length;await page.getByRole("button",{name:"Unmute microphone",exact:true}).click();
 for(let i=0;i<80 && !packets.slice(beforeUnmute).some(p=>p.nonzero);i++)await page.waitForTimeout(100);
 assert.ok(packets.slice(beforeUnmute).some(p=>p.nonzero),"unmuting did not resume microphone samples");
 const beforeReconnect=packets.length;await page.getByRole("button",{name:"Reconnect microphone",exact:true}).click();
 for(let i=0;i<80 && !packets.slice(beforeReconnect).some(p=>p.nonzero);i++)await page.waitForTimeout(100);
 assert.ok(packets.slice(beforeReconnect).some(p=>p.nonzero));assert.equal(starts,1,"microphone retry opened another voice call");assert.equal(messages[0],"start_call");
 const tone=Buffer.from(Int16Array.from({length:2400},(_,i)=>1000*Math.sin(i*2*Math.PI*440/24000)).buffer).toString("base64");
 const audio=()=>connection.send(JSON.stringify({type:"audio",data:tone,sample_rate:24000}));
 const mark=name=>connection.send(JSON.stringify({type:"mark",name}));
 const waitMark=async name=>{for(let i=0;i<60 && !echoedMarks.includes(name);i++)await page.waitForTimeout(50);assert.ok(echoedMarks.includes(name),"playback acknowledgement stalled: "+name);};
 for(const name of ["turn-one","turn-two","turn-three"]){audio();mark(name);await waitMark(name);}
 audio();mark("interrupted");connection.send(JSON.stringify({type:"clear_audio"}));await waitMark("interrupted");
 await page.evaluate(()=>window.__sousAudioContexts[0].suspend());audio();mark("paused-output");await page.waitForTimeout(300);assert.equal(echoedMarks.includes("paused-output"),false,"acknowledged audio before it played");
 await page.getByRole("button",{name:"Resume audio",exact:true}).click();await waitMark("paused-output");assert.equal(starts,1);
 console.log(JSON.stringify({result:"PASS",turnAcknowledgements:echoedMarks.length,checks:"real AudioWorklet capture, PCM640-byte frames, handshake gating, audible samples, mute/unmute, same-call microphone retry, three response turns, interruption, suspended playback recovery",audioPackets:packets.length,externalPaidCalls:0}));
}finally{await browser.close();}
