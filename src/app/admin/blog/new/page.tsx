import Link from "next/link";
import PostForm from "@/components/admin/PostForm";
import { requireRole } from "@/lib/admin/auth";
import { blogCategories } from "@/lib/legacy-seo";
import { emptyPostForm } from "@/lib/post-form-values";

export default async function NewPostPage() {
  await requireRole("blog");
  return (
    <div>
      <Link href="/admin/blog" className="text-xs uppercase tracking-[0.14em] text-muted hover:text-ink">
        ← All posts
      </Link>
      <h1 className="mb-8 mt-3 text-3xl font-medium tracking-tight">New post</h1>
      <PostForm initial={emptyPostForm} categories={blogCategories.map(({ slug, label }) => ({ slug, label }))} />
    </div>
  );
}
