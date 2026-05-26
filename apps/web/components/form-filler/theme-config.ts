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
  default: "@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600;700&family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;700&display=swap');",
  dark: "@import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&family=Inter:wght@300;400;600;700&family=Outfit:wght@300;400;600;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Roboto+Mono:wght@400;700&display=swap');",
  japanese:
    "@import url('https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;700&family=Noto+Sans+JP:wght@300;400;500;700&display=swap');",
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
  japanese: {
    backgroundColor: "#F9F4F0",
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 40a20 20 0 0 1 20-20 20 20 0 0 1 20 20H0zm20-20a20 20 0 0 1 20-20V0a20 20 0 0 1-20 20 20 20 0 0 1-20-20v20a20 20 0 0 1 20 20z' fill='%23d4c4b0' fill-opacity='0.08' fill-rule='evenodd'/%3E%3C/svg%3E\")",
    textColor: "#1A1A1A",
    primaryColor: "#BC243C",
    buttonBgColor: "#BC243C",
    buttonTextColor: "#FFFFFF",
    fontFamily: "'Zen Old Mincho', serif",
    cardBgColor: "#FFFFFF",
    inputBgColor: "#FFFFFF",
    inputBorderColor: "#D4C4B0",
    glow: "rgba(188, 36, 60, 0.12)",
  },
};

function normalizeThemeId(rawThemeId: string): string {
  const value = (rawThemeId || "").trim();
  if (!value) return "default";
  const lowered = value.toLowerCase();
  if (lowered === "japan" || lowered === "jp" || lowered === "japanese-theme") {
    return "japanese";
  }
  return lowered;
}

export function getThemeFontImport(themeId: string): string {
  const normalized = normalizeThemeId(themeId);
  return THEME_FONTS[normalized] || THEME_FONTS.default || "";
}

export function getThemeStyles(themeId: string): ThemeStyles {
  const base = THEME_MAP.default!;
  if (themeId && themeId.startsWith('{')) {
    try {
      const custom = JSON.parse(themeId);
      const chosenTheme = normalizeThemeId(custom.baseTheme || "default");
      const themeBase = THEME_MAP[chosenTheme] ?? base;
      return {
        ...themeBase,
        ...custom,
        textColor: custom.textColor || themeBase.textColor,
        fontFamily: custom.fontFamily || themeBase.fontFamily,
        fontSize: custom.fontSize || '16px',
      };
    } catch (e) {
      console.error("Failed to parse custom theme configuration", e);
    }
  }
  const normalized = normalizeThemeId(themeId);
  return THEME_MAP[normalized] ?? base;
}
