// Platform types for URL detection
export type Platform = 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'other';

export interface DetectionResult {
    platform: Platform;
    isDirectFile: boolean;
    originalUrl: string;
    normalizedUrl: string;
    fileExtension?: string;
    contentType?: string;
    canDownload: boolean;
    message: string;
}

// Download types
export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'cancelled';

export interface Download {
    id: string;
    url: string;
    filename: string;
    localPath: string;
    size: number;
    downloadedSize: number;
    status: DownloadStatus;
    progress: number;
    createdAt: number;
    completedAt?: number;
    error?: string;
}

// Settings types
export type ThemeMode = 'light' | 'dark' | 'system';
export type Language = 'en' | 'da' | 'ps'; // English / Dari / Pashto

export interface Settings {
    theme: ThemeMode;
    language: Language;
}

// Ad types
export interface AdState {
    isLoading: boolean;
    isLoaded: boolean;
    error?: string;
}
