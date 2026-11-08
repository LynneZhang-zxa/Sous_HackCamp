import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { listRecipes } from "./recipe";
import { CookScreen } from "../components/cook/CookScreen";

const mocks = vi.hoisted(() => ({ start: vi.fn(), onStart: undefined as undefined | (() => void) }));
vi.mock("@/components/voice/useVoiceCall", () => ({ useVoiceCall: () => ({
  status: "idle", state: null, recipe: null, error: null, start: mocks.start,
}) }));
vi.mock("@/components/cook/MicButton", () => ({ MicButton: ({ onClick }: { onClick: () => void }) => {
  mocks.onStart = onClick; return null;
} }));

describe("cooking screen start action", () => {
  for (const recipe of listRecipes()) it("previews and starts " + recipe.id, () => {
    mocks.start.mockClear();
    const html = renderToStaticMarkup(createElement(CookScreen, { selectedRecipe: recipe }));
    const escapedTitle = renderToStaticMarkup(createElement("span", null, recipe.title)).slice(6, -7);
    expect(html).toContain(escapedTitle);
    expect(mocks.start).not.toHaveBeenCalled();
    expect(mocks.onStart).toBeTypeOf("function");
    mocks.onStart!();
    expect(mocks.start).toHaveBeenCalledExactlyOnceWith(recipe.id);
  });
});
