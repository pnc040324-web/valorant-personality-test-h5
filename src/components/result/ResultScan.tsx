"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentAvatar } from "@/components/common/AgentAvatar";
import { personalityDimensions } from "@/lib/scoring";
import type { PersonalityDimension } from "@/lib/types";
import { useTestStore } from "@/store/testStore";

const dimensionLabels: Record<PersonalityDimension, string> = {
  aggressive: "AGGRESSIVE / 冲锋",
  aim: "AIM / 枪法自信",
  chaos: "CHAOS / 混乱创造",
  mindgame: "MINDGAME / 心理博弈",
  information: "INFORMATION / 信息掌控",
  control: "CONTROL / 地图控制",
  support: "SUPPORT / 团队保护",
  lurk: "LURK / 阴人意识",
};

const scanMetrics: PersonalityDimension[] = ["aggressive", "aim", "support", "mindgame", "control"];
const agentFlash = ["JETT", "OMEN", "SAGE", "RAZE", "KAY/O", "CYPHER"];

function Metric({ label, value, active, order }: { label:string; value:number; active:boolean; order:number }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const tick = window.setInterval(() => {
      current += 1;
      setShown(Math.min(value, Math.round(value * current / 12)));
      if (current >= 12) window.clearInterval(tick);
    }, 28);
    return () => window.clearInterval(tick);
  }, [active, value]);
  return <motion.div initial={{ opacity:0, x:-18 }} animate={active ? { opacity:1, x:0 } : {}} transition={{ delay:order * .11, duration:.25 }} className="scan-metric">
    <div className="flex items-center justify-between gap-3 text-[10px] font-bold tracking-[.13em] text-white/70"><span>{label}</span><span className="text-riot">{shown}%</span></div>
    <div className="mt-2 h-1 overflow-hidden bg-white/10"><motion.i initial={{ width:0 }} animate={active ? { width:`${value}%` } : {}} transition={{ delay:order * .11, duration:.42 }} className="block h-full bg-riot shadow-[0_0_12px_#ff4655]"/></div>
  </motion.div>;
}

export function ResultScan() {
  const router = useRouter();
  const { result, hydrated, restoreResult } = useTestStore();
  const [stage, setStage] = useState(0);
  const [flashIndex, setFlashIndex] = useState(0);

  useEffect(() => { restoreResult(); }, [restoreResult]);
  useEffect(() => {
    if (hydrated && !result) router.replace("/test");
  }, [hydrated, result, router]);
  useEffect(() => {
    if (!hydrated || !result) return;
    const timers = [
      window.setTimeout(() => setStage(1), 700),
      window.setTimeout(() => setStage(2), 2200),
      window.setTimeout(() => setStage(3), 3450),
      window.setTimeout(() => router.replace("/result"), result.primary.rarity === "SSR" ? 4900 : 4400),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [hydrated, result, router]);
  useEffect(() => {
    if (stage !== 2) return;
    const timer = window.setInterval(() => setFlashIndex((value) => (value + 1) % agentFlash.length), 210);
    return () => window.clearInterval(timer);
  }, [stage]);

  const percentages = useMemo(() => {
    if (!result) return {} as Record<PersonalityDimension, number>;
    const highest = Math.max(...Object.values(result.personalityVector), 1);
    return Object.fromEntries(personalityDimensions.map((key) => [key, Math.round(result.personalityVector[key] / highest * 100)])) as Record<PersonalityDimension, number>;
  }, [result]);

  if (!hydrated || !result) return <main className="app-shell grid place-items-center"><p className="text-xs tracking-[.2em] text-white/50">RESTORING ANALYSIS...</p></main>;
  const isSSR = result.primary.rarity === "SSR";
  const energy = isSSR ? "scan-ssr" : result.primary.rarity === "SR" ? "scan-sr" : "scan-r";

  return <main className={`scan-shell app-shell ${energy} relative flex min-h-svh flex-col overflow-hidden px-5 py-8`}>
    <div className="scan-grid absolute inset-0 opacity-70"/><div className="scan-line absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-transparent via-riot/25 to-transparent"/>
    <div className="scan-particles absolute inset-0 pointer-events-none"><i/><i/><i/><i/><i/></div>
    <header className="relative flex items-start justify-between text-[10px] tracking-[.22em] text-white/55"><span>AGENT ANALYSIS</span><span>{String(Math.min(stage + 1, 4)).padStart(2, "0")} / 04</span></header>

    <div className="relative flex flex-1 flex-col justify-center">
      <AnimatePresence mode="wait">
        {stage === 0 && <motion.section key="boot" initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="scan-panel">
          <p className="text-xs tracking-[.28em] text-riot">AGENT ANALYSIS</p><h1 className="mt-4 font-display text-4xl leading-none">正在分析你的<br/>战斗人格...</h1><p className="mt-6 text-xs leading-6 text-white/55">采集对局选择 · 建立人格向量 · 校验特工矩阵</p>
        </motion.section>}
        {stage === 1 && <motion.section key="metrics" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="scan-panel">
          <p className="text-xs tracking-[.24em] text-riot">READING BATTLE PROFILE</p><h1 className="mt-3 font-display text-3xl">战斗人格解析</h1><div className="mt-8 space-y-5">{scanMetrics.map((key, index) => <Metric key={key} label={dimensionLabels[key]} value={percentages[key]} active order={index}/>)}</div>
        </motion.section>}
        {stage === 2 && <motion.section key="matching" initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} className="scan-panel text-center">
          <p className="text-xs tracking-[.28em] text-riot">MATCHING AGENTS...</p><motion.p key={flashIndex} initial={{ opacity:0, y:18, filter:"blur(5px)" }} animate={{ opacity:1, y:0, filter:"blur(0px)" }} className="mt-8 font-display text-6xl text-white">{agentFlash[flashIndex]}</motion.p><p className="mt-8 text-xs tracking-[.2em] text-white/45">PERSONALITY MATRIX SYNCHRONIZED</p>
        </motion.section>}
        {stage === 3 && <motion.section key="found" initial={{ opacity:0, scale:.86 }} animate={{ opacity:1, scale:1 }} className="scan-panel text-center">
          {isSSR && <motion.div initial={{ opacity:1 }} animate={{ opacity:[1,1,0] }} transition={{ duration:.55 }} className="absolute inset-0 z-10 bg-black"/>}
          <p className={`text-xs font-bold tracking-[.27em] ${isSSR ? "text-violet-200" : "text-riot"}`}>{isSSR ? "HIDDEN AGENT UNLOCKED" : "MATCH FOUND"}</p>
          <motion.div initial={{ rotateY:90, scale:.7 }} animate={{ rotateY:0, scale:1 }} transition={{ type:"spring", stiffness:150, damping:15 }} className="mx-auto mt-6 w-fit"><AgentAvatar agent={result.primary}/></motion.div>
          <motion.h1 initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.25 }} className="mt-5 font-display text-5xl">{result.primary.displayName}</motion.h1>
          <p className="mt-2 text-sm text-white/65">{result.primary.title}</p><motion.p initial={{ opacity:0, scale:.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:.38, type:"spring" }} className="mt-5 text-4xl font-black">{result.probability}%</motion.p>
        </motion.section>}
      </AnimatePresence>
    </div>
    <footer className="relative flex justify-between text-[9px] tracking-[.15em] text-white/35"><span>VALORANT PERSONA MATRIX</span><span>SECURE LINK</span></footer>
  </main>;
}
