'use client';

import { useEffect } from 'react';
import { useAppStore } from '@/lib/stores/app-store';
import { applyTheme, getStoredTheme } from '@/lib/themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { setTheme } = useAppStore();

  useEffect(() => {
    // Load stored theme on mount
    const storedTheme = getStoredTheme();
    setTheme(storedTheme);
  }, [setTheme]);

  return <>{children}</>;
}
