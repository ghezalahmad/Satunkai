/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ExpoFileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Download, DownloadStatus } from '../types';
import { deleteDownload, getDownloadById, insertDownload, updateDownload } from './storage';
import { generateFilename } from './urlDetect';

// Type assertion for expo-file-system module
const FileSystem = ExpoFileSystem as any;

const DOWNLOAD_DIR = (FileSystem.documentDirectory || '') + 'downloads/';
const activeDownloads: Map<string, any> = new Map();

type ProgressCallback = (id: string, progress: number, downloadedSize: number, totalSize: number) => void;
type StatusCallback = (id: string, status: DownloadStatus, error?: string) => void;

let progressCallback: ProgressCallback | null = null;
let statusCallback: StatusCallback | null = null;

// Satūnkai Backend API (your own server for reliable downloads)
const SATUNKAI_API = 'https://satunkai-api.onrender.com';

/**
 * Resolve video URL using Satūnkai backend (yt-dlp powered)
 * This is the most reliable method for all platforms
 */
async function resolveSatunkaiBackend(url: string): Promise<string | null> {
    try {
        console.log('Trying Satūnkai backend...');

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout for cold starts

        const response = await fetch(`${SATUNKAI_API}/extract`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, quality: '1080' }),
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.log('Satūnkai backend returned error:', response.status);
            return null;
        }

        const data = await response.json();

        if (data.success && data.url) {
            console.log(`Satūnkai backend resolved: ${data.platform} - ${data.title}`);
            return data.url;
        }

        console.log('Satūnkai backend could not extract:', data.error);
        return null;
    } catch (error) {
        console.log('Satūnkai backend error:', error);
        return null;
    }
}

export function setDownloadCallbacks(onProgress: ProgressCallback, onStatus: StatusCallback): void {
    progressCallback = onProgress;
    statusCallback = onStatus;
}

async function ensureDownloadDir(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
    if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
    }
}

function generateId(): string {
    return `dl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract YouTube Video ID from URL
 */
function extractYoutubeId(url: string): string | null {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=|\/shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
}

/**
 * Resolve YouTube via Piped API
 * Using a simple fetch without complex headers to avoid blocks
 */
async function resolveYoutube(url: string): Promise<string | null> {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;

    // List of Piped instances (verified working Feb 2026)
    const instances = [
        'https://api.piped.private.coffee',      // Verified working
        'https://pipedapi.kavin.rocks',          // Original
        'https://pipedapi.tokhmi.xyz',
        'https://pipedapi.moomoo.me',
        'https://pipedapi.syncpundit.io',
        'https://api.piped.yt',
        'https://pipedapi.r4fo.com',
        'https://piped-api.lunar.icu',
        'https://pipedapi.leptons.xyz'
    ];

    console.log(`Attempting to resolve YouTube ID: ${videoId}`);

    for (const instance of instances) {
        try {
            const apiUrl = `${instance}/streams/${videoId}`;
            console.log(`Trying Piped API: ${apiUrl}`);

            // Increased timeout to 8 seconds for slower connections
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(apiUrl, {
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json' // Simple header
                }
            });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();

            if (data.videoStreams && data.videoStreams.length > 0) {
                // Filter streams that have both video and audio
                const validStreams = data.videoStreams.filter((s: any) => !s.videoOnly);

                if (validStreams.length > 0) {
                    // Prefer highest quality: 1080p > 720p > 480p > any
                    const bestStream =
                        validStreams.find((s: any) => s.quality === '1080p') ||
                        validStreams.find((s: any) => s.quality === '720p') ||
                        validStreams.find((s: any) => s.quality === '480p') ||
                        validStreams[0];
                    console.log(`Piped resolved: ${bestStream.quality} - ${bestStream.url}`);
                    return bestStream.url;
                }
            }
        } catch (e) {
            console.warn(`Piped instance ${instance} skipped`);
        }
    }
    return null;
}

/**
 * Resolve YouTube via Invidious API (fallback)
 */
async function resolveYoutubeInvidious(url: string): Promise<string | null> {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;

    const instances = [
        'https://inv.nadeko.net',
        'https://invidious.protokolla.fi',
        'https://invidious.private.coffee',
        'https://iv.datura.network',
        'https://invidious.nerdvpn.de'
    ];

    console.log('Trying Invidious API fallback...');

    for (const instance of instances) {
        try {
            const apiUrl = `${instance}/api/v1/videos/${videoId}`;
            console.log(`Trying Invidious: ${apiUrl}`);

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(apiUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) continue;

            const data = await response.json();

            if (data.formatStreams && data.formatStreams.length > 0) {
                // Prefer highest quality with audio
                const bestStream =
                    data.formatStreams.find((s: any) => s.qualityLabel === '1080p') ||
                    data.formatStreams.find((s: any) => s.qualityLabel === '720p') ||
                    data.formatStreams.find((s: any) => s.qualityLabel === '480p') ||
                    data.formatStreams[0];

                if (bestStream && bestStream.url) {
                    console.log(`Invidious resolved: ${bestStream.qualityLabel}`);
                    return bestStream.url;
                }
            }
        } catch (e) {
            console.warn(`Invidious instance ${instance} skipped`);
        }
    }
    return null;
}

/**
 * Resolve via Cobalt API
 * FIX: Removed Origin/Referer headers that cause "Network Request Failed"
 */
async function fetchCobalt(apiUrl: string, originalUrl: string): Promise<string | null> {
    try {
        console.log(`Trying Cobalt API at: ${apiUrl}`);

        // FIX: Simplified headers. 
        // Many community servers block requests with 'Origin' headers that don't match their domain.
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                // Generic User-Agent that doesn't trigger bot protection
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Connection': 'keep-alive'
            },
            body: JSON.stringify({
                url: originalUrl,
                vQuality: '1080',  // Request highest quality (1080p)
                aFormat: 'mp3',    // Audio format
                isNoTTWatermark: true  // No TikTok watermark
            })
        });

        if (!response.ok) {
            // Only log if it's a real error, to keep logs clean
            if (response.status !== 404) {
                console.warn(`Cobalt ${apiUrl} returned status ${response.status}`);
            }
            return null;
        }

        const data = await response.json();

        if (data.status === 'stream' || data.status === 'redirect') {
            return data.url;
        }
        if (data.status === 'picker' && data.picker && data.picker.length > 0) {
            return data.picker[0].url;
        }

        return null;
    } catch (e) {
        // "Network request failed" is usually caught here
        console.warn(`Cobalt connection failed to ${apiUrl}`);
        return null;
    }
}

/**
 * Main URL Resolver
 */
async function resolveMediaUrl(originalUrl: string): Promise<string> {
    const url = originalUrl.toLowerCase();

    // 1. TIKTOK (TikWM FIRST - most reliable, yt-dlp URLs are domain-restricted)
    if (url.includes('tiktok.com')) {
        try {
            console.log('Fetching TikTok data from TikWM (HD)...');
            const response = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(originalUrl)}&hd=1`);
            const data = await response.json();
            // Prefer HD version, fallback to standard
            if (data.data) {
                if (data.data.hdplay) {
                    console.log('TikTok: Using HD version from TikWM');
                    return data.data.hdplay;
                }
                if (data.data.play) {
                    console.log('TikTok: HD not available, using standard from TikWM');
                    return data.data.play;
                }
            }
        } catch (e) {
            console.warn('TikWM failed, trying backend fallback');
            // Try backend as fallback for TikTok
            const backendUrl = await resolveSatunkaiBackend(originalUrl);
            if (backendUrl) return backendUrl;
        }
    }

    // Check if it's a social media URL that our backend supports (excluding TikTok)
    const isSocialMedia =
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('facebook.com') ||
        url.includes('fb.watch') ||
        url.includes('instagram.com') ||
        url.includes('twitter.com') ||
        url.includes('x.com');

    // 2. TRY SATUNKAI BACKEND FOR OTHER PLATFORMS
    if (isSocialMedia) {
        const backendUrl = await resolveSatunkaiBackend(originalUrl);
        if (backendUrl) return backendUrl;
        console.log('Satūnkai backend failed, trying fallback APIs...');
    }

    // 2. YOUTUBE (Piped API first, then Invidious)
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        // Try Piped first
        const ytUrl = await resolveYoutube(originalUrl);
        if (ytUrl) return ytUrl;
        console.log('Piped API failed, trying Invidious...');

        // Try Invidious as second option
        const invUrl = await resolveYoutubeInvidious(originalUrl);
        if (invUrl) return invUrl;
        console.log('Invidious failed, falling back to Cobalt...');
    }

    // 3. GENERAL FALLBACK (Cobalt)
    if (
        url.includes('facebook.com') ||
        url.includes('fb.watch') ||
        url.includes('instagram.com') ||
        url.includes('tiktok.com') ||
        url.includes('youtube.com') ||
        url.includes('youtu.be') ||
        url.includes('twitter.com') ||
        url.includes('x.com')
    ) {
        // Updated Cobalt instances (mixed v7 and v10)
        const cobaltInstances = [
            // v7 instances (use /api/json endpoint)
            'https://api.cobalt.tools/api/json',
            'https://cobalt.api.hyper.lol/api/json',
            'https://dl.khyernet.xyz/api/json',
            'https://cobalt.anythingtv.gay/api/json',
            // Direct v10 instances
            'https://cobalt.nohea.tech',
            'https://cobalt-api.kwiatekmiki.pl'
        ];

        for (const instance of cobaltInstances) {
            // Small random delay
            if (instance !== cobaltInstances[0]) {
                await new Promise(r => setTimeout(r, Math.floor(Math.random() * 800) + 200));
            }

            const videoUrl = await fetchCobalt(instance, originalUrl);
            if (videoUrl) return videoUrl;
        }

        // Platform-specific error messages
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            throw new Error("YouTube is blocking downloads. Try 'Open in App' to watch on YouTube, or try a different video.");
        } else if (url.includes('facebook.com') || url.includes('fb.watch')) {
            throw new Error("Facebook video unavailable. Try 'Open in App' to view on Facebook, or make sure the video is public.");
        } else if (url.includes('instagram.com')) {
            throw new Error("Instagram content unavailable. Try 'Open in App' to view on Instagram. Private accounts cannot be downloaded.");
        } else if (url.includes('twitter.com') || url.includes('x.com')) {
            throw new Error("X/Twitter video unavailable. Try 'Open in App' to view, or the tweet may be private/deleted.");
        } else {
            throw new Error("Video unavailable. The content may be private, deleted, or temporarily blocked.");
        }
    }

    return originalUrl;
}

export async function startDownload(url: string, customFilename?: string): Promise<Download> {
    await ensureDownloadDir();

    const id = generateId();
    const download: Download = {
        id,
        url,
        filename: customFilename || generateFilename(url),
        localPath: '',
        size: 0,
        downloadedSize: 0,
        status: 'pending',
        progress: 0,
        createdAt: Date.now(),
    };

    await insertDownload(download);
    if (statusCallback) statusCallback(id, 'downloading');

    try {
        // 1. Resolve URL
        const directUrl = await resolveMediaUrl(url);

        // 2. Safety Check
        if (directUrl === url && (url.includes('youtube') || url.includes('youtu.be') || url.includes('tiktok'))) {
            throw new Error("Could not extract direct video link");
        }

        // 3. Update filename
        let filename = download.filename;
        if (!filename.match(/\.(mp4|mov|avi|mkv)$/i)) filename += '.mp4';
        const localPath = DOWNLOAD_DIR + filename;

        download.filename = filename;
        download.localPath = localPath;
        await updateDownload({ id, filename, localPath });

        // 4. Download file
        const downloadResumable = FileSystem.createDownloadResumable(
            directUrl,
            localPath,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Referer': url, // Add original URL as referer
                    'Accept': '*/*',
                    'Accept-Language': 'en-US,en;q=0.9',
                },
            },
            (downloadProgress: any) => {
                const progress = downloadProgress.totalBytesExpectedToWrite > 0
                    ? downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite
                    : 0;

                if (progressCallback) progressCallback(id, progress, downloadProgress.totalBytesWritten, downloadProgress.totalBytesExpectedToWrite);

                // Update DB less frequently
                const progressPercent = Math.floor(progress * 10);
                const currentProgress = download.progress ? Math.floor(download.progress * 10) : 0;
                if (progressPercent > currentProgress) {
                    updateDownload({
                        id,
                        progress,
                        downloadedSize: downloadProgress.totalBytesWritten,
                        size: downloadProgress.totalBytesExpectedToWrite,
                    });
                }
            }
        );

        activeDownloads.set(id, downloadResumable);
        download.status = 'downloading';
        await updateDownload({ id, status: 'downloading' });

        const result = await downloadResumable.downloadAsync();

        if (result) {
            const fileInfo = await FileSystem.getInfoAsync(result.uri);
            if (fileInfo.size < 10000) throw new Error("Download failed (File too small/corrupt)");

            // Save to device Gallery/Photos
            try {
                const { status } = await MediaLibrary.requestPermissionsAsync();
                if (status === 'granted') {
                    await MediaLibrary.saveToLibraryAsync(result.uri);
                    console.log('Video saved to Gallery!');
                }
            } catch (galleryError) {
                console.warn('Could not save to Gallery:', galleryError);
            }

            download.status = 'completed';
            download.progress = 1;
            download.completedAt = Date.now();
            download.localPath = result.uri;
            download.size = fileInfo.size || 0;
            download.downloadedSize = download.size;

            await updateDownload({ ...download });
            if (statusCallback) statusCallback(id, 'completed');
        }
    } catch (error) {
        console.error("Download flow failed:", error);
        const errorMessage = error instanceof Error ? error.message : 'Download failed';
        download.status = 'failed';
        download.error = errorMessage;

        activeDownloads.delete(id);
        await updateDownload({ id, status: 'failed', error: errorMessage });
        if (statusCallback) statusCallback(id, 'failed', errorMessage);
        return download;
    } finally {
        activeDownloads.delete(id);
    }
    return download;
}

export async function cancelDownload(id: string): Promise<void> {
    const downloadResumable = activeDownloads.get(id);
    if (downloadResumable) {
        try {
            await downloadResumable.pauseAsync();
            activeDownloads.delete(id);
        } catch (error) {
            console.error('Error pausing download:', error);
        }
    }
    await updateDownload({ id, status: 'cancelled' });
    if (statusCallback) statusCallback(id, 'cancelled');
}

export async function removeDownload(id: string): Promise<void> {
    await cancelDownload(id);
    const download = await getDownloadById(id);
    if (download?.localPath) {
        try {
            const fileInfo = await FileSystem.getInfoAsync(download.localPath);
            if (fileInfo.exists) await FileSystem.deleteAsync(download.localPath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }
    }
    await deleteDownload(id);
}

export async function fileExists(path: string): Promise<boolean> {
    try {
        const info = await FileSystem.getInfoAsync(path);
        return info.exists;
    } catch {
        return false;
    }
}

export function getDownloadDirectory(): string {
    return DOWNLOAD_DIR;
}

export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const units = ['B', 'KB', 'MB', 'GB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}