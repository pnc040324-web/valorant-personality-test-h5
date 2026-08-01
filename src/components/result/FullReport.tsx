import type { Agent } from "@/lib/types";

interface FullReportProps { agent: Agent; backups: Agent[]; unlocked: boolean; onUnlock: () => void; }

export function FullReport({ agent, backups, unlocked, onUnlock }: FullReportProps) {
  const items = [
    ["你的排位人格", `${agent.title} · ${agent.tags.slice(0, 3).join(" / ")}`],
    ["最大优势", agent.strength],
    ["上分短板", agent.weakness],
    ["推荐英雄池", [agent, ...backups].map(({ displayName }) => displayName).join("、")],
    ["热梗解释", agent.hotWords.slice(0, 2).join(" · ") || agent.proJoke],
  ];
  return <section className="esport-card relative mt-6 overflow-hidden border border-white/10 bg-[#14202c]/90 p-5"><p className="text-[10px] font-bold tracking-[.2em] text-riot">FULL ANALYSIS</p><h2 className="mt-2 text-lg font-bold">你的完整对局人格报告</h2><div className={`mt-4 space-y-4 ${unlocked ? "" : "select-none blur-[5px]"}`}>{items.map(([title, content]) => <div key={title}><p className="text-xs font-bold text-riot">{title}</p><p className="mt-1 text-sm leading-5 text-white/75">{content}</p></div>)}</div>{!unlocked && <div className="absolute inset-x-0 bottom-0 flex min-h-32 items-end bg-gradient-to-t from-[#14202c] via-[#14202c]/90 to-transparent p-5"><button onClick={onUnlock} className="clip w-full bg-riot px-4 py-3 text-sm font-bold transition active:scale-[.97]">分享结果，免费解锁 30 分钟</button></div>}{unlocked && <p className="mt-5 border-l-2 border-riot pl-3 text-xs text-white/65">分享奖励已生效，报告将在 30 分钟后自动锁定。</p>}</section>;
}
