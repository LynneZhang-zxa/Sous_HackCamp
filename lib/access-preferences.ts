export const ACCESS_KEY = "sous-access-preferences-v1";
export const DEFAULT_ACCESS = { voiceFirst: false, oneAction: false, simplified: false, highContrast: false, slower: false, reducedTouch: false };
export type AccessPreferences = typeof DEFAULT_ACCESS;
export type AccessKey = keyof AccessPreferences;
export const ACCESS_OPTIONS: {key: AccessKey; label: string; description: string}[] = [
 {key:"voiceFirst",label:"Voice-first guidance",description:"Prioritize spoken instructions and action confirmations during a voice call."},
 {key:"oneAction",label:"One action at a time",description:"Move through the recipe sentence by sentence. Next finishes the current action before moving to a new step."},
 {key:"simplified",label:"Simplified instructions",description:"Use direct, concise guidance. Cooking terms can be explained without changing recipe facts."},
 {key:"highContrast",label:"Large text & high contrast",description:"Larger text, larger controls and a clear high-contrast reading view."},
 {key:"slower",label:"Slower guidance",description:"Shorter explanations with a wait for your reply. This changes pacing, not audio playback speed."},
 {key:"reducedTouch",label:"Reduced touch interaction",description:"Use keyboard controls and supported voice commands. No diagnosis or personal information needed."},
];
export function normalizeAccess(value: unknown): AccessPreferences {
 const safe = value && typeof value === "object" && !Array.isArray(value) ? value as Record<string,unknown> : {};
 return Object.fromEntries(Object.keys(DEFAULT_ACCESS).map(key => [key, typeof safe[key] === "boolean" ? safe[key] : false])) as AccessPreferences;
}
export function parseAccess(raw: string | null): AccessPreferences {
 try { return normalizeAccess(raw ? JSON.parse(raw) : null); } catch { return {...DEFAULT_ACCESS}; }
}
export function accessEnabled(prefs: AccessPreferences): boolean { return Object.values(prefs).some(Boolean); }
export function persistAccess(storage: Pick<Storage,"setItem">, preferences: AccessPreferences): boolean {
 try { storage.setItem(ACCESS_KEY, JSON.stringify(normalizeAccess(preferences))); return true; } catch { return false; }
}
