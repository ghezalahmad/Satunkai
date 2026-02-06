import { DetectionResult, Platform } from '../types';

// Video file extensions that can be downloaded directly
const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.flv', '.wmv', '.3gp'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.aac', '.flac', '.ogg', '.m4a', '.wma'];
const DOWNLOADABLE_EXTENSIONS = [...VIDEO_EXTENSIONS, ...AUDIO_EXTENSIONS];

// Platform URL patterns
const PLATFORM_PATTERNS: Record<Platform, RegExp[]> = {
    youtube: [
        /^https?:\/\/(www\.)?(m\.)?youtube\.com\/watch\?.*v=[\w-]{6,}/i,
        /^https?:\/\/(www\.)?(m\.)?youtube\.com\/shorts\/[\w-]{6,}/i,
        /^https?:\/\/(www\.)?youtu\.be\/[\w-]{6,}/i,
    ],
    tiktok: [
        /^https?:\/\/(www\.)?(m\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/i,
        /^https?:\/\/(vm|vt)\.tiktok\.com\/[\w/.-]+/i,
    ],
    instagram: [
        /^https?:\/\/(www\.)?(m\.)?instagram\.com\/reel\/[\w-]+/i,
        /^https?:\/\/(www\.)?(m\.)?instagram\.com\/p\/[\w-]+/i,
        /^https?:\/\/(www\.)?(m\.)?instagram\.com\/tv\/[\w-]+/i,
    ],
    facebook: [
        /^https?:\/\/(www\.)?(m\.)?facebook\.com\/watch\/?\?.*v=\d+/i,
        /^https?:\/\/(www\.)?(m\.)?facebook\.com\/.*\/videos\/\d+/i,
        /^https?:\/\/fb\.watch\/[\w-]+/i,
    ],
    other: [],
};

// Platforms allowed for processing
const ALLOWED_PLATFORMS: Platform[] = ['youtube', 'tiktok', 'instagram', 'facebook'];

export function isAllowedPlatform(platform: Platform): boolean {
    return ALLOWED_PLATFORMS.includes(platform);
}

/**
 * Normalize a URL by adding protocol if missing and cleaning up
 */
export function normalizeUrl(url: string): string {
    let normalized = url.trim();
    if (!normalized.match(/^https?:\/\//i)) {
        normalized = 'https://' + normalized;
    }
    try {
        const urlObj = new URL(normalized);
        urlObj.pathname = urlObj.pathname.replace(/\/+$/, '') || '/';
        return urlObj.toString();
    } catch {
        return normalized;
    }
}

/**
 * Extract file extension from URL
 */
export function getFileExtension(url: string): string | undefined {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const lastDotIndex = pathname.lastIndexOf('.');

        if (lastDotIndex === -1 || lastDotIndex === pathname.length - 1) {
            return undefined;
        }
        const extension = pathname.substring(lastDotIndex).toLowerCase();
        if (extension.length <= 6 && /^\.[a-z0-9]+$/i.test(extension)) {
            return extension;
        }
        return undefined;
    } catch {
        return undefined;
    }
}

/**
 * Check if a URL points to a direct downloadable file based on extension
 */
export function isDirectFileUrl(url: string): boolean {
    const extension = getFileExtension(url);
    if (!extension) return false;
    return DOWNLOADABLE_EXTENSIONS.includes(extension.toLowerCase());
}

/**
 * Detect which platform a URL belongs to
 */
export function detectPlatform(url: string): Platform {
    const normalized = normalizeUrl(url);

    for (const [platform, patterns] of Object.entries(PLATFORM_PATTERNS)) {
        if (platform === 'other') continue;
        for (const pattern of patterns) {
            if (pattern.test(normalized)) {
                return platform as Platform;
            }
        }
    }
    return 'other';
}

/**
 * Get compliance message for a platform
 */
function getComplianceMessage(platform: Platform, isDirectFile: boolean): string {
    if (isDirectFile) {
        return 'This is a direct media file. You can download it.';
    }
    // These messages are fallbacks; if supported, they are overridden in detectUrl
    const messages: Record<Platform, string> = {
        youtube: 'YouTube video detected.',
        tiktok: 'TikTok video detected.',
        instagram: 'Instagram video detected.',
        facebook: 'Facebook video detected.',
        other: 'This URL does not appear to be a downloadable media file.',
    };
    return messages[platform];
}

/**
 * Get the app scheme for opening in native app
 */
export function getAppScheme(platform: Platform): string | undefined {
    const schemes: Partial<Record<Platform, string>> = {
        youtube: 'youtube://',
        tiktok: 'snssdk1128://',
        instagram: 'instagram://',
        facebook: 'fb://',
    };
    return schemes[platform];
}

/**
 * Main detection function - analyzes a URL and returns detection result
 */
export function detectUrl(url: string): DetectionResult {
    if (!url || typeof url !== 'string') {
        return {
            platform: 'other',
            isDirectFile: false,
            originalUrl: url || '',
            normalizedUrl: '',
            canDownload: false,
            message: 'Please enter a valid URL.',
        };
    }

    const normalizedUrl = normalizeUrl(url);
    const isDirectFile = isDirectFileUrl(normalizedUrl);

    if (isDirectFile) {
        const fileExtension = getFileExtension(normalizedUrl);
        return {
            platform: 'other',
            isDirectFile: true,
            originalUrl: url,
            normalizedUrl,
            fileExtension,
            canDownload: true,
            message: 'This is a direct media file. You can download it.',
        };
    }

    const platform = detectPlatform(normalizedUrl);
    let fileExtension = getFileExtension(normalizedUrl);

    if (!isAllowedPlatform(platform)) {
        return {
            platform,
            isDirectFile: false,
            originalUrl: url,
            normalizedUrl,
            fileExtension,
            canDownload: false,
            message: 'Only YouTube, TikTok, Instagram, and Facebook links are supported.',
        };
    }

    // ENABLE ALL 4 PLATFORMS
    const isSupportedPlatform = ['youtube', 'tiktok', 'instagram', 'facebook'].includes(platform);

    return {
        platform,
        isDirectFile: false,
        originalUrl: url,
        normalizedUrl,
        // Force .mp4 extension so the file saves correctly
        fileExtension: isSupportedPlatform ? '.mp4' : fileExtension,
        // Enable download button
        canDownload: isSupportedPlatform,
        message: isSupportedPlatform
            ? 'Ready to download.'
            : getComplianceMessage(platform, false),
    };
}

/**
 * Generate a filename from URL
 */
export function generateFilename(url: string): string {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const segments = pathname.split('/').filter(Boolean);

        if (segments.length > 0) {
            const lastSegment = segments[segments.length - 1];
            const decoded = decodeURIComponent(lastSegment);
            const cleaned = decoded.split('?')[0];
            if (cleaned && cleaned.length > 0) {
                return cleaned;
            }
        }
    } catch {
        // Fall through
    }
    const timestamp = Date.now();
    const extension = getFileExtension(url) || '.mp4';
    return `download_${timestamp}${extension}`;
}