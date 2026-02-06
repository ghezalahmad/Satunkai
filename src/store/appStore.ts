import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAllDownloads, searchDownloads } from '../services/storage';
import { DetectionResult, Download, Language, Settings, ThemeMode } from '../types';

interface AppState {
    // Current URL and detection
    currentUrl: string;
    detectionResult: DetectionResult | null;
    isDetecting: boolean;

    // Downloads
    downloads: Download[];
    activeDownloadId: string | null;

    // Settings
    settings: Settings;

    // Actions - URL
    setCurrentUrl: (url: string) => void;
    setDetectionResult: (result: DetectionResult | null) => void;
    setIsDetecting: (isDetecting: boolean) => void;
    clearDetection: () => void;

    // Actions - Downloads
    setDownloads: (downloads: Download[]) => void;
    addDownload: (download: Download) => void;
    updateDownload: (id: string, updates: Partial<Download>) => void;
    removeDownload: (id: string) => void;
    setActiveDownloadId: (id: string | null) => void;
    refreshDownloads: () => Promise<void>;
    searchDownloads: (query: string) => Promise<void>;

    // Actions - Settings
    setTheme: (theme: ThemeMode) => void;
    setLanguage: (language: Language) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Initial state
            currentUrl: '',
            detectionResult: null,
            isDetecting: false,
            downloads: [],
            activeDownloadId: null,
            settings: {
                theme: 'system',
                language: 'en',
            },

            // URL actions
            setCurrentUrl: (url) => set({ currentUrl: url }),
            setDetectionResult: (result) => set({ detectionResult: result }),
            setIsDetecting: (isDetecting) => set({ isDetecting }),
            clearDetection: () => set({ currentUrl: '', detectionResult: null }),

            // Download actions
            setDownloads: (downloads) => set({ downloads }),

            addDownload: (download) =>
                set((state) => ({
                    downloads: [download, ...state.downloads],
                })),

            updateDownload: (id, updates) =>
                set((state) => ({
                    downloads: state.downloads.map((dl) =>
                        dl.id === id ? { ...dl, ...updates } : dl
                    ),
                })),

            removeDownload: (id) =>
                set((state) => ({
                    downloads: state.downloads.filter((dl) => dl.id !== id),
                })),

            setActiveDownloadId: (id) => set({ activeDownloadId: id }),

            refreshDownloads: async () => {
                try {
                    const downloads = await getAllDownloads();
                    set({ downloads });
                } catch (error) {
                    console.error('Failed to refresh downloads:', error);
                }
            },

            searchDownloads: async (query) => {
                try {
                    if (!query.trim()) {
                        await get().refreshDownloads();
                        return;
                    }
                    const downloads = await searchDownloads(query);
                    set({ downloads });
                } catch (error) {
                    console.error('Failed to search downloads:', error);
                }
            },

            // Settings actions
            setTheme: (theme) =>
                set((state) => ({
                    settings: { ...state.settings, theme },
                })),

            setLanguage: (language) =>
                set((state) => ({
                    settings: { ...state.settings, language },
                })),
        }),
        {
            name: 'afgdown-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                settings: state.settings,
            }),
        }
    )
);
