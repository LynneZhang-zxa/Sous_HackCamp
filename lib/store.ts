import { randomUUID, randomBytes } from "node:crypto";
import { configureAccess, newSession, type SessionState } from "./session";
import { supabaseAdmin } from "./supabase";

// In-memory first (fast, reliable for a single dev server), mirrored to Supabase so a
// multi-instance deployment can read a session another instance wrote.
const g = globalThis as unknown as { __sousSessions?: Map<string, SessionState> };
const memory = (g.__sousSessions ??= new Map<string, SessionState>());

export async function createSession(recipeId: string, preferences?: unknown): Promise<SessionState> {
  let state = newSession(recipeId, randomUUID(), randomBytes(16).toString("hex"));
  if (preferences !== undefined) state = configureAccess(state,preferences).state;
  memory.set(state.id, state);
  await mirror(state);
  return state;
}

export async function getSession(id: string): Promise<SessionState | null> {
  const hit = memory.get(id);
  if (hit) return hit;
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from("cooking_sessions").select("state").eq("id", id).maybeSingle();
  if (error) console.warn("[sous] supabase read failed", error.message);
  const state = (data?.state as SessionState | undefined) ?? null;
  if (state) memory.set(id, state);
  return state;
}

export async function saveSession(state: SessionState): Promise<void> {
  memory.set(state.id, state);
  await mirror(state);
}

async function mirror(state: SessionState) {
  const sb = supabaseAdmin();
  if (!sb) return;
  const { error } = await sb.from("cooking_sessions").upsert({
    id: state.id,
    recipe_id: state.recipeId,
    state,
    status: state.status,
    step_index: state.stepIndex,
    call_id: state.callId,
    updated_at: new Date(state.updatedAt).toISOString(),
  });
  if (error) console.warn("[sous] supabase write failed", error.message);
}

// Serialize tool actions on this server, so screen and voice updates do not overwrite one another.
const queues = new Map<string,Promise<unknown>>();
export async function withSessionLock<T>(id: string, action: () => Promise<T>): Promise<T> {
 const previous=queues.get(id) ?? Promise.resolve();
 const current=previous.catch(()=>{}).then(action);queues.set(id,current);
 try{return await current;}finally{if(queues.get(id)===current)queues.delete(id);}
}
