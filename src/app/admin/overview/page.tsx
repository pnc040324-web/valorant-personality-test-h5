import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { OverviewClient } from "@/components/admin/OverviewClient";

const tokenFor = (secret:string) => createHash("sha256").update(secret).digest("hex");

export default async function AdminOverviewPage() {
  const secret = process.env.ADMIN_SECRET;
  const token = (await cookies()).get("valorant_admin")?.value;
  if (!secret || !token) notFound();
  const expected = Buffer.from(tokenFor(secret));
  const received = Buffer.from(token);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) notFound();
  return <OverviewClient/>;
}
