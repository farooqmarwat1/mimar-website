import Link from "next/link";
import { cardClass } from "@/components/admin/styles";
import { canAccess, requireRole } from "@/lib/admin/auth";
import { isFirebaseConfigured } from "@/lib/firebase/admin";
import { listPostsAdmin } from "@/lib/posts";

export default async function AdminDashboardPage({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  const session = await requireRole();
  const { forbidden } = await searchParams;
  // Drafts (AI-written or by hand) that nobody has approved yet.
  const waiting =
    canAccess(session.role, "blog") && isFirebaseConfigured ? (await listPostsAdmin()).filter((post) => post.status === "draft").length : 0;

  return (
    <div>
      <h1 className="text-3xl font-medium tracking-tight">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Signed in as {session.email} ({session.role}).</p>
      {forbidden && (
        <p role="alert" className="mt-6 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          Your role does not have access to that section.
        </p>
      )}

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {canAccess(session.role, "jobs") && (
          <Link href="/admin/jobs" className={`${cardClass} transition-colors hover:border-ink`}>
            <p className="eyebrow text-muted">Careers</p>
            <h2 className="mt-3 text-xl font-medium">Job postings</h2>
            <p className="mt-2 text-sm text-muted">Add, edit and close open roles shown on /careers.</p>
          </Link>
        )}
        {canAccess(session.role, "blog") && (
          <Link href="/admin/blog" className={`${cardClass} transition-colors hover:border-ink`}>
            <p className="eyebrow text-muted">Blog</p>
            <h2 className="mt-3 text-xl font-medium">Articles</h2>
            <p className="mt-2 text-sm text-muted">Write, review and publish blog posts.</p>
            {waiting > 0 && (
              <p className="mt-4 inline-block rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
                {waiting} {waiting === 1 ? "draft is" : "drafts are"} waiting for your approval
              </p>
            )}
          </Link>
        )}
      </div>
    </div>
  );
}
