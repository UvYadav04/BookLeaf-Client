"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHomePath } from "@/lib/auth";
import { saveAuth } from "@/lib/authStorage";
import { useSignupMutation } from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSession } from "@/store/slices/authSlice";

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const [signup, { isLoading, error }] = useSignupMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!hydrated || !user) return;
    router.push(getHomePath(user));
  }, [hydrated, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await signup({ name, email, password }).unwrap();
      dispatch(setSession({ user: data.user, tokens: data.tokens }));
      saveAuth(data.user, data.tokens);
      router.push(getHomePath(data.user));
    } catch {
      // handled by error state
    }
  }

  return (
    <main className="auth-page">
      <div className="card auth-card">
        <h1>Create account</h1>
        <p className="muted" style={{ margin: "0 0 24px" }}>
          Register as an author. Admin access uses the configured admin email only.
        </p>
        <form className="grid" onSubmit={onSubmit}>
          <label className="field">
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" required minLength={1} />
          </label>
          <label className="field">
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" />
          </label>
          <label className="field">
            Password
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>
          <button className="primary" disabled={isLoading} type="submit" style={{ marginTop: 8 }}>
            {isLoading ? "Creating account..." : "Sign up"}
          </button>
        </form>
        {error ? (
          <p style={{ color: "var(--danger)", marginTop: 16, fontSize: "0.9rem" }}>
            Signup failed. Email may already be registered.
          </p>
        ) : null}
        <p style={{ marginTop: 24, textAlign: "center", color: "var(--muted)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "var(--accent-hover)", fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
