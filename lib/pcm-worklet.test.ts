import {readFileSync} from "node:fs";
import {runInNewContext} from "node:vm";
import {describe,it,expect} from "vitest";
const source=readFileSync("public/pcm-worklet.js","utf8");
describe("microphone streaming resampler",()=>{
 for(const rate of [16000,44100,48000])it(`preserves continuous timing at ${rate} Hz across 128-sample blocks`,()=>{
  const frames:ArrayBuffer[]=[];let Processor:any;
  class Base {port={postMessage:(data:ArrayBuffer)=>frames.push(data)};}
  runInNewContext(source,{AudioWorkletProcessor:Base,sampleRate:rate,registerProcessor:(_name:string,p:unknown)=>{Processor=p;}});
  const processor=new Processor();
  for(let offset=0;offset<rate*2;offset+=128){const input=Float32Array.from({length:Math.min(128,rate*2-offset)},(_,i)=>.2*Math.sin((offset+i)*2*Math.PI*440/rate));processor.process([[input]]);}
  expect(Math.abs(frames.length*320+processor.n-32000)).toBeLessThanOrEqual(1);
  expect(frames.every(frame=>frame.byteLength===640)).toBe(true);
  expect(frames.some(frame=>new Int16Array(frame).some(n=>Math.abs(n)>100))).toBe(true);
 });
 it("does not emit fabricated audio without an input channel",()=>{
  const frames:ArrayBuffer[]=[];let Processor:any;class Base{port={postMessage:(d:ArrayBuffer)=>frames.push(d)};}
  runInNewContext(source,{AudioWorkletProcessor:Base,sampleRate:48000,registerProcessor:(_n:string,p:unknown)=>{Processor=p;}});
  expect(new Processor().process([])).toBe(true);expect(frames).toEqual([]);
 });
});
