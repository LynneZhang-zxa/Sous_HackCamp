import { NextResponse } from "next/server";
import { getRecipe } from "@/lib/recipe";
import { createSession, getSession, saveSession } from "@/lib/store";
import { configureAccess, currentStep } from "@/lib/session";
import { normalizeAccess } from "@/lib/access-preferences";
import { RECOVERY_MAX_AGE } from "@/lib/cooking-recovery";
export async function POST(req: Request) {
 const body=await req.json().catch(()=>null);
 if(!body || typeof body!=="object" || Array.isArray(body) || typeof body.recipeId!=="string")return NextResponse.json({error:"A recipe ID is required."},{status:400});
 const recipe=getRecipe(body.recipeId);if(!recipe)return NextResponse.json({error:"Unknown recipe"},{status:404});
 if(body.preferences!==undefined && (!body.preferences || typeof body.preferences!=="object" || Array.isArray(body.preferences)))return NextResponse.json({error:"Invalid preferences"},{status:400});
 let state;
 if(body.resumeSessionId!==undefined){
  if(typeof body.resumeSessionId!=="string" || typeof body.resumeSecret!=="string")return NextResponse.json({error:"Invalid recovery credentials"},{status:400});
  state=await getSession(body.resumeSessionId);
  if(!state || state.secret!==body.resumeSecret || state.recipeId!==recipe.id || Date.now()-state.updatedAt>RECOVERY_MAX_AGE)return NextResponse.json({error:"This saved session is unavailable or expired. Start a new session."},{status:410});
  if(body.preferences!==undefined){state=configureAccess(state,body.preferences).state;await saveSession(state);}
 }else state=await createSession(recipe.id,normalizeAccess(body.preferences));
 const guidance=currentStep(state);state=guidance.state;await saveSession(state);
 return NextResponse.json({sessionId:state.id,secret:state.secret,state,recipe,guidance:guidance.result,warnings:[]},{headers:{"Cache-Control":"no-store"}});
}
