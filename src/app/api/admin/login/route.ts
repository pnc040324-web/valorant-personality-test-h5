import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const cookieName = "valorant_admin";
const tokenFor = (secret:string) => createHash("sha256").update(secret).digest("hex");

/** 管理口令只在服务端校验，浏览器仅保存不可读的 HttpOnly 哈希 Cookie。 */
export async function POST(request: NextRequest) {
  const form = await request.formData();
  const submitted = String(form.get("secret") ?? "");
  const configured = process.env.ADMIN_SECRET;
  if (!configured) return new NextResponse(null, { status:404 });
  const left = Buffer.from(tokenFor(submitted));
  const right = Buffer.from(tokenFor(configured));
  if (left.length !== right.length || !timingSafeEqual(left, right)) return new NextResponse(null, { status:404 });
  // 登录 POST 后使用 303 切换为 GET，避免浏览器将 POST 重放到概览页。
  const response = NextResponse.redirect(new URL("/admin/overview", request.url), { status:303 });
  response.cookies.set(cookieName, tokenFor(configured), { httpOnly:true, sameSite:"strict", secure:process.env.NODE_ENV === "production", maxAge:60 * 60 * 8, path:"/admin" });
  return response;
}
