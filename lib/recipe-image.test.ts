import { afterEach, describe, expect, it, vi } from "vitest";
import { RecipeImage } from "../components/RecipeImage";

const state = vi.hoisted(() => ({ value: null as string | null }));
vi.mock("react", () => ({ useState: () => [state.value, (value: string) => { state.value = value; }] }));
afterEach(() => { state.value = null; });

describe("recipe image fallback", () => {
  it("preserves photos and falls back to the existing local placeholder after an error", () => {
    const props = { src: "/recipes/chicken-curry.jpg", title: "Chicken Curry" };
    const photo = RecipeImage(props);
    expect(photo.props.src).toBe(props.src);
    photo.props.onError();
    const fallback = RecipeImage(props);
    expect(fallback.props.src).toBe("/recipes/placeholder.svg");
    expect(fallback.props.alt).toBe(props.title + " — photo unavailable");
    expect(RecipeImage({ ...props, src: "/recipes/bibimbap.jpg" }).props.src).toBe("/recipes/bibimbap.jpg");
  });
  it("uses a catalog placeholder without replacing it with an external image", () => {
    expect(RecipeImage({ src: "/recipes/placeholder.svg", title: "Miso Soup" }).props.src).toBe("/recipes/placeholder.svg");
  });
});
