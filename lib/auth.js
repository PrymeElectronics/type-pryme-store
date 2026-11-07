import crypto from "crypto";
import { cookies } from "next/headers";

export const COOKIE = "pe_admin";

export function adminToken() {
  return crypto.createHash("sha256").update("pryme-admin:" + (process.env.ADMIN_PASSWORD || "")).digest("hex");
}

export function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  return cookies().get(COOKIE)?.value === adminToken();
}
