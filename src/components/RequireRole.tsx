"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHomePath, isAdminUser } from "@/lib/auth";
import { useAppSelector } from "@/store/hooks";

export default function RequireRole({ role, children }: { role: "author" | "admin"; children: ReactNode }) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);

  const userIsAdmin = user ? isAdminUser(user) : false;
  const allowed = role === "admin" ? userIsAdmin : user?.role === "author" && !userIsAdmin;

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    if (!allowed) {
      router.push(getHomePath(user));
    }
  }, [hydrated, user, allowed, router]);

  if (!hydrated || !user || !allowed) {
    return (
      <main className="page">
        <p className="empty-state">Loading...</p>
      </main>
    );
  }

  return <>{children}</>;
}
