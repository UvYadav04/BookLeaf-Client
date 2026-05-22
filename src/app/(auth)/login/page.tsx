"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getHomePath } from "@/lib/auth";
import { getApiErrorMessage } from "@/lib/apiError";
import { useLoginMutation } from "@/store/api/authApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setSession } from "@/store/slices/authSlice";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("rohit.kapoor@email.com");
  const [password, setPassword] = useState("12345678");

  useEffect(() => {
    if (!hydrated || !user) return;
    router.push(getHomePath(user));
  }, [hydrated, user, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await login({ email, password }).unwrap();
      dispatch(setSession({ user: data.user, tokens: data.tokens }));
      toast.info("Signed in successfully.");
      router.push(getHomePath(data.user));
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Login failed. Check your credentials."));
    }
  }

  return (
    <main className="auth-page">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p className="muted" style={{ margin: "0 0 24px" }}>
          Sign in to manage books and support tickets.
        </p>
        <form className="grid" onSubmit={onSubmit}>
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
              autoComplete="current-password"
            />
          </label>
          <button className="primary" disabled={isLoading} type="submit" style={{ marginTop: 8 }}>
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p style={{ marginTop: 24, textAlign: "center", color: "var(--muted)" }}>
          New here?{" "}
          <Link href="/signup" style={{ color: "var(--accent-hover)", fontWeight: 600 }}>
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
