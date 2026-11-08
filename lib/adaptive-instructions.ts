import type { Step } from "./recipe";
// Segmentation only: no quantities, temperatures, conditions or source wording are rewritten.
// Keep compound clauses together when splitting could detach a condition from an action.
const ACTION_VERBS = "add|chop|cut|dice|mince|grate|slice|peel|wash|rinse|drain|pat|season|mix|whisk|stir|pour|heat|turn|remove|transfer|cover|uncover|cook|simmer|bake|roast|serve|sprinkle|scatter|divide|arrange|place|put|bring|reduce|fold";
const ACTION_BOUNDARY = new RegExp(`(?<=,)\\s+(?=(?:then\\s+)?(?:${ACTION_VERBS})\\b)|\\s+(?=(?:and|then)\\s+(?:${ACTION_VERBS})\\b)`, "i");
export function instructionActions(step: Step): string[] {
 const sentences = step.instruction.split(/(?<=[.!?])\s+(?=[A-Z])/).map(s=>s.trim()).filter(Boolean);
 return sentences.flatMap(sentence => {
  // Do not separate a leading condition from the action it qualifies.
  if(/^(if|when|once|until|while|before|after)\b/i.test(sentence))return [sentence];
  const clauses=sentence.split(ACTION_BOUNDARY);
  const safe:string[]=[];
  for(const clause of clauses){
   // Short coordinated verbs may share an object ("Cover and cook the rice"). Keep them together.
   if(safe.length && safe[safe.length-1].split(/\s+/).length<3)safe[safe.length-1]+=" "+clause;
   else safe.push(clause);
  }
  return safe;
 });
}
export const COOKING_TERMS: Readonly<Record<string,string>> = {
 simmer: "Simmer means cook gently with small bubbles. Use the heat and time specified in this recipe.",
 saute: "Saute means cook in a little fat, stirring or turning the food. Keep the recipe's heat setting.",
 sear: "Sear means brown the surface in a hot pan. Browning alone does not establish safe internal temperature.",
 deglaze: "Deglaze means add the recipe's liquid to loosen browned food from the pan. Watch for steam.",
 mince: "Mince means cut into very small pieces. Keep fingers clear of the blade; ask for help if this is not comfortable.",
 fold: "Fold means gently lift and turn the mixture together, rather than stirring vigorously.",
};
export function explainTerm(term: string): string {
 const key = term.toLowerCase().trim().replace(/é/g,"e");
 return COOKING_TERMS[key] ?? "I do not have a verified explanation for that term. Ask for the current instruction again; its ingredients, quantities and safety requirements have not changed.";
}

const PLAIN_TERMS: Readonly<Record<string,string>> = {
 simmer:"cook gently with small bubbles", saute:"cook in a little fat while stirring or turning", sear:"brown the surface; this alone does not verify doneness", deglaze:"loosen browned food with the recipe's liquid", mince:"cut into very small pieces", fold:"gently lift and turn together",
};
export function plainInstruction(text: string): string {
 return text.replace(/\b(simmer|saute|sear|deglaze|mince|fold)\b/gi, term => `${term} (${PLAIN_TERMS[term.toLowerCase()]})`);
}
