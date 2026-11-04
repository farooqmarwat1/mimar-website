/** Short joining words that carry no search meaning in an address. */
const FILLER = new Set(["a", "an", "the", "and", "or", "of", "for", "to", "in", "on", "with", "how"]);
const TRAILING_FILLER = /(-(?:a|an|the|and|or|of|for|to|in|on|with|how))+$/;

/** URL-safe slug: lowercase ASCII words joined by hyphens. */
export function slugify(input: string, maxLength = 80): string {
  const full = input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (full.length <= maxLength) return full;
  // Too long: cut at a word boundary so the address never ends mid-word ("...-in-riyad"),
  // and never on a joining word ("...-launches-in").
  const cut = full.slice(0, maxLength);
  const boundary = full[maxLength] === "-" ? maxLength : cut.lastIndexOf("-");
  return (boundary > maxLength / 2 ? full.slice(0, boundary) : cut).replace(/-+$/g, "").replace(TRAILING_FILLER, "");
}

/**
 * A blog post's address from its title: short and readable. Titles up to 60 characters are kept whole;
 * longer ones lose their joining words first ("how", "to", "for", "in"...) and are then cut at a word
 * boundary, so the subject and the place survive: "How to Deploy an Interactive Master Plan for Housing
 * Society Launches in Pakistan" -> "deploy-interactive-master-plan-housing-society-launches-pakistan".
 */
export function articleSlug(title: string, maxLength = 70): string {
  const full = slugify(title, 400);
  if (full.length <= 60) return full;
  let slug = "";
  for (const word of full.split("-").filter((item) => !FILLER.has(item))) {
    const next = slug ? `${slug}-${word}` : word;
    if (next.length > maxLength) break;
    slug = next;
  }
  return slug || slugify(title, maxLength);
}
