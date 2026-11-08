import { RECIPE_PHOTOS } from "@/lib/recipes/image-sources";
export function RecipePhotoCredit({ id }: { id: string }) {
 const photo = RECIPE_PHOTOS[id];
 if (!photo) return null;
 return <p className="mt-3 text-xs leading-relaxed text-muted" id="photo-credit">Illustrative photo: <a className="underline underline-offset-2" href={photo.source} target="_blank" rel="noreferrer">{photo.author}</a> · <a className="underline underline-offset-2" href={photo.licenseUrl} target="_blank" rel="noreferrer">{photo.license}</a>. Resized; display may crop the image.</p>;
}
