import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "你的无畏契约本命特工是谁？", description: "10 道真实排位习惯题，找出你的本命特工人格。", other: { "format-detection": "telephone=no" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, maximumScale: 1, userScalable: false, themeColor: "#0f1923" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="zh-CN"><body>{children}</body></html>; }
