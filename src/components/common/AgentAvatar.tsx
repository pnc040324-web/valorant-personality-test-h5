"use client";

import { useState } from "react";
import type { Agent } from "@/lib/types";

export function AgentAvatar({ agent, size="large", showIdentity=false, fit="cover" }: { agent:Agent; size?:"small"|"large"|"poster"; showIdentity?:boolean; fit?:"cover"|"contain" }) {
  const [failed, setFailed] = useState(false);
  const letters = agent.displayName.slice(0, 2);
  const avatarSrc = !failed && agent.qAvatar?.trim() ? agent.qAvatar : "/images/agent-placeholder.svg";
  const sizeClass = size === "small" ? "h-14 w-14 text-xl" : size === "poster" ? "h-72 w-72 text-6xl" : "h-56 w-56 text-6xl";
  return <div className={`relative grid place-items-center overflow-hidden border border-white/20 bg-gradient-to-br from-riot via-[#641c31] to-ink ${sizeClass}`} aria-label={`${agent.displayName} Q版头像`}>
    <img className={`absolute inset-0 h-full w-full ${fit === "contain" ? "object-contain p-5" : "object-cover"}`} src={avatarSrc} alt="" loading={size === "small" ? "lazy" : "eager"} decoding="async" onError={() => setFailed(true)}/>
    {showIdentity && <><span className="absolute -right-4 -top-7 text-[120px] font-black leading-none text-white/10">V</span><span className="font-display relative text-white drop-shadow-[0_2px_6px_rgba(0,0,0,.8)]">{letters}</span><span className="absolute bottom-2 text-[10px] uppercase tracking-[.25em] text-white/70">{agent.englishId}</span></>}
  </div>;
}
