export type EventName = "page_view" | "question_start" | "test_start" | "question_view" | "question_answer" | "question_drop" | "finish_test" | "test_complete" | "agent_result" | "share" | "share_click" | "poster_generate" | "ad_click" | "purchase_intent";
export type TrafficSource = "douyin" | "wechat" | "friend" | "share" | "direct";
const SOURCE_KEY = "valorant_traffic_source";

function resolveSource(): TrafficSource {
  const raw = new URLSearchParams(location.search).get("source");
  const source = raw === "douyin" || raw === "wechat" || raw === "friend" || raw === "share" ? raw : null;
  if (source) { sessionStorage.setItem(SOURCE_KEY, source); return source; }
  const stored = sessionStorage.getItem(SOURCE_KEY);
  return stored === "douyin" || stored === "wechat" || stored === "friend" || stored === "share" ? stored : "direct";
}
/** 埋点失败不应阻塞用户完成测试。 */
export function track(type: EventName, payload: Record<string, unknown> = {}) { if (typeof window === "undefined") return; const sessionId = getSessionId(); void fetch("/api/analytics", { method:"POST", headers:{"content-type":"application/json"}, keepalive:true, body:JSON.stringify({type,sessionId,payload:{...payload,source:resolveSource()}}) }).catch(() => undefined); }
function getSessionId() { const key="va-session"; const current=sessionStorage.getItem(key); if(current) return current; const id=crypto.randomUUID(); sessionStorage.setItem(key,id); return id; }
