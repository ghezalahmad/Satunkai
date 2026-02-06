from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import yt_dlp
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Satūnkai Video API",
    description="Video URL extraction service for Satūnkai app",
    version="1.0.0"
)

# Enable CORS for mobile app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExtractRequest(BaseModel):
    url: str
    quality: str = "best"  # best, 1080, 720, 480

class ExtractResponse(BaseModel):
    success: bool
    url: str | None = None
    title: str | None = None
    thumbnail: str | None = None
    duration: int | None = None
    platform: str | None = None
    error: str | None = None

@app.get("/")
def root():
    return {"status": "ok", "service": "Satūnkai Video API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.post("/extract", response_model=ExtractResponse)
async def extract_video(request: ExtractRequest):
    """
    Extract direct video URL from social media platforms.
    Supports: YouTube, TikTok, Facebook, Instagram, Twitter/X
    """
    try:
        logger.info(f"Extracting video from: {request.url}")
        
        # yt-dlp options
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'format': get_format_string(request.quality),
            'noplaylist': True,
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(request.url, download=False)
            
            # Get the best URL
            video_url = None
            if 'url' in info:
                video_url = info['url']
            elif 'formats' in info and info['formats']:
                # Try to find a format with both video and audio
                for fmt in reversed(info['formats']):
                    if fmt.get('url') and fmt.get('vcodec') != 'none':
                        if fmt.get('acodec') != 'none':
                            video_url = fmt['url']
                            break
                # Fallback to any video format
                if not video_url:
                    for fmt in reversed(info['formats']):
                        if fmt.get('url') and fmt.get('vcodec') != 'none':
                            video_url = fmt['url']
                            break
            
            if not video_url:
                raise HTTPException(status_code=404, detail="No video URL found")
            
            # Detect platform
            platform = detect_platform(request.url)
            
            return ExtractResponse(
                success=True,
                url=video_url,
                title=info.get('title'),
                thumbnail=info.get('thumbnail'),
                duration=info.get('duration'),
                platform=platform
            )
            
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp error: {str(e)}")
        return ExtractResponse(
            success=False,
            error=f"Could not extract video: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Extraction error: {str(e)}")
        return ExtractResponse(
            success=False,
            error=f"Extraction failed: {str(e)}"
        )

def get_format_string(quality: str) -> str:
    """Get yt-dlp format string based on quality preference"""
    if quality == "1080":
        return "bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"
    elif quality == "720":
        return "bestvideo[height<=720]+bestaudio/best[height<=720]/best"
    elif quality == "480":
        return "bestvideo[height<=480]+bestaudio/best[height<=480]/best"
    else:
        return "best"

def detect_platform(url: str) -> str:
    """Detect the platform from URL"""
    url_lower = url.lower()
    if 'youtube.com' in url_lower or 'youtu.be' in url_lower:
        return 'youtube'
    elif 'tiktok.com' in url_lower:
        return 'tiktok'
    elif 'facebook.com' in url_lower or 'fb.watch' in url_lower:
        return 'facebook'
    elif 'instagram.com' in url_lower:
        return 'instagram'
    elif 'twitter.com' in url_lower or 'x.com' in url_lower:
        return 'twitter'
    else:
        return 'other'

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
