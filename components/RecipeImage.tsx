"use client";

import { useState } from "react";

export function RecipeImage({ src, title, className = "", loading = "lazy" }: {
  src: string; title: string; className?: string; loading?: "lazy" | "eager";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = !src || failedSrc === src ? "/recipes/placeholder.svg" : src;
  return <img src={image} alt={image.endsWith("placeholder.svg") ? `${title} — photo unavailable` : title} className={className} loading={loading} decoding="async"
    onError={() => setFailedSrc(src)} />;
}
