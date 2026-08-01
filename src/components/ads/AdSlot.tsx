"use client";
import { track } from "@/lib/analytics";
import { featureConfig } from "@/lib/featureFlag";
export function AdSlot({ type }: {type:"banner"|"interstitial"|"rewarded"|"native"}) { if(!featureConfig.ads)return null; return <button onClick={()=>track("ad_click",{type})} className="my-4 block w-full border border-white/10 bg-white/5 p-3 text-left text-xs text-white/50">广告位 · {type}（优量汇接入预留）</button>; }
