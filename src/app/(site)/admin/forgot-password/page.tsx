import { redirect } from "next/navigation";
import ForgotPasswordForm from "@/components/admin/ForgotPasswordForm";
import { cardClass } from "@/components/admin/styles";
import { authConfigured, getSession } from "@/lib/admin/auth";

export default async function AdminForgotPasswordPage() {
  if (await getSession()) redirect("/admin");

  return (
    <div className="mx-auto max-w-md pt-10">
      <div className={cardClass}>
        <h1 className="text-2xl font-medium tracking-tight">Reset your password</h1>
        <p className="mt-2 text-sm text-muted">Enter the email you sign in with and we will send you a link to choose a new password.</p>
        {!authConfigured() && (
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Firebase is not configured in this environment, so password reset is disabled. See .env.example.
          </p>
        )}
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
