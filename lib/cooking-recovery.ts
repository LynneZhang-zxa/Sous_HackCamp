export const RECOVERY_KEY="sous-cooking-recovery-v1";
export const RECOVERY_MAX_AGE=12*60*60*1000;
export type CookingRecovery={sessionId:string;secret:string;recipeId:string;savedAt:number};
export function parseRecovery(raw:string|null,recipeId:string,now=Date.now()):CookingRecovery|null {
 try{const s=JSON.parse(raw ?? "null");if(!s || typeof s.sessionId!=="string" || !s.sessionId || typeof s.secret!=="string" || !s.secret || s.recipeId!==recipeId || typeof s.savedAt!=="number" || s.savedAt>now || now-s.savedAt>RECOVERY_MAX_AGE)return null;return s;}catch{return null;}
}
