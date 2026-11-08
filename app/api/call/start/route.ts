import { NextResponse } from "next/server";
import { buildStartCall } from "@/lib/agent-config";
import { mintWsToken, requireEnv, resolvePublicBase, WS_URL } from "@/lib/alebex";
import { CREAMY_GARLIC_CHICKEN, getRecipe } from "@/lib/recipe";
import { normalizeAccess } from "@/lib/access-preferences";
import { configureAccess } from "@/lib/session";
import { RECOVERY_MAX_AGE } from "@/lib/cooking-recovery";
import { createSession, getSession, saveSession } from "@/lib/store";

export async function POST(req: Request) {
  try {
    let body: unknown;
    try { body = await req.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }
    if (!body || typeof body !== "object" || Array.isArray(body) || ("recipeId" in body && typeof body.recipeId !== "string")) {
      return NextResponse.json({ error: "recipeId must be a string" }, { status: 400 });
    }
    const { recipeId, preferences, resumeSessionId, resumeSecret } = body as { recipeId?: string; preferences?: unknown; resumeSessionId?: unknown; resumeSecret?: unknown };
    if ((resumeSessionId !== undefined || resumeSecret !== undefined) && (typeof resumeSessionId !== "string" || !resumeSessionId || typeof resumeSecret !== "string" || !resumeSecret)) return NextResponse.json({error:"Invalid recovery credentials"},{status:400});
    if (preferences !== undefined && (!preferences || typeof preferences !== "object" || Array.isArray(preferences))) return NextResponse.json({error:"Invalid preferences"},{status:400});
    const recipe = getRecipe(recipeId ?? CREAMY_GARLIC_CHICKEN.id);
    if (!recipe) return NextResponse.json({ error: "Unknown recipe" }, { status: 404 });

    let recovered = typeof resumeSessionId === "string" ? await getSession(resumeSessionId) : null;
    if (resumeSessionId && (!recovered || recovered.secret !== resumeSecret)) return NextResponse.json({error:"This saved session is no longer available. Start a new cooking session."},{status:410});
    if (recovered && (recovered.recipeId !== recipe.id || Date.now()-recovered.updatedAt>RECOVERY_MAX_AGE)) return NextResponse.json({error:"Saved session does not match this recipe or has expired. Start a new session."},{status:409});
    const agentId = requireEnv("ALEBEX_AGENT_ID");
    if (recovered && preferences !== undefined) {recovered=configureAccess(recovered,preferences).state;await saveSession(recovered);}
    const session = recovered ?? (preferences === undefined ? await createSession(recipe.id) : await createSession(recipe.id,normalizeAccess(preferences)));
    const { base, source } = await resolvePublicBase(req);
    const warnings: string[] = [];
    if (!base) warnings.push("No public https base for tools (start ngrok or set PUBLIC_BASE). The agent can talk but cannot change steps.");

    let token: string;
    try {
      token = await mintWsToken();
    } catch (e) {
      if (process.env.NODE_ENV === "production" && process.env.ALLOW_RAW_KEY !== "1") throw e;
      console.warn("[sous] token mint failed, using raw key for the socket:", (e as Error).message);
      token = requireEnv("ALEBEX_API_KEY");
      // Dev-only fallback; logged above, not shown to the cook.
    }

    console.log(`[sous] call start session=${session.id} tools=${base ?? "none"} (${source})`);
    return NextResponse.json({
      sessionId: session.id,
      secret: session.secret,
      wsUrl: WS_URL,
      subprotocol: `alebex.token.${token}`,
      startCall: buildStartCall(agentId, recipe, session, base),
      state: session,
      recipe,
      warnings,
    });
  } catch (e) {
    const message = (e as Error).message;
    console.error("[sous] call start failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
