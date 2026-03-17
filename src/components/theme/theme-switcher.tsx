'use client';

import { useAppStore } from '@/lib/stores/app-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import type { Theme } from '@/lib/themes';

const themeIcons: Record<string, string> = {
  light: '☀️',
  dark: '🌙',
  classy: '✨',
  sunset: '🌅',
  mocha: '☕',
  forest: '🌲',
};

const themeGradients: Record<string, string> = {
  light: 'from-white via-gray-50 to-gray-100',
  dark: 'from-slate-900 via-slate-800 to-slate-900',
  classy: 'from-amber-900 via-yellow-800 to-amber-900',
  sunset: 'from-orange-300 via-pink-400 to-purple-500',
  mocha: 'from-amber-950 via-stone-800 to-amber-900',
  forest: 'from-green-100 via-emerald-200 to-green-300',
};

export function ThemeSwitcher() {
  const { themeName, setTheme, availableThemes } = useAppStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Theme</CardTitle>
        <CardDescription>
          Choose your preferred color scheme for MeetLink
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableThemes.map((theme: Theme) => (
            <button
              key={theme.name}
              onClick={() => setTheme(theme.name)}
              className={`
                relative group rounded-xl overflow-hidden border-2 transition-all duration-200
                ${themeName === theme.name 
                  ? 'border-primary ring-2 ring-primary/20 scale-[1.02]' 
                  : 'border-transparent hover:border-muted-foreground/30 hover:scale-[1.01]'
                }
              `}
            >
              {/* Theme Preview */}
              <div 
                className={`
                  h-24 bg-gradient-to-br ${themeGradients[theme.name]}
                  flex items-center justify-center relative
                `}
              >
                <span className="text-3xl">{themeIcons[theme.name]}</span>
                
                {/* Selected indicator */}
                {themeName === theme.name && (
                  <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                    <Check className="h-3 w-3" />
                  </div>
                )}
                
                {/* Dark theme overlay indicator */}
                {theme.isDark && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/20 text-white text-[10px] py-0.5 text-center">
                    Dark Mode
                  </div>
                )}
              </div>
              
              {/* Theme Info */}
              <div className={`p-3 ${theme.isDark ? 'bg-slate-800 text-white' : 'bg-background'}`}>
                <div className="flex items-center justify-between">
                  <p className={`font-medium text-sm ${theme.isDark ? 'text-white' : 'text-foreground'}`}>
                    {theme.displayName}
                  </p>
                </div>
                <p className={`text-xs mt-0.5 line-clamp-1 ${theme.isDark ? 'text-slate-400' : 'text-muted-foreground'}`}>
                  {theme.description}
                </p>
              </div>
            </button>
          ))}
        </div>
        
        {/* Current theme info */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Current Theme</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {availableThemes.find(t => t.name === themeName)?.displayName} - 
                {availableThemes.find(t => t.name === themeName)?.description}
              </p>
            </div>
            <span className="text-2xl">{themeIcons[themeName]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
