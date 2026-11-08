import {describe,it,expect} from "vitest";
import {readyPlaybackMarks,type PlaybackMark} from "./playback-marks";
describe("voice turn completion acknowledgements",()=>{
 it("waits for prior audio but does not let later audio hold an earlier mark forever",()=>{
  const playing=new Set([1,2]);const queue:PlaybackMark<number,string>[]=[{frame:"first",pending:new Set([1])},{frame:"second",pending:new Set([1,2])}];
  expect(readyPlaybackMarks(queue,playing)).toEqual([]);playing.delete(1);expect(readyPlaybackMarks(queue,playing)).toEqual(["first"]);playing.delete(2);expect(readyPlaybackMarks(queue,playing)).toEqual(["second"]);
 });
 it("acknowledges all held marks after clear_audio stops the scheduled sources",()=>{
  const queue=[{frame:"one",pending:new Set([1,2])},{frame:"two",pending:new Set([2])}];expect(readyPlaybackMarks(queue,new Set<number>())).toEqual(["one","two"]);expect(queue).toEqual([]);
 });
 it("keeps turn order even when later sources finish first",()=>{
  const queue=[{frame:"one",pending:new Set([1])},{frame:"two",pending:new Set([2])}];expect(readyPlaybackMarks(queue,new Set([1]))).toEqual([]);expect(readyPlaybackMarks(queue,new Set<number>())).toEqual(["one","two"]);
 });
});
