import { redirect } from "next/navigation";
import LoginForm from "@/components/admin/LoginForm";
import { cardClass } from "@/components/admin/styles";
import { authConfigured, getSession } from "@/lib/admin/auth";

export default async function AdminLoginPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className={cardClass}>
        <h1 className="text-2xl font-medium tracking-tight">Staff sign in</h1>
        <p className="mt-2 text-sm text-muted">For Mimar Studios HR and editors. Accounts are created by an administrator.</p>
        {!authConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Firebase is not configured in this environment, so sign-in is disabled. See .env.example.
          </p>
        )}
        <LoginForm />
      </div>
    </div>
  );
}
