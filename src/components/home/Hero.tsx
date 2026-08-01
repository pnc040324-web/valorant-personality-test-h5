"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect } from "react";
import { BetaNotice } from "@/components/common/BetaNotice";
import { track } from "@/lib/analytics";
export function Hero() {
  useEffect(() => { track("page_view", { page:"home" }); }, []);
  return <main className="app-shell grid-bg relative flex min-h-svh flex-col justify-between px-6 py-9">
    <div className="pointer-events-none absolute inset-0 overflow-hidden"><div className="float-orb absolute -right-20 top-20 h-64 w-64 rounded-full bg-riot/20 blur-[80px]"/><div className="absolute -left-28 bottom-32 h-56 w-56 rounded-full bg-[#d8c2a7]/10 blur-[90px]"/><div className="scan-line absolute left-0 h-24 w-full bg-gradient-to-b from-transparent via-riot/15 to-transparent"/>{Array.from({length:20},(_,i)=><i key={i} className="absolute h-px w-px rounded-full bg-white" style={{left:`${(i*37)%100}%`,top:`${(i*19)%100}%`,opacity:(i%5+2)/10}} />)}</div>
    <header className="relative flex items-center justify-between"><span className="font-display text-sm tracking-[.25em]">AGENT//MATCH</span><span className="border border-riot/40 bg-riot/10 px-2 py-1 text-[10px] font-bold tracking-wider text-riot">10 QUESTIONS</span></header>
    <section className="relative"><motion.div initial={{scaleX:0}} animate={{scaleX:1}} transition={{duration:.6}} className="mb-6 h-1 w-16 origin-left bg-riot"/><motion.p initial={{opacity:0,x:-20}} animate={{opacity:1,x:0}} className="mb-5 text-[10px] font-bold tracking-[.32em] text-riot">VALORANT PERSONALITY TEST</motion.p><motion.h1 initial={{opacity:0,y:36}} animate={{opacity:1,y:0}} transition={{delay:.1,type:"spring",stiffness:80}} className="font-display text-[3.25rem] leading-[.86] tracking-[-.06em] sm:text-6xl">你的无畏契约<br/><span className="relative text-riot">本命特工<i className="absolute -bottom-2 left-0 h-2 w-full bg-riot/30"/></span><br/>是谁？</motion.h1><motion.p initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} transition={{delay:.4}} className="mt-8 max-w-[270px] text-sm leading-6 text-white/65">10 道真实排位选择题，扫描你的对局人格，匹配最适合你的特工。</motion.p></section>
    <motion.div initial={{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{delay:.55}} className="relative"><Link onClick={()=>track("test_start")} href="/test" className="clip pulse-red block min-h-12 bg-riot px-6 py-3 text-center font-bold tracking-[.15em] transition active:scale-[.97] active:bg-[#ff6875]">开始测试 <span aria-hidden>→</span></Link><p className="mt-4 text-center text-xs text-white/45">约 1 分钟 · 29 名特工人格匹配</p><BetaNotice/></motion.div>
  </main>;
}
