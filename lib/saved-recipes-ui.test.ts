import { afterEach, describe, expect, it, vi } from "vitest";
import { SaveRecipe } from "../components/SavedRecipes";
import { listRecipes } from "./recipe";
import { SAVED_KEY } from "./saved-recipes";

// Run the component's actual effect and handlers with deterministic hook state.
// This covers storage/event wiring; browser hydration is a separate check.
const hooks = vi.hoisted(() => ({ values: [] as unknown[], cursor: 0, effect: undefined as undefined | (() => void | (() => void)) }));
vi.mock("react", () => ({
  useState: (initial: unknown) => {
    const index = hooks.cursor++;
    if (!(index in hooks.values)) hooks.values[index] = initial;
    return [hooks.values[index], (value: unknown) => { hooks.values[index] = value; }];
  },
  useEffect: (effect: () => void | (() => void)) => { hooks.effect = effect; },
}));
afterEach(() => { hooks.values = []; hooks.cursor = 0; hooks.effect = undefined; vi.unstubAllGlobals(); });

describe("saved recipe UI storage events", () => {
  it("loads, saves, reloads external changes, recovers storage errors and removes listeners", () => {
    const events = new EventTarget();
    const storage = new Map<string, string>();
    const getItem = vi.fn((key: string) => storage.get(key) ?? null);
    const setItem = vi.fn((key: string, value: string) => { storage.set(key, value); });
    vi.stubGlobal("window", events);
    vi.stubGlobal("localStorage", { getItem, setItem });
    const id = listRecipes().at(-1)!.id;
    const render = () => { hooks.cursor = 0; return SaveRecipe({ id }); };
    const button = () => render().props.children[0];
    expect(button().props.disabled).toBe(true);
    const cleanup = hooks.effect!();
    expect(button().props.disabled).toBe(false);
    button().props.onClick();
    expect(JSON.parse(storage.get(SAVED_KEY)!)).toEqual([id]);
    expect(button().props["aria-pressed"]).toBe(true);
    storage.set(SAVED_KEY, "[]");
    events.dispatchEvent(new Event("storage"));
    expect(button().props["aria-pressed"]).toBe(false);
    getItem.mockImplementationOnce(() => { throw new Error("Storage denied"); });
    events.dispatchEvent(new Event("storage"));
    expect(hooks.values[2]).toContain("storage is unavailable");
    events.dispatchEvent(new Event("storage"));
    expect(hooks.values[2]).toBe("");
    setItem.mockImplementationOnce(() => { throw new Error("Quota exceeded"); });
    button().props.onClick();
    expect(button().props["aria-pressed"]).toBe(false);
    expect(hooks.values[2]).toContain("Could not save");
    button().props.onClick();
    expect(hooks.values[2]).toBe("");
    expect(button().props["aria-pressed"]).toBe(true);
    if (cleanup) cleanup();
    const reads = getItem.mock.calls.length;
    events.dispatchEvent(new Event("storage"));
    events.dispatchEvent(new Event("sous-saved"));
    expect(getItem.mock.calls.length).toBe(reads);
  });
});
