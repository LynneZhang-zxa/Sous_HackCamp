import { afterEach, describe, expect, it, vi } from "vitest";
import { listRecipes } from "./recipe";
import { useVoiceCall } from "../components/voice/useVoiceCall";

// Execute only the request portion of the existing hook; no browser audio or external calls.
vi.mock("react", () => ({
  useCallback: (fn: unknown) => fn,
  useEffect: () => {},
  useRef: (value: unknown) => ({ current: value }),
  useState: (value: unknown) => [value, () => {}],
}));
afterEach(() => vi.unstubAllGlobals());

describe("voice start request", () => {
  for (const recipe of listRecipes()) it("sends selected ID " + recipe.id + " to call/start", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: "Stopped before microphone and socket setup" }) });
    vi.stubGlobal("fetch", fetchMock);
    await useVoiceCall().start(recipe.id);
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith("/api/call/start", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ recipeId: recipe.id }),
    });
  });
});
