'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lang } from '@/lib/translations';

export type Theme = 'light' | 'dark';

interface AccessibilityState {
  textScale: 'sm' | 'md' | 'lg';
  highContrast: boolean;
  reduceMotion: boolean;
  lang: Lang;
  voiceAssistance: boolean;
  theme: Theme;
  setTextScale: (s: 'sm' | 'md' | 'lg') => void;
  setHighContrast: (v: boolean) => void;
  setReduceMotion: (v: boolean) => void;
  setLang: (l: Lang) => void;
  setVoiceAssistance: (v: boolean) => void;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
}

const AccessibilityContext = createContext<AccessibilityState>({
  textScale: 'md',
  highContrast: false,
  reduceMotion: false,
  lang: 'en',
  voiceAssistance: false,
  theme: 'dark',
  setTextScale: () => {},
  setHighContrast: () => {},
  setReduceMotion: () => {},
  setLang: () => {},
  setVoiceAssistance: () => {},
  setTheme: () => {},
  toggleTheme: () => {},
});

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [textScale, setTextScaleState] = useState<'sm' | 'md' | 'lg'>('md');
  const [highContrast, setHighContrastState] = useState(false);
  const [reduceMotion, setReduceMotionState] = useState(false);
  const [lang, setLangState] = useState<Lang>('en');
  const [voiceAssistance, setVoiceAssistanceState] = useState(false);
  const [theme, setThemeState] = useState<Theme>('dark');

  useEffect(() => {
    const stored = localStorage.getItem('medroute-a11y');
    if (stored) {
      try {
        const p = JSON.parse(stored);
        if (p.textScale) setTextScaleState(p.textScale);
        if (p.highContrast !== undefined) setHighContrastState(p.highContrast);
        if (p.reduceMotion !== undefined) setReduceMotionState(p.reduceMotion);
        if (p.lang) setLangState(p.lang);
        if (p.voiceAssistance !== undefined) setVoiceAssistanceState(p.voiceAssistance);
        if (p.theme) setThemeState(p.theme);
      } catch {}
    } else {
      // Standard default theme is dark
      setThemeState('dark');
    }
  }, []);

  const save = (update: Partial<Record<string, unknown>>) => {
    const current = JSON.parse(localStorage.getItem('medroute-a11y') || '{}');
    localStorage.setItem('medroute-a11y', JSON.stringify({ ...current, ...update }));
  };

  // Direct DOM manipulation for instant dynamic theme & style application
  useEffect(() => {
    const scaleMap = { sm: '14px', md: '16px', lg: '19px' };
    const fontSize = scaleMap[textScale];

    document.documentElement.style.setProperty('--base-font-size', fontSize);
    document.documentElement.style.fontSize = fontSize;
    document.body.style.fontSize = fontSize;

    document.documentElement.setAttribute('data-contrast', highContrast ? 'high' : 'normal');
    document.documentElement.setAttribute('data-motion', reduceMotion ? 'reduce' : 'normal');

    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
      document.body.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
      document.body.classList.remove('high-contrast');
    }

    if (reduceMotion) {
      document.documentElement.classList.add('reduce-motion');
      document.body.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
      document.body.classList.remove('reduce-motion');
    }

    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.setAttribute('data-theme', 'light');
    }
  }, [textScale, highContrast, reduceMotion, theme]);

  const setTextScale = (s: 'sm' | 'md' | 'lg') => { setTextScaleState(s); save({ textScale: s }); };
  const setHighContrast = (v: boolean) => { setHighContrastState(v); save({ highContrast: v }); };
  const setReduceMotion = (v: boolean) => { setReduceMotionState(v); save({ reduceMotion: v }); };
  const setLang = (l: Lang) => { setLangState(l); save({ lang: l }); };
  const setVoiceAssistance = (v: boolean) => { setVoiceAssistanceState(v); save({ voiceAssistance: v }); };
  const setTheme = (t: Theme) => { setThemeState(t); save({ theme: t }); };
  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setThemeState(next);
    save({ theme: next });
  };

  return (
    <AccessibilityContext.Provider
      value={{
        textScale,
        highContrast,
        reduceMotion,
        lang,
        voiceAssistance,
        theme,
        setTextScale,
        setHighContrast,
        setReduceMotion,
        setLang,
        setVoiceAssistance,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  return useContext(AccessibilityContext);
}
