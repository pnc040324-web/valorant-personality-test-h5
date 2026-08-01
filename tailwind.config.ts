import type { Config } from "tailwindcss";
export default { content: ["./src/**/*.{ts,tsx}"], theme: { extend: { colors: { riot: "#ff4655", ink: "#0f1923" }, fontFamily: { display: ["Arial Black", "Arial", "sans-serif"] } } }, plugins: [] } satisfies Config;
