"use client";
export function CuisineChips({ categories, selected, onSelect }: { categories: string[]; selected: string; onSelect: (cuisine: string) => void }) {
 const choices = ["", ...categories];
 if (selected && !categories.includes(selected)) choices.push(selected);
 return <div className="cuisine-chips" role="group" aria-label="Cuisine">
  {choices.map(c => <button type="button" key={c} aria-pressed={selected === c} onClick={() => onSelect(c)}>{c || "All"}</button>)}
 </div>;
}
