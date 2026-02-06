import {
    detectPlatform,
    detectUrl,
    generateFilename,
    getFileExtension,
    isDirectFileUrl,
    normalizeUrl,
} from '../urlDetect';

describe('urlDetect', () => {
    describe('normalizeUrl', () => {
        it('should add https:// if no protocol', () => {
            expect(normalizeUrl('youtube.com/watch?v=abc')).toBe('https://youtube.com/watch?v=abc');
        });

        it('should keep existing https://', () => {
            expect(normalizeUrl('https://youtube.com/watch?v=abc')).toBe('https://youtube.com/watch?v=abc');
        });

        it('should keep existing http://', () => {
            expect(normalizeUrl('http://example.com')).toBe('http://example.com/');
        });

        it('should remove trailing slashes from path', () => {
            expect(normalizeUrl('https://example.com/path/')).toBe('https://example.com/path');
        });

        it('should trim whitespace', () => {
            expect(normalizeUrl('  https://example.com  ')).toBe('https://example.com/');
        });
    });

    describe('getFileExtension', () => {
        it('should extract .mp4 extension', () => {
            expect(getFileExtension('https://example.com/video.mp4')).toBe('.mp4');
        });

        it('should extract .webm extension', () => {
            expect(getFileExtension('https://example.com/video.webm')).toBe('.webm');
        });

        it('should handle extensions with query params', () => {
            expect(getFileExtension('https://example.com/video.mp4?quality=hd')).toBe('.mp4');
        });

        it('should return undefined for no extension', () => {
            expect(getFileExtension('https://youtube.com/watch?v=abc')).toBeUndefined();
        });

        it('should return undefined for invalid URL', () => {
            expect(getFileExtension('not a url')).toBeUndefined();
        });
    });

    describe('isDirectFileUrl', () => {
        it('should return true for .mp4 URLs', () => {
            expect(isDirectFileUrl('https://example.com/video.mp4')).toBe(true);
        });

        it('should return true for .mov URLs', () => {
            expect(isDirectFileUrl('https://example.com/video.mov')).toBe(true);
        });

        it('should return true for .webm URLs', () => {
            expect(isDirectFileUrl('https://example.com/video.webm')).toBe(true);
        });

        it('should return true for .mp3 audio URLs', () => {
            expect(isDirectFileUrl('https://example.com/audio.mp3')).toBe(true);
        });

        it('should return false for YouTube watch URLs', () => {
            expect(isDirectFileUrl('https://youtube.com/watch?v=abc')).toBe(false);
        });

        it('should return false for HTML pages', () => {
            expect(isDirectFileUrl('https://example.com/page.html')).toBe(false);
        });
    });

    describe('detectPlatform', () => {
        // YouTube
        it('should detect youtube.com', () => {
            expect(detectPlatform('https://youtube.com/watch?v=abc')).toBe('youtube');
        });

        it('should detect www.youtube.com', () => {
            expect(detectPlatform('https://www.youtube.com/watch?v=abc')).toBe('youtube');
        });

        it('should detect youtu.be short URLs', () => {
            expect(detectPlatform('https://youtu.be/abc123')).toBe('youtube');
        });

        it('should detect m.youtube.com', () => {
            expect(detectPlatform('https://m.youtube.com/watch?v=abc')).toBe('youtube');
        });

        // TikTok
        it('should detect tiktok.com', () => {
            expect(detectPlatform('https://tiktok.com/@user/video/123')).toBe('tiktok');
        });

        it('should detect www.tiktok.com', () => {
            expect(detectPlatform('https://www.tiktok.com/@user/video/123')).toBe('tiktok');
        });

        it('should detect vm.tiktok.com short URLs', () => {
            expect(detectPlatform('https://vm.tiktok.com/abc123')).toBe('tiktok');
        });

        // Instagram
        it('should detect instagram.com', () => {
            expect(detectPlatform('https://instagram.com/p/abc123')).toBe('instagram');
        });

        it('should detect www.instagram.com', () => {
            expect(detectPlatform('https://www.instagram.com/reel/abc123')).toBe('instagram');
        });

        // Facebook
        it('should detect facebook.com', () => {
            expect(detectPlatform('https://facebook.com/video/123')).toBe('facebook');
        });

        it('should detect fb.watch short URLs', () => {
            expect(detectPlatform('https://fb.watch/abc123')).toBe('facebook');
        });

        it('should detect m.facebook.com', () => {
            expect(detectPlatform('https://m.facebook.com/watch?v=123')).toBe('facebook');
        });

        // Other
        it('should return other for unknown domains', () => {
            expect(detectPlatform('https://example.com/video.mp4')).toBe('other');
        });

        it('should return other for direct file URLs', () => {
            expect(detectPlatform('https://cdn.example.com/media/video.webm')).toBe('other');
        });
    });

    describe('detectUrl', () => {
        it('should detect direct file as downloadable', () => {
            const result = detectUrl('https://example.com/video.mp4');
            expect(result.platform).toBe('other');
            expect(result.isDirectFile).toBe(true);
            expect(result.canDownload).toBe(true);
            expect(result.fileExtension).toBe('.mp4');
        });

        it('should detect YouTube as not downloadable', () => {
            const result = detectUrl('https://youtube.com/watch?v=abc');
            expect(result.platform).toBe('youtube');
            expect(result.isDirectFile).toBe(false);
            expect(result.canDownload).toBe(false);
        });

        it('should detect TikTok as not downloadable', () => {
            const result = detectUrl('https://tiktok.com/@user/video/123');
            expect(result.platform).toBe('tiktok');
            expect(result.isDirectFile).toBe(false);
            expect(result.canDownload).toBe(false);
        });

        it('should handle empty URL', () => {
            const result = detectUrl('');
            expect(result.canDownload).toBe(false);
            expect(result.message).toContain('valid URL');
        });

        it('should normalize URL in result', () => {
            const result = detectUrl('youtube.com/watch?v=abc');
            expect(result.normalizedUrl).toBe('https://youtube.com/watch?v=abc');
            expect(result.originalUrl).toBe('youtube.com/watch?v=abc');
        });
    });

    describe('generateFilename', () => {
        it('should extract filename from URL path', () => {
            expect(generateFilename('https://example.com/videos/my-video.mp4')).toBe('my-video.mp4');
        });

        it('should handle URL-encoded filenames', () => {
            expect(generateFilename('https://example.com/my%20video.mp4')).toBe('my video.mp4');
        });

        it('should generate fallback for URLs without filename', () => {
            const filename = generateFilename('https://example.com/');
            expect(filename).toMatch(/^download_\d+\.mp4$/);
        });

        it('should use correct extension from URL', () => {
            const filename = generateFilename('https://example.com/audio.mp3');
            expect(filename).toBe('audio.mp3');
        });
    });
});
