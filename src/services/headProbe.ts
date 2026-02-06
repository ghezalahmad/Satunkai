import axios from 'axios';

export interface HeadProbeResult {
    success: boolean;
    contentType?: string;
    contentLength?: number;
    isVideo: boolean;
    isAudio: boolean;
    isDownloadable: boolean;
    error?: string;
}

// Timeout for HEAD requests (5 seconds)
const HEAD_TIMEOUT = 5000;

/**
 * Perform a safe HEAD request to check Content-Type and size
 * This is used to verify if a URL points to a downloadable media file
 */
export async function probeUrl(url: string): Promise<HeadProbeResult> {
    try {
        const response = await axios.head(url, {
            timeout: HEAD_TIMEOUT,
            maxRedirects: 5,
            validateStatus: (status) => status >= 200 && status < 400,
            headers: {
                'User-Agent': 'AfgDown/1.0',
            },
        });

        const contentType = response.headers['content-type']?.toLowerCase() || '';
        const contentLengthStr = response.headers['content-length'];
        const contentLength = contentLengthStr ? parseInt(contentLengthStr, 10) : undefined;

        const isVideo = contentType.startsWith('video/');
        const isAudio = contentType.startsWith('audio/');

        // Also accept application/octet-stream as potentially downloadable
        const isOctetStream = contentType.includes('application/octet-stream');

        const isDownloadable = isVideo || isAudio || isOctetStream;

        return {
            success: true,
            contentType,
            contentLength,
            isVideo,
            isAudio,
            isDownloadable,
        };
    } catch (error) {
        let errorMessage = 'Unknown error';

        if (axios.isAxiosError(error)) {
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out';
            } else if (error.response) {
                errorMessage = `HTTP ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'No response from server';
            } else {
                errorMessage = error.message;
            }
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        return {
            success: false,
            isVideo: false,
            isAudio: false,
            isDownloadable: false,
            error: errorMessage,
        };
    }
}

/**
 * Enhanced detection that combines URL extension detection with HEAD probe
 * Falls back to extension-based detection if HEAD fails
 */
export async function enhancedProbe(url: string, hasExtension: boolean): Promise<HeadProbeResult> {
    // If URL has a valid extension, we can be more lenient
    const probeResult = await probeUrl(url);

    if (probeResult.success) {
        return probeResult;
    }

    // If HEAD failed but URL has a valid extension, still allow download
    if (hasExtension) {
        return {
            success: true,
            isVideo: true, // Assume video based on extension
            isAudio: false,
            isDownloadable: true,
            error: probeResult.error,
        };
    }

    return probeResult;
}
