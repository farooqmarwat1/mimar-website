"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/admin/actions";
import { fieldClass, labelClass, primaryButtonClass } from "@/components/admin/styles";

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={action} className="mt-8 grid gap-5">
      <label className={labelClass}>
        Email
        <input name="email" type="email" autoComplete="username" required className={fieldClass} />
      </label>
      <label className={labelClass}>
        Password
        <input name="password" type="password" autoComplete="current-password" required className={fieldClass} />
      </label>
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
