import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePostAction, translateNowAction } from "@/app/(site)/admin/blog/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import PostForm from "@/components/admin/PostForm";
import { dangerButtonClass, secondaryButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { aiConfigured } from "@/lib/ai/provider";
import { arabicState } from "@/lib/ai/translate-post";
import { blogCategories } from "@/lib/legacy-seo";
import { postToFormValues } from "@/lib/post-form-values";
import { checkPost } from "@/lib/post-validation";
import { getPostAdmin } from "@/lib/posts";

// Writing the Arabic version (the "Write Arabic now" button) can take a minute or two.
export const maxDuration = 300;

const ARABIC_MESSAGES: Record<string, string> = {
  ok: "The Arabic version was written and is live.",
  skipped: "No AI key is configured, so the Arabic version could not be written.",
  failed: "The Arabic version could not be written this time. Try again in a few minutes.",
};

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; blocked?: string; arabic?: string }>;
}) {
  await requireRole("blog");
  const { id } = await params;
  const { saved, blocked, arabic } = await searchParams;
  const post = await getPostAdmin(id);
  if (!post) notFound();

  const initial = postToFormValues(post);
  if (blocked === "1") {
    // Came from "Publish" on the list: show exactly what is stopping it.
    const { errors } = await checkPost({ ...post, legacy: post.legacy });
    initial.notes = [...Object.values(errors), ...initial.notes];
  }
  const arState = arabicState(post);

  return (
    <div>
      <Link href="/admin/blog" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All posts
      </Link>
      <div className="mb-8 mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-medium tracking-tight">{post.title || "Untitled"}</h1>
          <p className="mt-1 text-sm text-muted">
            {post.status}
            {post.origin === "ai" ? " · written by AI" : ""}
            {post.legacy ? " · imported from WordPress" : ""} · last edited by {post.updatedBy}
            {post.status === "published" && (
              <>
                {" · "}
                <Link href={post.path} target="_blank" className="text-accent hover:underline">
                  View live page
                </Link>
                {post.ar && (
                  <>
                    {" · "}
                    <Link href={`/ar${post.path}`} target="_blank" className="text-accent hover:underline">
                      View Arabic page
                    </Link>
                  </>
                )}
              </>
            )}
          </p>
        </div>
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton
            message={`Permanently delete "${post.title}"?${post.status === "published" ? ` ${post.path} will stop working (404) and it leaves the blog, the sitemap and search results.` : ""} This cannot be undone. Unpublish it instead if you may want it back.`}
            className={dangerButtonClass}
          >
            Delete
          </ConfirmButton>
        </form>
      </div>

      {arabic && ARABIC_MESSAGES[arabic] && (
        <p role="status" className={`mb-6 rounded-lg p-3 text-sm ${arabic === "ok" ? "bg-emerald-50 text-emerald-900" : "bg-amber-50 text-amber-900"}`}>
          {ARABIC_MESSAGES[arabic]}
        </p>
      )}

      <section className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-white p-5">
        <div className="max-w-2xl text-sm">
          <p className="font-medium">
            Arabic version:{" "}
            {arState === "current" && <span className="text-emerald-800">ready</span>}
            {arState === "outdated" && <span className="text-amber-800">out of date</span>}
            {arState === "none" && <span className="text-muted">not written yet</span>}
          </p>
          <p className="mt-1 text-muted">
            {arState === "current" && "It matches the English text and is shown at /ar" + post.path + "."}
            {arState === "outdated" && "The English text changed after the Arabic was written. Saving a published article refreshes it automatically, or write it now."}
            {arState === "none" && "It is written automatically when the article is published or generated."}
          </p>
        </div>
        {aiConfigured() && (
          <form action={translateNowAction}>
            <input type="hidden" name="id" value={post.id} />
            <input type="hidden" name="force" value={arState === "current" ? "1" : ""} />
            <ConfirmButton
              message={arState === "current" ? "Write the Arabic version again from the English text? This replaces the current Arabic text." : "Write the Arabic version now? It takes up to a minute."}
              className={secondaryButtonClass}
            >
              {arState === "current" ? "Rewrite Arabic" : "Write Arabic now"}
            </ConfirmButton>
          </form>
        )}
      </section>

      <PostForm initial={initial} categories={blogCategories.map(({ slug, label }) => ({ slug, label }))} saved={saved === "1"} />
    </div>
  );
}
