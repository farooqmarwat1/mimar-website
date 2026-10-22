import Link from "next/link";
import { setPostStatusAction } from "@/app/admin/blog/actions";
import { primaryButtonClass, secondaryButtonClass, statusBadgeClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { listPostsAdmin, type Post } from "@/lib/posts";

function Row({ post }: { post: Post }) {
  return (
    <li className="flex flex-wrap items-center gap-x-6 gap-y-3 p-5">
      <div className="min-w-0 flex-1">
        <Link href={`/admin/blog/${post.id}`} className="font-medium hover:text-accent">
          {post.title}
        </Link>
        <p className="mt-1 text-sm text-muted">
          /blog/{post.slug} · edited {post.updatedAt.slice(0, 10)} by {post.updatedBy}
        </p>
      </div>
      {post.origin === "ai" && <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-800">AI draft</span>}
      <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass[post.status] ?? ""}`}>{post.status}</span>
      <div className="flex items-center gap-5">
        <Link href={`/admin/blog/${post.id}`} className="text-xs uppercase tracking-[0.14em] hover:text-accent">
          {post.status === "draft" ? "Review" : "Edit"}
        </Link>
        <form action={setPostStatusAction}>
          <input type="hidden" name="id" value={post.id} />
          <input type="hidden" name="status" value={post.status === "published" ? "draft" : "published"} />
          <button type="submit" className="text-xs uppercase tracking-[0.14em] text-accent hover:underline">
            {post.status === "published" ? "Unpublish" : "Publish"}
          </button>
        </form>
        {post.status === "published" && (
          <Link href={`/blog/${post.slug}`} target="_blank" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
            View
          </Link>
        )}
      </div>
    </li>
  );
}

export default async function AdminBlogPage() {
  await requireRole("blog");
  const posts = isFirebaseConfigured ? await listPostsAdmin() : [];
  const drafts = posts.filter((post) => post.status === "draft");
  const published = posts.filter((post) => post.status === "published");

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">Blog</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Articles</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            The migrated WordPress articles are not listed here and cannot be changed from the portal; posts written here appear at the top of the blog.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/blog/generate" className={secondaryButtonClass}>
            Draft with AI
          </Link>
          <Link href="/admin/blog/new" className={primaryButtonClass}>
            New post
          </Link>
        </div>
      </div>

      {posts.length === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-line p-10 text-center text-sm text-muted">No posts yet.</p>
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
