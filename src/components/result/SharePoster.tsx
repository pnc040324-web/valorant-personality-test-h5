"use client";

import { toPng } from "html-to-image";
import { useRef, useState } from "react";
import { AgentAvatar } from "@/components/common/AgentAvatar";
import { track } from "@/lib/analytics";
import type { MatchResult } from "@/lib/types";

const posterFont = "Microsoft YaHei, PingFang SC, Arial, sans-serif";
const MIN_PNG_SIZE = 1024;

const delay = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));

function isImageReady(image: HTMLImageElement) {
  return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
}

async function waitForImage(image: HTMLImageElement) {
  if (image.complete && !isImageReady(image)) throw new Error("图片加载失败");

  if (!isImageReady(image)) {
    await new Promise<void>((resolve, reject) => {
      image.addEventListener("load", () => resolve(), { once: true });
      image.addEventListener("error", () => reject(new Error("图片加载失败")), { once: true });
    });
  }

  if (typeof image.decode === "function") {
    await image.decode().catch(() => undefined);
  }
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("图片编码失败"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl: string) {
  const [header, base64] = dataUrl.split(",");
  if (!header || !base64) throw new Error("PNG 数据无效");

  const mime = header.match(/data:(.*?);base64/)?.[1] ?? "image/png";
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mime });
}

async function imageToDataUrl(image: HTMLImageElement) {
  await waitForImage(image);
  const source = image.currentSrc || image.src;
  if (!source || source.startsWith("data:")) return source;

  // Decode a CORS-enabled copy before exporting. The poster itself only keeps
  // the base64 result, so html-to-image never needs to resolve a remote URL.
  const decodedImage = new Image();
  decodedImage.crossOrigin = "anonymous";
  decodedImage.src = source;
  await waitForImage(decodedImage);

  const response = await fetch(source, { cache: "force-cache", credentials: "same-origin" });
  if (!response.ok) throw new Error("图片资源读取失败");
  const blob = await response.blob();
  if (blob.size === 0) throw new Error("图片资源为空");
  return blobToDataUrl(blob);
}

async function inlinePosterImages(node: HTMLDivElement) {
  const images = [...node.querySelectorAll("img")];
  const originals = images.map((image) => image.getAttribute("src"));

  await Promise.all(images.map(async (image, index) => {
    const dataUrl = await imageToDataUrl(image);
    image.setAttribute("src", dataUrl);
    await waitForImage(image);
    originals[index] = originals[index] ?? "";
  }));

  return () => {
    images.forEach((image, index) => image.setAttribute("src", originals[index] ?? ""));
  };
}

async function waitForPosterReady(node: HTMLDivElement) {
  if ("fonts" in document) await document.fonts.ready;
  await Promise.all([...node.querySelectorAll("img")].map(waitForImage));
  // Let iOS finish painting decoded images before html-to-image snapshots the DOM.
  await delay(700);
}

function shouldPreviewInsteadOfDownload() {
  const userAgent = navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  return isIos || /MicroMessenger/i.test(userAgent);
}

function downloadBlob(blob: Blob, filename: string) {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export function SharePoster({ result }: { result: MatchResult }) {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState("");
  const { primary } = result;
  const isSsr = primary.rarity === "SSR";

  const generatePoster = async () => {
    const poster = posterRef.current;
    if (!poster) return;

    setIsGenerating(true);
    setError("");
    try {
      const restoreImages = await inlinePosterImages(poster);
      let dataUrl = "";
      try {
        await waitForPosterReady(poster);
        dataUrl = await toPng(poster, {
          cacheBust: false,
          pixelRatio: 2,
          backgroundColor: "#0f1923",
          fontEmbedCSS: `* { font-family: ${posterFont}; }`,
        });
      } finally {
        restoreImages();
      }

      const pngBlob = dataUrlToBlob(dataUrl);
      if (pngBlob.size < MIN_PNG_SIZE) throw new Error("海报 PNG 为空");

      setPreviewUrl(dataUrl);
      if (!shouldPreviewInsteadOfDownload()) {
        downloadBlob(pngBlob, `本命特工-${primary.displayName}.png`);
      }
      track("poster_generate", { agent: primary.id, bytes: pngBlob.size });
    } catch {
      setError("海报生成失败，请检查网络后重新生成；也可以直接截图结果页分享。");
    } finally {
      setIsGenerating(false);
    }
  };

  const specialCopy = primary.themeStyle === "shadow-rare" ? "你解锁了隐藏人格" : primary.themeStyle === "cute-healer" ? "全队的治愈守护者" : "你的专属对局人格";

  return <>
    <button onClick={generatePoster} disabled={isGenerating} className="clip min-h-12 bg-riot py-3 text-sm font-bold transition active:scale-[.97] disabled:opacity-60">
      {isGenerating ? "正在生成…" : "生成我的本命特工海报"}
    </button>
    {error && <p className="col-span-2 text-center text-xs text-riot">{error}</p>}
    {previewUrl && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" role="dialog" aria-modal="true" aria-label="本命特工分享海报">
      <div className="max-h-full w-full max-w-[330px]">
        <img src={previewUrl} alt="本命特工分享海报" className="max-h-[72svh] w-full object-contain" />
        <p className="mt-3 text-center text-sm text-white/80">长按图片保存后，分享给你的队友</p>
        <button onClick={() => setPreviewUrl(null)} className="mt-3 w-full border border-white/25 bg-white/10 py-3 text-sm">返回结果页</button>
      </div>
    </div>}
    <div className="pointer-events-none fixed left-[-10000px] top-0">
      <div ref={posterRef} className={`poster poster-${primary.themeStyle} relative overflow-hidden p-7 text-white`} style={{ fontFamily: posterFont }}>
        <div className="absolute -right-20 -top-10 z-0 h-64 w-64 rounded-full bg-riot/70 blur-3xl" />
        <div className="absolute inset-0 z-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex min-h-[704px] flex-col text-center">
          <p className="text-left text-[10px] font-bold tracking-[.2em]">AGENT MATCH / RESULT</p>
          <div className="mt-5 h-1 w-16 bg-riot" />
          <h2 className="mt-4 text-left text-[30px] font-black leading-none">你的无畏契约本命特工</h2>
          <p className="mt-3 text-left text-sm font-bold text-riot">{specialCopy}</p>
          <div className="relative z-10 mt-4 flex h-[310px] items-center justify-center px-4">
            <div className="absolute inset-x-14 inset-y-9 rounded-full bg-riot/20 blur-3xl" />
            <div className="relative h-[280px] w-[280px]"><AgentAvatar agent={primary} size="poster" fit="contain" /></div>
          </div>
          <p className="mt-2 text-4xl font-black leading-none">{primary.displayName}</p>
          <p className="mt-2 text-sm font-bold text-riot">{primary.title} · {isSsr ? "SSR隐藏人格" : primary.rarity === "SR" ? "SR稀有人格" : "专属人格"}</p>
          <p className="mt-3 text-5xl font-black text-riot">{result.probability}%</p>
          <p className="text-xs text-white/70">灵魂匹配度</p>
          <p className="mt-4 border-l-2 border-riot pl-3 text-left text-sm leading-6">{primary.shareText}</p>
          <div className="mt-auto flex items-end justify-between pt-5"><p className="text-left text-xs leading-5 text-white/70">扫码测试你的<br />本命特工</p><div className="grid h-14 w-14 place-items-center border-4 border-white bg-white text-[8px] font-bold text-ink">QR CODE</div></div>
        </div>
      </div>
    </div>
  </>;
}
