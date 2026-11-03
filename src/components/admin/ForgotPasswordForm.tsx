"use client";

import Link from "next/link";
import { useActionState } from "react";
import { forgotPasswordAction, type ForgotState } from "@/app/(site)/admin/actions";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/styles";

export default function ForgotPasswordForm() {
  const [state, action, pending] = useActionState<ForgotState, FormData>(forgotPasswordAction, {});

  if (state.sent) {
    return (
      <div className="mt-8 grid gap-5">
        <p role="status" className="rounded-lg bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-900">
          If that email belongs to a staff account, we have sent it a link to choose a new password. Check your inbox and your spam folder. The link works
          once and expires in about an hour.
        </p>
        <Link href="/admin/login" className="text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
          ← Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className={labelClass}>
        Email
        <input name="email" type="email" autoComplete="username" required autoFocus className={fieldClass} />
      </label>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Sending…" : "Send reset link"}
      </button>
      <Link href="/admin/login" className="text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-ink">
        ← Back to sign in
      </Link>
    </form>
  );
}
