import { describe, expect, it } from "vitest";
import { CREAMY_GARLIC_CHICKEN, listRecipes } from "./recipe";
import { newSession } from "./session";
import { buildContext, buildStartCall, buildTools, AGENT_PROMPT } from "./agent-config";

describe("agent config limits", () => {
  const s = newSession(CREAMY_GARLIC_CHICKEN.id, "s", "sec");
  it("context fits the 4,000 char limit and names the current step", () => {
    const c = buildContext(CREAMY_GARLIC_CHICKEN, s);
    expect(c.length).toBeLessThanOrEqual(4000);
    expect(c).toContain("haven't started yet");
  });
  it("preserves ninety seconds rather than rounding to two minutes", () => {
    expect(buildContext(CREAMY_GARLIC_CHICKEN, s)).toContain("one minute and 30 seconds");
  });
  for (const recipe of listRecipes()) {
    it(`uses only the selected recipe knowledge for ${recipe.id}`, () => {
      const state = newSession(recipe.id, "s", "sec");
      const call = buildStartCall("mock-agent", recipe, state, null);
      expect(JSON.parse(call.knowledgeBase)).toEqual(recipe);
      expect(call.context).toContain(`Recipe ID: ${recipe.id}`);
      expect(() => buildStartCall("mock-agent", recipe, { ...state, recipeId: "wrong-id" }, null)).toThrow("Recipe/session mismatch");
    });
  }
  it("tools are 8 or fewer with valid names and descriptions", () => {
    const tools = buildTools("https://example.com", s);
    expect(tools.length).toBeLessThanOrEqual(8);
    for (const t of tools) {
      expect(t.name).toMatch(/^[a-z][a-z0-9_-]{0,63}$/);
      expect(t.description.length).toBeLessThanOrEqual(1024);
      expect(t.url).toBe("https://example.com/api/tools");
      expect(JSON.stringify(t.parameters)).not.toContain("spoken_line");
    }
  });
  it("prompt has no placeholders or exclamation marks", () => {
    for (const text of [AGENT_PROMPT]) {
      expect(text).not.toMatch(/\{\{|\[[A-Z ]+\]/);
      expect(text).not.toContain("!");
    }
  });
  it("scopes advice to the selected recipe and handles uncertainty and failed changes", () => {
    expect(AGENT_PROMPT).toContain("only that selected recipe");
    expect(AGENT_PROMPT).toContain("say you don't know rather than inventing it");
    expect(AGENT_PROMPT).toContain("Never promise a dish or substitute is allergen-free");
    expect(AGENT_PROMPT).toContain("never use color, clear juices or cooking time alone");
    expect(AGENT_PROMPT).toContain("without a successful tool result");
    expect(AGENT_PROMPT).not.toContain("no pink inside");
  });
});
