import Link from "next/link";
import { deletePostAction, importLegacyAction, setPostStatusAction } from "@/app/(site)/admin/blog/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { fieldClass, primaryButtonClass, secondaryButtonClass, statusBadgeClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { strategyInfo } from "@/lib/ai/keyword-plan";
import { isLegacyImported } from "@/lib/blog-import";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { listPostRows, type PostRow } from "@/lib/posts";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "draft", label: "Drafts" },
  { key: "published", label: "Published" },
  { key: "imported", label: "Imported from WordPress" },
  { key: "ai", label: "Written by AI" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matches(post: PostRow, filter: FilterKey) {
  if (filter === "draft") return post.status === "draft";
  if (filter === "published") return post.status === "published";
  if (filter === "imported") return Boolean(post.legacy);
  if (filter === "ai") return post.origin === "ai";
  return true;
}

function Row({ post }: { post: PostRow }) {
  const unpublishNote = `Unpublish "${post.title}"? ${post.path} will stop working (404) and it disappears from the blog, the sitemap and search results until you publish it again.`;
  return (
    <li className="flex flex-wrap items-center gap-x-5 gap-y-3 p-5">
      <div className="min-w-0 flex-1">
        <Link href={`/admin/blog/${post.id}`} className="font-medium hover:text-accent">
          {post.title || "Untitled"}
        </Link>
        <p className="mt-1 text-sm text-muted">
          {post.path} · edited {post.updatedAt.slice(0, 10)} by {post.updatedBy}
        </p>
      </div>
      {post.legacy && <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">WordPress</span>}
      {post.origin === "ai" && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">AI draft</span>}
      {strategyInfo(post.strategy) && (
        <span title="Blog type, compared in Blog performance" className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          {strategyInfo(post.strategy)!.label}
        </span>
      )}
      <span
        title={post.arState === "none" ? "No Arabic version yet" : "Has an Arabic version"}
        className={`rounded-full px-3 py-1 text-xs font-medium ${post.arState === "none" ? "bg-neutral-100 text-neutral-500" : "bg-emerald-50 text-emerald-800"}`}
      >
        {post.arState === "none" ? "No AR" : "AR"}
      </span>
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass[post.status] ?? ""}`}>{post.status}</span>
      <div className="flex flex-wrap items-center gap-5">
        <Link href={`/admin/blog/${post.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-accent">
          {post.status === "draft" ? "Review" : "Edit"}
        </Link>
        <form action={setPostStatusAction}>
          <input type="hidden" name="id" value={post.id} />
          <input type="hidden" name="status" value={post.status === "published" ? "draft" : "published"} />
          {post.status === "published" ? (
            <ConfirmButton message={unpublishNote} className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
              Unpublish
            </ConfirmButton>
          ) : (
            <button type="submit" className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
              Publish
            </button>
          )}
        </form>
        {post.status === "published" && (
          <Link href={post.path} target="_blank" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
            View
          </Link>
        )}
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton
            message={`Permanently delete "${post.title}"?${post.status === "published" ? ` ${post.path} will stop working (404).` : ""} This cannot be undone. Unpublish it instead if you may want it back.`}
            className="text-xs uppercase tracking-[0.14em] text-muted hover:text-accent"
          >
            Delete
          </ConfirmButton>
        </form>
      </div>
    </li>
  );
}

export default async function AdminBlogPage({ searchParams }: { searchParams: Promise<{ filter?: string; q?: string; imported?: string }> }) {
  await requireRole("blog");
  const { filter: rawFilter, q = "", imported } = await searchParams;
  const filter: FilterKey = FILTERS.some((item) => item.key === rawFilter) ? (rawFilter as FilterKey) : "all";

  const [posts, alreadyImported] = isFirebaseConfigured ? await Promise.all([listPostRows(), isLegacyImported()]) : [[], true];
  const needle = q.trim().toLowerCase();
  const visible = posts.filter((post) => matches(post, filter) && (!needle || `${post.title} ${post.path}`.toLowerCase().includes(needle)));
  const drafts = visible.filter((post) => post.status === "draft");
  const published = visible.filter((post) => post.status === "published");
  const count = (key: FilterKey) => posts.filter((post) => matches(post, key)).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Articles</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Every article on the website, including the ones imported from WordPress. Changes go live on the blog right away. The Arabic version of each article is written automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog/performance" className={secondaryButtonClass}>
            Performance
          </Link>
          <Link href="/admin/blog/generate" className={secondaryButtonClass}>
            Draft with AI
          </Link>
          <Link href="/admin/blog/new" className={primaryButtonClass}>
            New post
          </Link>
        </div>
      </div>

      {imported && (
        <p role="status" className="mt-6 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-900">
          {Number(imported) > 0 ? `Imported ${imported} articles from WordPress. They now appear below and can be edited here.` : "Nothing to import: the WordPress articles are already here."}
        </p>
      )}

      {!alreadyImported && (
        <section className="mt-8 rounded-2xl border border-sky-200 bg-sky-50 p-6">
          <h2 className="text-lg font-medium text-sky-950">Bring the existing blog articles into the portal</h2>
          <p className="mt-2 max-w-2xl text-sm text-sky-900">
            The 45 articles already on mim.archi (English and Arabic) are not editable here yet. Importing copies them in with the same addresses, text, dates and category order, so nothing changes on the site. From then on you can edit, unpublish or delete any of them. It is safe to run once; running it again changes nothing.
          </p>
          <form action={importLegacyAction} className="mt-4">
            <ConfirmButton message="Import the existing blog articles into the portal? Nothing on the website changes." className={primaryButtonClass}>
              Import existing articles
            </ConfirmButton>
          </form>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter articles" className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <Link
              key={item.key}
              href={`/admin/blog?filter=${item.key}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              aria-current={filter === item.key ? "page" : undefined}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium uppercase tracking-[0.12em] ${filter === item.key ? "border-ink bg-ink text-paper" : "border-line hover:border-ink"}`}
            >
              {item.label} ({count(item.key)})
            </Link>
          ))}
        </nav>
        <form action="/admin/blog" className="flex gap-2">
          <input type="hidden" name="filter" value={filter} />
          <input type="search" name="q" defaultValue={q} placeholder="Search title or address" aria-label="Search articles" className={`${fieldClass} w-64`} />
        </form>
      </div>

      {visible.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">
          {posts.length === 0 ? "No articles yet." : "No articles match."}
        </p>
      )}

      {drafts.length > 0 && (
        <>
          <h2 className="eyebrow mb-3 mt-10 text-muted">Drafts waiting ({drafts.length})</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {drafts.map((post) => (
              <Row key={post.id} post={post} />
            ))}
          </ul>
        </>
      )}
      {published.length > 0 && (
        <>
          <h2 className="eyebrow mb-3 mt-10 text-muted">Published ({published.length})</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
            {published.map((post) => (
              <Row key={post.id} post={post} />
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
