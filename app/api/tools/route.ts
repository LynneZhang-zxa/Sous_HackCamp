import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { ToolName } from "@/lib/agent-config";
import {
  accessGuidance,
  cancelTimer,
  currentStep,
  jumpToStep,
  markTimerFired,
  nextStep,
  noteSubstitution,
  previousStep,
  setServings,
  startTimer,
  type Transition,
} from "@/lib/session";
import { getSession, saveSession, withSessionLock } from "@/lib/store";

type ToolBody = {
  tool: ToolName | string;
  arguments?: Record<string, unknown>;
  call?: { id?: string };
};

export async function POST(req: Request) {
 const sessionId=req.headers.get("x-sous-session");
 if(!sessionId)return NextResponse.json({error:"Unknown cooking session"},{status:401});
 return withSessionLock(sessionId,()=>handleTool(req));
}
async function handleTool(req: Request) {
  const sessionId = req.headers.get("x-sous-session");
  const secret = req.headers.get("x-sous-secret");
  const session = sessionId ? await getSession(sessionId) : null;
  if (!session || session.secret !== secret) {
    return NextResponse.json({ error: "Unknown cooking session" }, { status: 401 });
  }
  const body = (await req.json().catch(() => null)) as ToolBody | null;
  if (!body?.tool) return NextResponse.json({ error: "Missing tool name" }, { status: 400 });
  if (body.arguments && (typeof body.arguments !== "object" || Array.isArray(body.arguments))) return NextResponse.json({error:"Invalid tool arguments"},{status:400});
  const args = body.arguments ?? {};
  if (["label","ingredient","substitute","term","concern"].some(key=>args[key]!==undefined && typeof args[key]!=="string")) return NextResponse.json({error:"Invalid text argument"},{status:400});
  const now = Date.now();

  let t: Transition;
  switch (body.tool) {
    case "access_guidance":
      t = accessGuidance(session,args,now);
      break;
    case "next_step":
      t = nextStep(session, now);
      break;
    case "previous_step":
      t = previousStep(session, now);
      break;
    case "get_current_step":
      t = currentStep(session);
      break;
    case "jump_to_step":
      t = jumpToStep(session, Number(args.step_number), now);
      break;
    case "manage_timer": {
      const action = String(args.action ?? "start");
      if (action === "cancel") t = cancelTimer(session, args.label as string | undefined, now);
      else if (action === "fired") t = markTimerFired(session, String(args.timer_id ?? ""), now);
      else t = startTimer(session, args.label as string | undefined, args.seconds === undefined || args.seconds === null ? undefined : Number(args.seconds), randomUUID(), now);
      break;
    }
    case "note_substitution":
      t = noteSubstitution(session, String(args.ingredient ?? ""), String(args.substitute ?? ""), now);
      break;
    case "set_servings":
      t = setServings(session, Number(args.servings), now);
      break;
    default:
      return NextResponse.json({ error: `Unknown tool ${body.tool}` }, { status: 400 });
  }

  const next = { ...t.state, toolCalls: session.toolCalls + 1, callId: body.call?.id ?? session.callId };
  await saveSession(next);
  console.log(`[sous] ${session.id.slice(0, 8)} tool ${body.tool} ${JSON.stringify(args)} -> step ${next.stepIndex + 1} :: ${t.result.spoken}`);
  return NextResponse.json(t.result);
}
