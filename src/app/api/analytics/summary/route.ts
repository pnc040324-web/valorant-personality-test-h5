import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

type EventRow = { eventType:string; source:string; agentResult:string|null; createdAt:Date };

/** Beta 概览只聚合必要字段，避免把原始用户事件暴露给前端。 */
export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const token = request.cookies.get("valorant_admin")?.value;
  if (!secret || !token) return new NextResponse(null, { status:404 });
  const expected = Buffer.from(createHash("sha256").update(secret).digest("hex"));
  const received = Buffer.from(token);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return new NextResponse(null, { status:404 });
  const empty = { pv:0, started:0, finished:0, shares:0, completionRate:0, shareRate:0, topAgents:[] as {agent:string;count:number}[] };
  if (!process.env.DATABASE_URL) return NextResponse.json(empty);
  try {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient();
    const events = await prisma.userEvent.findMany({ orderBy:{createdAt:"desc"}, take:10000 }) as EventRow[];
    const count = (type:string) => events.filter((event) => event.eventType === type).length;
    const agentCounts = new Map<string,number>();
    events.filter((event) => event.eventType === "agent_result" && event.agentResult).forEach((event) => agentCounts.set(event.agentResult!, (agentCounts.get(event.agentResult!) ?? 0) + 1));
    const started=count("question_start") + count("test_start"), finished=count("finish_test"), shares=count("share_click");
    return NextResponse.json({ pv:count("page_view"), started, finished, shares, completionRate:started?Math.round(finished / started * 1000) / 10:0, shareRate:finished?Math.round(shares / finished * 1000) / 10:0, topAgents:[...agentCounts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,10).map(([agent,count])=>({agent,count})) });
  } catch { return NextResponse.json(empty); }
}
