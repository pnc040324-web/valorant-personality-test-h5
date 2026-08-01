"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AgentCard } from "@/components/result/AgentCard";
import { FullReport } from "@/components/result/FullReport";
import { SharePoster } from "@/components/result/SharePoster";
import { track } from "@/lib/analytics";
import { grantShareUnlock, readShareUnlock } from "@/lib/shareUnlock";
import { useTestStore } from "@/store/testStore";

export function Report() {
  const router = useRouter();
  const { result, reset, restoreResult, hydrated } = useTestStore();
  const [shareUnlockUntil, setShareUnlockUntil] = useState<string | null>(null);
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => { restoreResult(); setShareUnlockUntil(readShareUnlock()?.expiresAt ?? null); track("page_view", { page:"result" }); }, [restoreResult]);
  if (!hydrated && !result) return <main className="app-shell grid place-items-center"><p className="text-sm tracking-widest text-white/50">正在恢复你的测试结果…</p></main>;
  if (!result) return <main className="app-shell grid place-items-center p-6 text-center"><div><h1 className="text-2xl font-bold">还没有测试结果</h1><Link className="mt-5 inline-block bg-riot px-5 py-3 font-bold" href="/test">开始测试</Link></div></main>;

  const share = async () => {
    const text = `${result.primary.shareTitle}，匹配度 ${result.probability}%！${result.primary.shareText}`;
    const nativeShare = typeof navigator.share === "function";
    track("share_click", { agent:result.primary.id });
    try {
      if (nativeShare) await navigator.share({ title:"你的无畏契约本命特工", text, url:location.origin });
      else {
        await navigator.clipboard?.writeText(`${text} ${location.origin}`).catch(() => undefined);
        setShareNotice("系统分享不可用，已解锁报告；请生成海报后长按保存图片分享。 ");
      }
      const reward = grantShareUnlock();
      setShareUnlockUntil(reward.expiresAt);
      if (nativeShare) setShareNotice("分享成功，完整版已解锁 30 分钟！");
      track("share", { agent:result.primary.id, unlock:"30m" });
    } catch { setShareNotice("分享取消，完成分享后即可解锁完整版。 "); }
  };
  const unlocked = Boolean(shareUnlockUntil && new Date(shareUnlockUntil).getTime() > Date.now());
  const retry = () => { reset(); router.push("/test"); };

  return <main className={`app-shell grid-bg min-h-svh px-5 py-8 theme-${result.primary.themeStyle}`}><header className="flex justify-between text-xs"><span className="tracking-[.2em] text-riot">MATCH COMPLETE</span><button onClick={retry} className="text-white/55">重新测试</button></header><AgentCard result={result}/><section className="theme-card esport-card mt-5 border border-white/10 bg-white/[.04] p-5"><p className="text-[10px] font-bold tracking-[.2em] text-riot">FREE RESULT</p><h2 className="mt-2 text-lg font-bold">你的免费趣味报告</h2><p className="mt-3 text-sm leading-6 text-white/70">{result.primary.shareText} {result.primary.teamComment}</p></section><FullReport agent={result.primary} backups={result.backups} unlocked={unlocked} onUnlock={share}/><div className="mt-7 grid grid-cols-2 gap-3"><button onClick={share} className="clip-reverse min-h-12 border border-white/20 bg-white/[.04] px-2 py-3 text-sm font-bold transition active:scale-[.97]">看看你的队友是什么特工人格</button><SharePoster result={result}/></div>{shareNotice && <p className="mt-3 text-center text-xs text-riot">{shareNotice}</p>}<p className="py-7 text-center text-[10px] leading-5 text-white/30">本产品仅供娱乐，非 Riot Games 官方产品。相关版权归原权利方所有。</p></main>;
}
