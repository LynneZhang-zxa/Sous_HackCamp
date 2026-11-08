import { beforeEach, describe, expect, it, vi } from "vitest";
import { listRecipes, CREAMY_GARLIC_CHICKEN } from "./recipe";
import { newSession } from "./session";
import { POST } from "../app/api/call/start/route";
import { createSession } from "./store";
import { mintWsToken } from "./alebex";

vi.mock("./store", () => ({ createSession: vi.fn() }));
vi.mock("./alebex", () => ({
  mintWsToken: vi.fn().mockResolvedValue("test-token"),
  requireEnv: () => "test-agent", WS_URL: "wss://example.test/voice",
  resolvePublicBase: async () => ({ base: "https://example.test", source: "test" }),
}));
beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createSession).mockImplementation(async id => newSession(id, "test-session", "test-secret"));
});
const request = (body: object) => new Request("https://example.test/api/call/start", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

describe("call-start recipe selection with mocked Alebex", () => {
  for (const recipe of listRecipes()) it("starts a session and context for " + recipe.id, async () => {
    const response = await POST(request({ recipeId: recipe.id }));
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.recipe.id).toBe(recipe.id);
    expect(body.state.recipeId).toBe(recipe.id);
    expect(body.startCall.context).toContain(recipe.title);
    {
      expect(JSON.parse(body.startCall.knowledgeBase)).toEqual(recipe);
      expect(body.startCall.knowledgeBase).not.toContain("Substitutes for heavy cream");
    }
    expect(createSession).toHaveBeenCalledExactlyOnceWith(recipe.id);
  });
  it("preserves the default recipe", async () => {
    expect((await (await POST(request({}))).json()).recipe.id).toBe(CREAMY_GARLIC_CHICKEN.id);
  });
  it("rejects unknown IDs before creating sessions or contacting Alebex", async () => {
    expect((await POST(request({ recipeId: "unknown" }))).status).toBe(404);
    expect(createSession).not.toHaveBeenCalled();
    expect(mintWsToken).not.toHaveBeenCalled();
  });
});

for (const body of [null, [], {recipeId:null}, {recipeId:3}, {recipeId:["creamy-garlic-chicken"]}]) it("rejects malformed selection " + JSON.stringify(body), async () => {
 const response = await POST(new Request("https://example.test/api/call/start", {method:"POST", body:JSON.stringify(body)}));
 expect(response.status).toBe(400);
 expect(mintWsToken).not.toHaveBeenCalled();
});
it("rejects malformed JSON before contacting Alebex", async () => {
 expect((await POST(new Request("https://example.test/api/call/start", {method:"POST",body:"{"}))).status).toBe(400);
 expect(mintWsToken).not.toHaveBeenCalled();
});
