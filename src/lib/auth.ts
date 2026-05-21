import { User } from "@/lib/types";

export function isAdminUser(user: Pick<User, "role" | "isAdmin">): boolean {
  return user.isAdmin || user.role === "admin";
}

export function getHomePath(user: Pick<User, "role" | "isAdmin">): string {
  return isAdminUser(user) ? "/admin/tickets" : "/author/books";
}
