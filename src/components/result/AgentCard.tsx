"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { AgentAvatar } from "@/components/common/AgentAvatar";
import type { MatchResult } from "@/lib/types";

const rarityStyle = { SSR:"border-[#d7bd71] bg-[#d7bd71]/15 text-[#f5d87c]", SR:"border-violet-300/60 bg-violet-500/15 text-violet-200", R:"border-white/20 bg-white/10 text-white/65" } as const;
const rarityLabel = { SSR:"SSR 隐藏人格", SR:"SR 稀有人格", R:"普通人格" } as const;

export function AgentCard({ result }: { result: MatchResult }) {
  const { primary, probability } = result;
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    setRevealed(false);
    setScore(0);
    const timer = window.setTimeout(() => setRevealed(true), 520);
    return () => window.clearTimeout(timer);
  }, [primary.id]);

  useEffect(() => {
    if (!revealed) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(probability / 20));
    const timer = window.setInterval(() => {
      current = Math.min(probability, current + step);
      setScore(current);
      if (current >= probability) window.clearInterval(timer);
    }, 38);
    return () => window.clearInterval(timer);
  }, [probability, revealed]);

  const special = primary.themeStyle === "shadow-rare"
    ? <><i className="absolute left-8 top-24 h-1.5 w-1.5 rounded-full bg-violet-100 shadow-[0_0_22px_7px_rgba(180,111,255,.8)]"/><i className="absolute right-10 top-48 h-1 w-1 rounded-full bg-violet-200 shadow-[0_0_20px_6px_rgba(180,111,255,.7)]"/></>
    : primary.themeStyle === "cute-healer"
      ? <><span className="absolute left-7 top-24 text-xl text-pink-200">♡</span><span className="absolute right-9 top-44 text-sm text-cyan-100">✦</span></>
      : null;

  if (!revealed) return <section className={`theme-card esport-card relative mt-7 grid min-h-[540px] place-items-center overflow-hidden border border-white/10 bg-[#14202c]/90 p-5 ${primary.themeStyle}`}>
    <div className="absolute inset-0 opacity-30" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,.15) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.15) 1px,transparent 1px)", backgroundSize:"28px 28px" }}/>
    <div className="relative text-center"><motion.div animate={{ rotate:360 }} transition={{ duration:1.8, repeat:Infinity, ease:"linear" }} className="mx-auto h-16 w-16 rounded-full border-2 border-riot border-t-transparent"/><p className="mt-6 text-xs font-bold tracking-[.25em] text-riot">AGENT ANALYSIS</p><p className="mt-3 text-lg font-bold">正在扫描你的对局人格</p><p className="mt-2 text-xs text-white/45">读取战斗习惯 · 匹配特工档案</p></div>
  </section>;

  return <section className={`theme-card esport-card relative mt-7 overflow-hidden border border-white/10 bg-[#14202c]/90 p-4 sm:p-5 ${primary.themeStyle}`}>
    <div className="absolute right-0 top-0 h-44 w-44 bg-riot/15 blur-3xl"/>{special}
    <div className="relative"><p className="text-center text-xs tracking-[.22em] text-white/55">你的本命特工</p></div>
    <div className="relative mt-4 flex flex-col items-center text-center">
      <motion.div initial={{ opacity:0, scale:.45, rotateY:-22 }} animate={{ opacity:1, scale:1, rotateY:0 }} transition={{ type:"spring", stiffness:180, damping:18 }} className="relative">
        <div className="absolute -inset-7 rounded-full bg-riot/25 blur-3xl"/>
        <AgentAvatar agent={primary} size="poster"/>
      </motion.div>
      <motion.h1 initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:.16 }} className="mt-6 font-display text-5xl leading-none">{primary.displayName}</motion.h1>
      <p className="mt-2 text-sm tracking-[.16em] text-white/55">{primary.englishName.toUpperCase()}</p>
      <p className="mt-4 text-lg font-bold text-white/90">{primary.title}</p>
      <span className={`mt-3 border px-3 py-1 text-[10px] font-bold tracking-widest ${rarityStyle[primary.rarity]}`}>{rarityLabel[primary.rarity]}</span>
      <motion.p initial={{ opacity:0, scale:.7 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.28, type:"spring" }} className="mt-5 text-6xl font-black leading-none">{score}<small className="text-xl">%</small></motion.p>
      <p className="mt-1 text-xs text-white/50">灵魂匹配度</p>
    </div>
    {primary.themeStyle === "shadow-rare" && <p className="mt-5 text-center text-xs text-violet-200/85">隐藏特工档案已解锁</p>}
    <p className="relative mt-5 border-l-2 border-riot pl-3 text-sm leading-6 text-white/80">“{primary.shareText}”</p>
  </section>;
}
