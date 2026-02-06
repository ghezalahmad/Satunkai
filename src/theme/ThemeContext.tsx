import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, useColorScheme } from 'react-native';
import { useAppStore } from '../store/appStore';
import { ThemeMode } from '../types';
import { colors, ColorScheme } from './colors';

interface ThemeContextType {
    theme: ColorScheme;
    isDark: boolean;
    themeMode: ThemeMode;
    setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const systemColorScheme = useColorScheme();
    const { settings, setTheme } = useAppStore();
    const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        if (settings.theme === 'system') {
            setEffectiveTheme(systemColorScheme === 'dark' ? 'dark' : 'light');
        } else {
            setEffectiveTheme(settings.theme === 'dark' ? 'dark' : 'light');
        }
    }, [settings.theme, systemColorScheme]);

    // Listen for system theme changes
    useEffect(() => {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
            if (settings.theme === 'system') {
                setEffectiveTheme(colorScheme === 'dark' ? 'dark' : 'light');
            }
        });

        return () => subscription.remove();
    }, [settings.theme]);

    const value: ThemeContextType = {
        theme: effectiveTheme === 'dark' ? colors.dark : colors.light,
        isDark: effectiveTheme === 'dark',
        themeMode: settings.theme,
        setThemeMode: setTheme,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
