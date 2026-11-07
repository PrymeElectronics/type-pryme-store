import { cookies } from "next/headers";
import { adminToken, COOKIE } from "@/lib/auth";

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD) return Response.json({ error: "Set ADMIN_PASSWORD in Vercel first." }, { status: 500 });
  if (password !== process.env.ADMIN_PASSWORD) return Response.json({ error: "Wrong password." }, { status: 401 });
  cookies().set(COOKIE, adminToken(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.json({ ok: true });
}

export async function DELETE() {
  cookies().delete(COOKIE);
  return Response.json({ ok: true });
}
