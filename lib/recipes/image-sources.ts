import sources from "./image-sources.json";
export type RecipePhotoSource = { image: string; author: string; license: string; licenseUrl: string; source: string; original: string; title: string; changes: string; checked: string; illustrative: boolean };
export const RECIPE_PHOTOS: Readonly<Record<string, RecipePhotoSource>> = sources;
