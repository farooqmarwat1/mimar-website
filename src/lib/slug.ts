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
  // Too long: cut at a word boundary so the address never ends mid-word ("...-in-riyad").
  const cut = full.slice(0, maxLength);
  const boundary = full[maxLength] === "-" ? maxLength : cut.lastIndexOf("-");
  return (boundary > maxLength / 2 ? full.slice(0, boundary) : cut).replace(/-+$/g, "");
}
