"use client";

import { useState } from "react";

export function RecipeImage({ src, title, className = "", loading = "lazy" }: {
  src: string; title: string; className?: string; loading?: "lazy" | "eager";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const image = failedSrc === src ? "/recipes/placeholder.svg" : src;
  return <img src={image} alt={title} className={className} loading={loading}
    onError={() => setFailedSrc(src)} />;
}
