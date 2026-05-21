"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isAdminUser } from "@/lib/auth";
import { clearAuth } from "@/lib/authStorage";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearSession } from "@/store/slices/authSlice";

export default function TopNav() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const showAuthorNav = user.role === "author" && !isAdminUser(user);

  return (
    <nav className="app-nav">
      <div className="app-nav-inner">
        <Link href={showAuthorNav ? "/author/books" : "/admin/tickets"} className="brand">
          BookLeaf
        </Link>
        <div className="nav-links">
          {showAuthorNav ? (
            <>
              <Link
                href="/author/books"
                className={`nav-link ${pathname.includes("/author/books") ? "active" : ""}`}
              >
                My Books
              </Link>
              <Link
                href="/author/tickets"
                className={`nav-link ${pathname.includes("/author/tickets") ? "active" : ""}`}
              >
                My Tickets
              </Link>
            </>
          ) : (
            <Link
              href="/admin/tickets"
              className={`nav-link ${pathname.includes("/admin/tickets") ? "active" : ""}`}
            >
              Ticket Queue
            </Link>
          )}
          <span className="user-pill">
            {user.name}
            {isAdminUser(user) ? " · Admin" : ""}
          </span>
          <button
            type="button"
            className="ghost"
            onClick={() => {
              dispatch(clearSession());
              clearAuth();
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
