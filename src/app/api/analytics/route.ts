import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const validSources = new Set(["douyin", "wechat", "friend", "share", "direct"]);

type EventPayload = Record<string, unknown>;

function isRecord(value: unknown): value is EventPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function getPrisma() {
  const { PrismaClient } = await import("@prisma/client");
  const globalForPrisma = globalThis as unknown as { analyticsPrisma?: InstanceType<typeof PrismaClient> };
  globalForPrisma.analyticsPrisma ??= new PrismaClient();
  return globalForPrisma.analyticsPrisma;
}

export async function POST(request: NextRequest) {
  let body: { type?: unknown; sessionId?: unknown; payload?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_ANALYTICS_EVENT" }, { status: 400 });
  }

  if (typeof body.type !== "string" || !body.type.trim()) {
    return NextResponse.json({ ok: false, error: "INVALID_ANALYTICS_EVENT" }, { status: 400 });
  }

  if (!process.env.DATABASE_URL) {
    console.error("[analytics] DATABASE_URL is not configured; event was not persisted", { type: body.type });
    return NextResponse.json({ ok: false, error: "ANALYTICS_DATABASE_NOT_CONFIGURED" }, { status: 503 });
  }

  const payload = isRecord(body.payload) ? body.payload : {};
  const sourceValue = typeof payload.source === "string" ? payload.source : "direct";
  const source = validSources.has(sourceValue) ? sourceValue : "direct";

  try {
    const prisma = await getPrisma();
    await prisma.userEvent.create({
      data: {
        eventType: body.type,
        sessionId: typeof body.sessionId === "string" ? body.sessionId : null,
        source,
        agentResult: typeof payload.agent === "string" ? payload.agent : null,
        payload,
      },
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics] failed to persist event", { type: body.type, error });
    return NextResponse.json({ ok: false, error: "ANALYTICS_WRITE_FAILED" }, { status: 500 });
  }
}
