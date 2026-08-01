import rawAgents from "@/data/agents.json";
import type { Agent } from "@/lib/types";

/** 统一补齐头像资源，旧数据也不会在客户端产生破图。 */
export const agents: Agent[] = (rawAgents as Array<Agent & { qAvatar?: string }>).map((agent) => ({
  ...agent,
  qAvatar: agent.qAvatar ?? "/images/agent-placeholder.svg",
}));
