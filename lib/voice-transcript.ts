/** Remove known model turn delimiters, without treating recipe comparisons as markup. */
export function cleanVoiceTranscript(text: string): string {
 return text
  .replace(/<\|?(?:turn|endofturn|end_of_turn|eot_id|eom_id|endoftext|im_end)\|?>/gi, "")
  .replace(/<\|?(?:turn|endofturn|end_of_turn|eot_id|eom_id|endoftext|im_end)\|?$/gi, "")
  .trim();
}
