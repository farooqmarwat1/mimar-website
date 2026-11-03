"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction, type LoginState } from "@/app/(site)/admin/actions";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/styles";

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className={labelClass}>
        Email
        <input name="email" type="email" autoComplete="username" required className={fieldClass} />
      </label>
      <div className={labelClass}>
        <label htmlFor="admin-password">Password</label>
        <div className="relative">
          <input
            id="admin-password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${fieldClass} pe-12`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            title={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-e-lg text-muted transition-colors hover:text-ink focus-visible:text-ink focus-visible:outline-none"
          >
            <EyeIcon off={showPassword} />
          </button>
        </div>
        <Link href="/admin/forgot-password" className="justify-self-end text-xs font-normal text-muted underline-offset-4 transition-colors hover:text-accent hover:underline">
          Forgot password?
        </Link>
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-accent">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className={primaryButtonClass}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
