import {describe,it,expect} from "vitest";
import {cleanVoiceTranscript} from "./voice-transcript";
describe("voice transcript presentation",()=>{
 it("removes the provider delimiter shown in the cooking transcript",()=>expect(cleanVoiceTranscript("Then, move them to a clean plate.<turn|>")).toBe("Then, move them to a clean plate."));
 it("removes common known turn delimiter variants",()=>{for(const token of ["<|turn|>","<turn>","<|eot_id|>","<|im_end|>","<end_of_turn>"])expect(cleanVoiceTranscript("Keep cooking."+token)).toBe("Keep cooking.");});
 it("does not show a delimiter-only message or an unfinished known delimiter",()=>{expect(cleanVoiceTranscript("<turn|>")).toBe("");expect(cleanVoiceTranscript("Done.<turn|")).toBe("Done.");});
 it("preserves recipe quantities, temperatures and comparison symbols",()=>{const text="Use < 5 g salt. Cook to 165°F (74°C), then wait > 3 minutes.";expect(cleanVoiceTranscript(text)).toBe(text);});
});
