// MeetLink Theme System
// Custom themes: Dark, Classy, Light, Sunset, Mocha, Forest

export type ThemeName = 'light' | 'dark' | 'classy' | 'sunset' | 'mocha' | 'forest';

export interface ThemeColors {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  border: string;
  input: string;
  ring: string;
  sidebar: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
  sidebarRing: string;
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
}

export interface Theme {
  name: ThemeName;
  displayName: string;
  description: string;
  colors: ThemeColors;
  isDark: boolean;
  icon: string;
  gradient: string;
}

export const themes: Theme[] = [
  {
    name: 'light',
    displayName: 'Light',
    description: 'Clean and bright default theme',
    isDark: false,
    icon: '☀️',
    gradient: 'from-white via-slate-50 to-slate-100',
    colors: {
      background: 'oklch(1 0 0)',
      foreground: 'oklch(0.145 0 0)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.145 0 0)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.145 0 0)',
      primary: 'oklch(0.646 0.222 160)', // Emerald
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.97 0 0)',
      secondaryForeground: 'oklch(0.205 0 0)',
      muted: 'oklch(0.97 0 0)',
      mutedForeground: 'oklch(0.556 0 0)',
      accent: 'oklch(0.97 0 0)',
      accentForeground: 'oklch(0.205 0 0)',
      destructive: 'oklch(0.577 0.245 27.325)',
      destructiveForeground: 'oklch(0.985 0 0)',
      border: 'oklch(0.922 0 0)',
      input: 'oklch(0.922 0 0)',
      ring: 'oklch(0.646 0.222 160)',
      sidebar: 'oklch(0.985 0 0)',
      sidebarForeground: 'oklch(0.145 0 0)',
      sidebarPrimary: 'oklch(0.646 0.222 160)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccent: 'oklch(0.97 0 0)',
      sidebarAccentForeground: 'oklch(0.205 0 0)',
      sidebarBorder: 'oklch(0.922 0 0)',
      sidebarRing: 'oklch(0.708 0 0)',
      chart1: 'oklch(0.646 0.222 160)',
      chart2: 'oklch(0.6 0.118 184.704)',
      chart3: 'oklch(0.398 0.07 227.392)',
      chart4: 'oklch(0.828 0.189 84.429)',
      chart5: 'oklch(0.769 0.188 70.08)',
    },
  },
  {
    name: 'dark',
    displayName: 'Dark',
    description: 'Easy on the eyes dark theme',
    isDark: true,
    icon: '🌙',
    gradient: 'from-slate-900 via-slate-800 to-slate-900',
    colors: {
      background: 'oklch(0.145 0 0)',
      foreground: 'oklch(0.985 0 0)',
      card: 'oklch(0.205 0 0)',
      cardForeground: 'oklch(0.985 0 0)',
      popover: 'oklch(0.205 0 0)',
      popoverForeground: 'oklch(0.985 0 0)',
      primary: 'oklch(0.646 0.222 160)',
      primaryForeground: 'oklch(0.985 0 0)',
      secondary: 'oklch(0.269 0 0)',
      secondaryForeground: 'oklch(0.985 0 0)',
      muted: 'oklch(0.269 0 0)',
      mutedForeground: 'oklch(0.708 0 0)',
      accent: 'oklch(0.269 0 0)',
      accentForeground: 'oklch(0.985 0 0)',
      destructive: 'oklch(0.704 0.191 22.216)',
      destructiveForeground: 'oklch(0.985 0 0)',
      border: 'oklch(1 0 0 / 10%)',
      input: 'oklch(1 0 0 / 15%)',
      ring: 'oklch(0.646 0.222 160)',
      sidebar: 'oklch(0.205 0 0)',
      sidebarForeground: 'oklch(0.985 0 0)',
      sidebarPrimary: 'oklch(0.646 0.222 160)',
      sidebarPrimaryForeground: 'oklch(0.985 0 0)',
      sidebarAccent: 'oklch(0.269 0 0)',
      sidebarAccentForeground: 'oklch(0.985 0 0)',
      sidebarBorder: 'oklch(1 0 0 / 10%)',
      sidebarRing: 'oklch(0.556 0 0)',
      chart1: 'oklch(0.646 0.222 160)',
      chart2: 'oklch(0.696 0.17 162.48)',
      chart3: 'oklch(0.769 0.188 70.08)',
      chart4: 'oklch(0.627 0.265 303.9)',
      chart5: 'oklch(0.645 0.246 16.439)',
    },
  },
  {
    name: 'classy',
    displayName: 'Classy',
    description: 'Elegant dark theme with gold accents',
    isDark: true,
    icon: '✨',
    gradient: 'from-amber-950 via-yellow-900 to-amber-900',
    colors: {
      background: 'oklch(0.15 0.01 60)',
      foreground: 'oklch(0.9 0.05 60)',
      card: 'oklch(0.18 0.015 60)',
      cardForeground: 'oklch(0.9 0.05 60)',
      popover: 'oklch(0.18 0.015 60)',
      popoverForeground: 'oklch(0.9 0.05 60)',
      primary: 'oklch(0.75 0.15 75)', // Gold
      primaryForeground: 'oklch(0.15 0.01 60)',
      secondary: 'oklch(0.25 0.02 60)',
      secondaryForeground: 'oklch(0.9 0.05 60)',
      muted: 'oklch(0.25 0.02 60)',
      mutedForeground: 'oklch(0.6 0.03 60)',
      accent: 'oklch(0.75 0.15 75)',
      accentForeground: 'oklch(0.15 0.01 60)',
      destructive: 'oklch(0.55 0.2 25)',
      destructiveForeground: 'oklch(0.9 0.05 60)',
      border: 'oklch(0.3 0.02 60)',
      input: 'oklch(0.25 0.02 60)',
      ring: 'oklch(0.75 0.15 75)',
      sidebar: 'oklch(0.12 0.015 60)',
      sidebarForeground: 'oklch(0.85 0.04 60)',
      sidebarPrimary: 'oklch(0.75 0.15 75)',
      sidebarPrimaryForeground: 'oklch(0.15 0.01 60)',
      sidebarAccent: 'oklch(0.5 0.1 75)',
      sidebarAccentForeground: 'oklch(0.9 0.05 60)',
      sidebarBorder: 'oklch(0.25 0.02 60)',
      sidebarRing: 'oklch(0.75 0.15 75)',
      chart1: 'oklch(0.75 0.15 75)',
      chart2: 'oklch(0.65 0.12 50)',
      chart3: 'oklch(0.55 0.1 35)',
      chart4: 'oklch(0.45 0.08 25)',
      chart5: 'oklch(0.8 0.12 85)',
    },
  },
  {
    name: 'sunset',
    displayName: 'Sunset',
    description: 'Warm and vibrant orange-pink theme',
    isDark: false,
    icon: '🌅',
    gradient: 'from-orange-300 via-pink-400 to-purple-500',
    colors: {
      background: 'oklch(0.98 0.02 50)',
      foreground: 'oklch(0.2 0.02 30)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.2 0.02 30)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.2 0.02 30)',
      primary: 'oklch(0.65 0.2 40)', // Orange
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.94 0.04 50)',
      secondaryForeground: 'oklch(0.25 0.03 30)',
      muted: 'oklch(0.96 0.03 50)',
      mutedForeground: 'oklch(0.5 0.02 30)',
      accent: 'oklch(0.65 0.18 350)', // Pink
      accentForeground: 'oklch(1 0 0)',
      destructive: 'oklch(0.55 0.2 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.9 0.04 50)',
      input: 'oklch(0.9 0.04 50)',
      ring: 'oklch(0.65 0.2 40)',
      sidebar: 'oklch(0.97 0.03 50)',
      sidebarForeground: 'oklch(0.25 0.03 30)',
      sidebarPrimary: 'oklch(0.65 0.2 40)',
      sidebarPrimaryForeground: 'oklch(1 0 0)',
      sidebarAccent: 'oklch(0.94 0.06 350)',
      sidebarAccentForeground: 'oklch(0.35 0.08 350)',
      sidebarBorder: 'oklch(0.9 0.04 50)',
      sidebarRing: 'oklch(0.65 0.18 350)',
      chart1: 'oklch(0.65 0.2 40)',
      chart2: 'oklch(0.65 0.18 350)',
      chart3: 'oklch(0.7 0.18 70)',
      chart4: 'oklch(0.6 0.2 20)',
      chart5: 'oklch(0.65 0.15 320)',
    },
  },
  {
    name: 'mocha',
    displayName: 'Mocha',
    description: 'Rich coffee-inspired brown theme',
    isDark: true,
    icon: '☕',
    gradient: 'from-amber-950 via-stone-800 to-amber-900',
    colors: {
      background: 'oklch(0.18 0.02 50)',
      foreground: 'oklch(0.85 0.03 60)',
      card: 'oklch(0.22 0.025 50)',
      cardForeground: 'oklch(0.85 0.03 60)',
      popover: 'oklch(0.22 0.025 50)',
      popoverForeground: 'oklch(0.85 0.03 60)',
      primary: 'oklch(0.55 0.08 50)', // Coffee brown
      primaryForeground: 'oklch(0.95 0.02 60)',
      secondary: 'oklch(0.28 0.02 50)',
      secondaryForeground: 'oklch(0.85 0.03 60)',
      muted: 'oklch(0.28 0.02 50)',
      mutedForeground: 'oklch(0.6 0.02 50)',
      accent: 'oklch(0.6 0.1 55)', // Lighter brown
      accentForeground: 'oklch(0.95 0.02 60)',
      destructive: 'oklch(0.45 0.15 25)',
      destructiveForeground: 'oklch(0.85 0.03 60)',
      border: 'oklch(0.3 0.02 50)',
      input: 'oklch(0.28 0.02 50)',
      ring: 'oklch(0.55 0.08 50)',
      sidebar: 'oklch(0.15 0.025 50)',
      sidebarForeground: 'oklch(0.8 0.03 60)',
      sidebarPrimary: 'oklch(0.55 0.08 50)',
      sidebarPrimaryForeground: 'oklch(0.95 0.02 60)',
      sidebarAccent: 'oklch(0.4 0.06 55)',
      sidebarAccentForeground: 'oklch(0.85 0.03 60)',
      sidebarBorder: 'oklch(0.25 0.02 50)',
      sidebarRing: 'oklch(0.55 0.08 50)',
      chart1: 'oklch(0.55 0.08 50)',
      chart2: 'oklch(0.6 0.1 55)',
      chart3: 'oklch(0.45 0.06 45)',
      chart4: 'oklch(0.4 0.05 40)',
      chart5: 'oklch(0.65 0.08 60)',
    },
  },
  {
    name: 'forest',
    displayName: 'Forest',
    description: 'Natural green woodland theme',
    isDark: false,
    icon: '🌲',
    gradient: 'from-green-100 via-emerald-200 to-green-300',
    colors: {
      background: 'oklch(0.98 0.02 140)',
      foreground: 'oklch(0.2 0.03 140)',
      card: 'oklch(1 0 0)',
      cardForeground: 'oklch(0.2 0.03 140)',
      popover: 'oklch(1 0 0)',
      popoverForeground: 'oklch(0.2 0.03 140)',
      primary: 'oklch(0.5 0.12 140)', // Forest green
      primaryForeground: 'oklch(1 0 0)',
      secondary: 'oklch(0.93 0.04 140)',
      secondaryForeground: 'oklch(0.25 0.04 140)',
      muted: 'oklch(0.95 0.03 140)',
      mutedForeground: 'oklch(0.45 0.03 140)',
      accent: 'oklch(0.5 0.12 100)', // Lime green
      accentForeground: 'oklch(1 0 0)',
      destructive: 'oklch(0.55 0.18 25)',
      destructiveForeground: 'oklch(1 0 0)',
      border: 'oklch(0.88 0.04 140)',
      input: 'oklch(0.88 0.04 140)',
      ring: 'oklch(0.5 0.12 140)',
      sidebar: 'oklch(0.97 0.03 140)',
      sidebarForeground: 'oklch(0.25 0.04 140)',
      sidebarPrimary: 'oklch(0.5 0.12 140)',
      sidebarPrimaryForeground: 'oklch(1 0 0)',
      sidebarAccent: 'oklch(0.92 0.06 100)',
      sidebarAccentForeground: 'oklch(0.3 0.06 100)',
      sidebarBorder: 'oklch(0.88 0.04 140)',
      sidebarRing: 'oklch(0.5 0.12 140)',
      chart1: 'oklch(0.5 0.12 140)',
      chart2: 'oklch(0.5 0.12 100)',
      chart3: 'oklch(0.45 0.1 160)',
      chart4: 'oklch(0.4 0.08 130)',
      chart5: 'oklch(0.55 0.1 110)',
    },
  },
];

export const getTheme = (name: ThemeName): Theme => {
  return themes.find((t) => t.name === name) || themes[0];
};

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  
  // Map color keys to CSS variable names
  const cssVarMap: Record<keyof ThemeColors, string> = {
    background: '--background',
    foreground: '--foreground',
    card: '--card',
    cardForeground: '--card-foreground',
    popover: '--popover',
    popoverForeground: '--popover-foreground',
    primary: '--primary',
    primaryForeground: '--primary-foreground',
    secondary: '--secondary',
    secondaryForeground: '--secondary-foreground',
    muted: '--muted',
    mutedForeground: '--muted-foreground',
    accent: '--accent',
    accentForeground: '--accent-foreground',
    destructive: '--destructive',
    destructiveForeground: '--destructive-foreground',
    border: '--border',
    input: '--input',
    ring: '--ring',
    sidebar: '--sidebar',
    sidebarForeground: '--sidebar-foreground',
    sidebarPrimary: '--sidebar-primary',
    sidebarPrimaryForeground: '--sidebar-primary-foreground',
    sidebarAccent: '--sidebar-accent',
    sidebarAccentForeground: '--sidebar-accent-foreground',
    sidebarBorder: '--sidebar-border',
    sidebarRing: '--sidebar-ring',
    chart1: '--chart-1',
    chart2: '--chart-2',
    chart3: '--chart-3',
    chart4: '--chart-4',
    chart5: '--chart-5',
  };
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    const cssVar = cssVarMap[key as keyof ThemeColors];
    if (cssVar) {
      root.style.setProperty(cssVar, value);
    }
  });
  
  // Set dark mode class
  if (theme.isDark) {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.add('light');
    root.classList.remove('dark');
  }
  
  // Store preference
  localStorage.setItem('meetlink-theme', theme.name);
};

export const getStoredTheme = (): ThemeName => {
  if (typeof window === 'undefined') return 'light';
  const stored = localStorage.getItem('meetlink-theme') as ThemeName;
  return themes.find((t) => t.name === stored) ? stored : 'light';
};
