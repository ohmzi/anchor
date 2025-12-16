import type { NoteBackgroundData } from "./types";

export const NOTE_BACKGROUND_STYLES: NoteBackgroundData[] = [
  // Solid Colors
  {
    id: "color_red",
    lightColor: "#FFEBEE",
    darkColor: "#331D21",
  },
  {
    id: "color_orange",
    lightColor: "#FFE7C1",
    darkColor: "#3A2611",
  },
  {
    id: "color_yellow",
    lightColor: "#FFF9DB",
    darkColor: "#473F19",
  },
  {
    id: "color_green",
    lightColor: "#E8F5E9",
    darkColor: "#1B3022",
  },
  {
    id: "color_teal",
    lightColor: "#E0F7FA",
    darkColor: "#193135",
  },
  {
    id: "color_blue",
    lightColor: "#E3F2FD",
    darkColor: "#192A3A",
  },
  {
    id: "color_dark_blue",
    lightColor: "#E8EAF6",
    darkColor: "#1A1F3A",
  },
  {
    id: "color_purple",
    lightColor: "#F3E5F5",
    darkColor: "#2D1D31",
  },
  {
    id: "color_pink",
    lightColor: "#FFE0F0",
    darkColor: "#3B2330",
  },
  {
    id: "color_brown",
    lightColor: "#EFEBE9",
    darkColor: "#2E1F1A",
  },
  // Patterns
  {
    id: "pattern_dots",
    lightColor: "#F5F5F5",
    darkColor: "#1E1E1E",
    isPattern: true,
  },
  {
    id: "pattern_grid",
    lightColor: "#FFF8E1",
    darkColor: "#332B1E",
    isPattern: true,
  },
  {
    id: "pattern_lines",
    lightColor: "#E3F2FD",
    darkColor: "#192A3A",
    isPattern: true,
  },
  {
    id: "pattern_waves",
    lightColor: "#E8F5E9",
    darkColor: "#1B3022",
    isPattern: true,
  },
  {
    id: "pattern_groceries",
    lightColor: "#FFEBEE",
    darkColor: "#331D21",
    isPattern: true,
  },
  {
    id: "pattern_music",
    lightColor: "#F3E5F5",
    darkColor: "#2D1D31",
    isPattern: true,
  },
  {
    id: "pattern_travel",
    lightColor: "#E0F7FA",
    darkColor: "#193135",
    isPattern: true,
  },
  {
    id: "pattern_code",
    lightColor: "#ECEFF1",
    darkColor: "#1E2325",
    isPattern: true,
  },
];

export const SOLID_COLORS = NOTE_BACKGROUND_STYLES.filter(
  (s) => !s.isPattern
);

export const PATTERNS = NOTE_BACKGROUND_STYLES.filter((s) => s.isPattern);
