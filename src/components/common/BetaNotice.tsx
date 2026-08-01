import appConfig from "@/config/appConfig.json";

export function BetaNotice() {
  if (!appConfig.betaMode) return null;
  return <p className="mt-4 text-center text-[10px] tracking-wide text-white/35">BETA 0.1 · 欢迎截图反馈你的本命特工</p>;
}
