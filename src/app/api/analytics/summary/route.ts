import { createHash, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type EventRow = { eventType: string; source: string; agentResult: string | null; createdAt: Date };
type AnalyticsStatus = "connected" | "not_configured" | "unavailable";

const tokenFor = (secret: string) => createHash("sha256").update(secret).digest("hex");

function emptySummary(status: AnalyticsStatus, message?: string) {
  return {
    pv: 0,
    started: 0,
    finished: 0,
    shares: 0,
    completionRate: 0,
    shareRate: 0,
    topAgents: [] as { agent: string; count: number }[],
    status,
    message,
  };
}

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  const globalForPrisma = globalThis as unknown as { analyticsPrisma?: InstanceType<typeof PrismaClient> };
  globalForPrisma.analyticsPrisma ??= new PrismaClient();
  return globalForPrisma.analyticsPrisma;
}

export async function GET(request: NextRequest) {
  const secret = process.env.ADMIN_SECRET;
  const token = request.cookies.get("valorant_admin")?.value;
  if (!secret || !token) return new NextResponse(null, { status: 404 });

  const expected = Buffer.from(tokenFor(secret));
  const received = Buffer.from(token);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return new NextResponse(null, { status: 404 });

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(emptySummary("not_configured", "未配置 DATABASE_URL，事件无法写入数据库。"), { status: 503 });
  }

  try {
    const prisma = await getPrisma();
    const events = await prisma.userEvent.findMany({ orderBy: { createdAt: "desc" }, take: 10000 }) as EventRow[];
    const count = (type: string) => events.filter((event) => event.eventType === type).length;
    const agentCounts = new Map<string, number>();
    events
      .filter((event) => event.eventType === "agent_result" && event.agentResult)
      .forEach((event) => agentCounts.set(event.agentResult!, (agentCounts.get(event.agentResult!) ?? 0) + 1));

    const started = count("question_start") + count("test_start");
    const finished = count("finish_test");
    const shares = count("share_click");
    return NextResponse.json({
      pv: count("page_view"),
      started,
      finished,
      shares,
      completionRate: started ? Math.round((finished / started) * 1000) / 10 : 0,
      shareRate: finished ? Math.round((shares / finished) * 1000) / 10 : 0,
      topAgents: [...agentCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([agent, count]) => ({ agent, count })),
      status: "connected" as const,
    });
  } catch (error) {
    console.error("[analytics] failed to read summary", { error });
    return NextResponse.json(emptySummary("unavailable", "数据库连接失败或 UserEvent 表尚未同步。"), { status: 503 });
  }
}
