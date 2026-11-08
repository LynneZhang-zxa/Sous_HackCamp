// Restricted local relay: only authenticated tool POSTs are reachable through a tunnel.
import http from "node:http";
import {randomUUID} from "node:crypto";
import {spawn} from "node:child_process";
import {readFile,writeFile,unlink} from "node:fs/promises";
import {resolve} from "node:path";
const port=Number(process.env.SOUS_RELAY_PORT || 3002);
const target=process.env.SOUS_LOCAL_URL || "http://127.0.0.1:3000";
const stateFile=resolve(".voice-tunnel.local.json"),instanceId=randomUUID();
const proxyOnly=process.argv.includes("--proxy-only");let child;let publicBase="",ready=false,stopping=false;
const server=http.createServer(async(req,res)=>{
 const path=new URL(req.url||"/","http://localhost").pathname;
 if(path==="/health" && req.method==="GET"){res.writeHead(200,{"Content-Type":"application/json"});return res.end(JSON.stringify({instanceId}));}
 if(path!=="/api/tools" || req.method!=="POST"){res.writeHead(404);return res.end();}
 const session=req.headers["x-sous-session"],secret=req.headers["x-sous-secret"];
 if(typeof session!=="string" || typeof secret!=="string"){res.writeHead(401);return res.end();}
 try{
  let size=0;const parts=[];for await(const part of req){size+=part.length;if(size>32768){res.writeHead(413);res.end();return;}parts.push(part);}
  const upstream=await fetch(new URL("/api/tools",target),{method:"POST",headers:{"Content-Type":"application/json","X-Sous-Session":session,"X-Sous-Secret":secret},body:Buffer.concat(parts),signal:AbortSignal.timeout(6500)});
  res.writeHead(upstream.status,{"Content-Type":"application/json","Cache-Control":"no-store"});res.end(await upstream.text());
 }catch{res.writeHead(502,{"Content-Type":"application/json"});res.end(JSON.stringify({error:"The local cooking tool was not reachable. No change is confirmed."}));}
});
async function cleanup(){
 if(stopping)return;stopping=true;
 try{const saved=JSON.parse(await readFile(stateFile,"utf8"));if(saved.instanceId===instanceId)await unlink(stateFile);}catch{}
 child?.kill("SIGTERM");server.close(()=>process.exit(0));setTimeout(()=>process.exit(0),1500).unref();
}
process.on("SIGINT",cleanup);process.on("SIGTERM",cleanup);
async function verifyAndSave(){
 if(ready || !publicBase)return;
 try{const response=await fetch(publicBase+"/health",{signal:AbortSignal.timeout(2000)});if(!response.ok)return;const health=await response.json();if(health.instanceId!==instanceId)return;
  await writeFile(stateFile,JSON.stringify({publicBase,port,instanceId})+"\n",{mode:0o600});ready=true;console.log("Voice tool relay ready. The application will discover it for new calls.");
 }catch{}
}
server.on("error",e=>{console.error("Could not start voice relay:",e.code);process.exitCode=1;});
server.listen(port,"127.0.0.1",()=>{
 console.log(`Restricted tool relay listening on 127.0.0.1:${port}. Homepage and configuration paths are not exposed.`);
 if(proxyOnly)return;
 child=spawn(process.env.CLOUDFLARED_BIN || "cloudflared",["tunnel","--url",`http://127.0.0.1:${port}`,"--protocol","http2","--no-autoupdate"],{stdio:["ignore","pipe","pipe"]});
 const onLog=data=>{const match=String(data).match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);if(match)publicBase=match[0];};
 child.stdout.on("data",onLog);child.stderr.on("data",onLog);
 child.on("error",()=>{console.error("cloudflared is not available. Set CLOUDFLARED_BIN to the official executable path.");void cleanup();});
 child.on("exit",()=>{if(ready)console.error("Voice tunnel stopped; new calls will no longer use it.");void cleanup();});
 const timer=setInterval(()=>void verifyAndSave(),2000);timer.unref();
});
