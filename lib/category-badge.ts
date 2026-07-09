/** Pastel pill styles per category slug — matches the public preview card mockup. */
const CATEGORY_STYLES: Record<string, string> = {
  neuroradiology: "bg-emerald-100 text-emerald-800",
  cardiothoracic: "bg-sky-100 text-sky-800",
  "abdominal-radiology": "bg-violet-100 text-violet-800",
  basics: "bg-teal-100 text-teal-800",
  "breast-imaging": "bg-pink-100 text-pink-800",
  musculoskeletal: "bg-amber-100 text-amber-800",
  "interventional-radiology": "bg-rose-100 text-rose-800",
  "pediatric-radiology": "bg-cyan-100 text-cyan-800",
};

const FALLBACK = "bg-secondary text-secondary-foreground";

export function getCategoryBadgeClasses(slug: string | null): string {
  if (!slug) return FALLBACK;
  return CATEGORY_STYLES[slug] ?? FALLBACK;
}
