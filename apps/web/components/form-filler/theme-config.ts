import type { ThemeStyles } from "./types";

/** Inline Google Fonts import strings keyed by theme ID. */
export const THEME_FONTS: Record<string, string> = {
  sunset:
    "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');",
  forest:
    "@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');",
  cyberpunk:
    "@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;700&display=swap');",
  retro:
    "@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap');",
  default: "",
  dark: "",
};

const THEME_MAP: Record<string, ThemeStyles> = {
  default: {
    backgroundColor: "#F9FAFB",
    textColor: "#111827",
    primaryColor: "#3B82F6",
    buttonBgColor: "#3B82F6",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
    cardBgColor: "#FFFFFF",
    inputBgColor: "#FFFFFF",
    inputBorderColor: "#E5E7EB",
    glow: "rgba(59,130,246,0.1)",
  },
  dark: {
    backgroundColor: "#0F172A",
    textColor: "#F1F5F9",
    primaryColor: "#3B82F6",
    buttonBgColor: "#3B82F6",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
    cardBgColor: "#1E293B",
    inputBgColor: "#0F172A",
    inputBorderColor: "#334155",
    glow: "rgba(59,130,246,0.2)",
  },
  sunset: {
    backgroundColor: "#FFF7ED",
    textColor: "#431407",
    primaryColor: "#EA580C",
    buttonBgColor: "#EA580C",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Outfit, sans-serif",
    cardBgColor: "#FFFFFF",
    inputBgColor: "#FFF7ED",
    inputBorderColor: "#FED7AA",
    glow: "rgba(234,88,12,0.1)",
  },
  forest: {
    backgroundColor: "#F0FDF4",
    textColor: "#052E16",
    primaryColor: "#16A34A",
    buttonBgColor: "#16A34A",
    buttonTextColor: "#FFFFFF",
    fontFamily: "Outfit, sans-serif",
    cardBgColor: "#FFFFFF",
    inputBgColor: "#F0FDF4",
    inputBorderColor: "#BBF7D0",
    glow: "rgba(22,163,74,0.1)",
  },
  cyberpunk: {
    backgroundColor: "#050505",
    textColor: "#39FF14",
    primaryColor: "#BD00FF",
    buttonBgColor: "#BD00FF",
    buttonTextColor: "#FFFFFF",
    fontFamily: "'Roboto Mono', monospace",
    cardBgColor: "#111111",
    inputBgColor: "#000000",
    inputBorderColor: "#BD00FF",
    glow: "rgba(189,0,255,0.4)",
  },
  retro: {
    backgroundColor: "#0A0F0D",
    textColor: "#00FF66",
    primaryColor: "#00FF66",
    buttonBgColor: "#00FF66",
    buttonTextColor: "#000000",
    fontFamily: "'Fira Code', monospace",
    cardBgColor: "#0D1511",
    inputBgColor: "#0A0F0D",
    inputBorderColor: "#00CC52",
    glow: "rgba(0,255,102,0.2)",
  },
};

export function getThemeStyles(themeId: string): ThemeStyles {
  return THEME_MAP[themeId] ?? THEME_MAP.default!;
}
