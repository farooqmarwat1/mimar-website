/**
 * The old WordPress site had a /testing/ scratch page that was never real
 * content. Per the migration audit, serve a hard 410 Gone rather than
 * redirecting it anywhere, so it's cleanly dropped from the index instead
 * of passing equity to an unrelated page.
 */
export function GET() {
  return new Response("Gone", { status: 410 });
}
