export interface FormThemeStyle {
  backgroundColor: string;
  textColor: string;
  primaryColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  fontFamily: string;
  cardBgColor: string;
  inputBgColor: string;
  inputBorderColor: string;
}

export interface FormTheme {
  id: string;
  name: string;
  description: string;
  styles: FormThemeStyle;
}

export const SYSTEM_THEMES: FormTheme[] = [
  {
    id: "default",
    name: "Classic Light",
    description: "A clean, modern light theme for professional surveys.",
    styles: {
      backgroundColor: "#F9FAFB", // Slate 50
      textColor: "#111827", // Slate 900
      primaryColor: "#3B82F6", // Blue 500
      buttonBgColor: "#3B82F6",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Inter, sans-serif",
      cardBgColor: "#FFFFFF",
      inputBgColor: "#FFFFFF",
      inputBorderColor: "#E5E7EB",
    },
  },
  {
    id: "dark",
    name: "Slate Dark",
    description: "Sleek dark mode theme designed for high-contrast viewing.",
    styles: {
      backgroundColor: "#0F172A", // Slate 900
      textColor: "#F1F5F9", // Slate 100
      primaryColor: "#3B82F6", // Blue 500
      buttonBgColor: "#3B82F6",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Inter, sans-serif",
      cardBgColor: "#1E293B", // Slate 800
      inputBgColor: "#0F172A",
      inputBorderColor: "#334155",
    },
  },
  {
    id: "sunset",
    name: "Sunset Glow",
    description: "Warm gradient tones inspired by summer evening skies.",
    styles: {
      backgroundColor: "#FFF7ED", // Orange 50
      textColor: "#431407", // Orange 950
      primaryColor: "#EA580C", // Orange 600
      buttonBgColor: "#EA580C",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Outfit, sans-serif",
      cardBgColor: "#FFFFFF",
      inputBgColor: "#FFF7ED",
      inputBorderColor: "#FED7AA",
    },
  },
  {
    id: "forest",
    name: "Sage Forest",
    description: "Soothing natural earthy greens for organic feedback.",
    styles: {
      backgroundColor: "#F0FDF4", // Green 50
      textColor: "#052E16", // Green 950
      primaryColor: "#16A34A", // Green 600
      buttonBgColor: "#16A34A",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Outfit, sans-serif",
      cardBgColor: "#FFFFFF",
      inputBgColor: "#F0FDF4",
      inputBorderColor: "#BBF7D0",
    },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    description: "High energy neon accents with deep synthetic blacks.",
    styles: {
      backgroundColor: "#050505",
      textColor: "#39FF14", // Neon Green
      primaryColor: "#BD00FF", // Neon Purple
      buttonBgColor: "#BD00FF",
      buttonTextColor: "#FFFFFF",
      fontFamily: "Roboto, monospace",
      cardBgColor: "#111111",
      inputBgColor: "#000000",
      inputBorderColor: "#BD00FF",
    },
  },
  {
    id: "retro",
    name: "Retro Terminal",
    description: "Nostalgic glowing monochrome look of old CRT computers.",
    styles: {
      backgroundColor: "#0A0F0D",
      textColor: "#00FF66", // Phosphor Green
      primaryColor: "#00FF66",
      buttonBgColor: "#00FF66",
      buttonTextColor: "#000000",
      fontFamily: "Courier New, monospace",
      cardBgColor: "#0D1511",
      inputBgColor: "#0A0F0D",
      inputBorderColor: "#00CC52",
    },
  },
];
