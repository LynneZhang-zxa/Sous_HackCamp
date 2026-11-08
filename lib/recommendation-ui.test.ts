import { afterEach, expect, it, vi } from "vitest";
import { Recommendation } from "../components/Recommendation";
import { listRecipes } from "./recipe";
const hooks = vi.hoisted(() => ({ value: undefined as unknown, effect: undefined as undefined | (() => () => void) }));
vi.mock("react", () => ({
 useState: () => [hooks.value, (value: unknown) => { hooks.value = value; }],
 useEffect: (effect: () => () => void) => { hooks.effect = effect; },
}));
afterEach(() => { hooks.value = undefined; hooks.effect = undefined; vi.unstubAllGlobals(); });
it("loads the daily recipe, refreshes with Surprise Me, and cleans up its rollover timer", () => {
 const clearInterval = vi.fn();
 vi.stubGlobal("window", {setInterval:vi.fn(()=>42),clearInterval});
 Recommendation();
 const cleanup = hooks.effect!();
 const before = hooks.value;
 expect(listRecipes()).toContain(before);
 const card = Recommendation();
 const content = card.props.children[1].props.children[2];
 const actions = content.props.children[3].props.children;
 expect(actions[0].props.href).toBe(`/recipes/${(before as {id:string}).id}`);
 actions[1].props.onClick();
 expect(hooks.value).not.toBe(before);
 expect(listRecipes()).toContain(hooks.value);
 cleanup();
 expect(clearInterval).toHaveBeenCalledWith(42);
});
