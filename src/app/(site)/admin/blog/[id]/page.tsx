import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePostAction } from "@/app/(site)/admin/blog/actions";
import ConfirmButton from "@/components/admin/ConfirmButton";
import PostForm from "@/components/admin/PostForm";
import { dangerButtonClass } from "@/components/admin/styles";
import { requireRole } from "@/lib/admin/auth";
import { blogCategories } from "@/lib/legacy-seo";
import { postToFormValues } from "@/lib/post-form-values";
import { checkPost } from "@/lib/post-validation";
import { getPostAdmin } from "@/lib/posts";

export default async function EditPostPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; blocked?: string }>;
}) {
  await requireRole("blog");
  const { id } = await params;
  const { saved, blocked } = await searchParams;
  const post = await getPostAdmin(id);
  if (!post) notFound();

  const initial = postToFormValues(post);
  if (blocked === "1") {
    // Came from "Publish" on the list: show exactly what is stopping it.
    const { errors } = await checkPost(post);
    initial.notes = [...Object.values(errors), ...initial.notes];
  }

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
            {post.origin === "ai" ? " · written by AI" : ""} · last edited by {post.updatedBy}
            {post.status === "published" && (
              <>
                {" · "}
                <Link href={`/blog/${post.slug}`} target="_blank" className="text-accent hover:underline">
                  View live page
                </Link>
              </>
            )}
          </p>
        </div>
        <form action={deletePostAction}>
          <input type="hidden" name="id" value={post.id} />
          <ConfirmButton message={`Permanently delete "${post.title}"? Unpublish it instead if you may want it back.`} className={dangerButtonClass}>
            Delete
          </ConfirmButton>
        </form>
      </div>
      <PostForm initial={initial} categories={blogCategories.map(({ slug, label }) => ({ slug, label }))} saved={saved === "1"} />
    </div>
  );
}
