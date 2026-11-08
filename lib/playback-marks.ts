export type PlaybackMark<T, M> = {frame:M; pending:Set<T>};
/** A mark waits only for audio received before that mark, preserving mark order. */
export function readyPlaybackMarks<T,M>(queue:PlaybackMark<T,M>[],playing:Set<T>):M[]{
 const ready:M[]=[];
 while(queue.length && ![...queue[0].pending].some(source=>playing.has(source)))ready.push(queue.shift()!.frame);
 return ready;
}
