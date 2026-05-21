"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getHomePath } from "@/lib/auth";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const hydrated = useAppSelector((s) => s.auth.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(getHomePath(user));
  }, [hydrated, user, router]);

  return (
    <main className="page">
      <p className="empty-state">Redirecting...</p>
    </main>
  );
}
