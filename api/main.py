"""
Spotify Clone API - Simple Music Streaming Backend
One file API for YouTube Music integration
Deploy on Render.com (Free Tier) or Google Cloud Run
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from contextlib import asynccontextmanager
from ytmusicapi import YTMusic
import yt_dlp
from typing import Optional, List, Dict, Any
from cachetools import TTLCache
import asyncio
from concurrent.futures import ThreadPoolExecutor
import httpx
import os

# ============ Keep-Alive Configuration ============
KEEP_ALIVE_ENABLED = os.environ.get("KEEP_ALIVE", "true").lower() == "true"
KEEP_ALIVE_URL = os.environ.get("RENDER_EXTERNAL_URL", "")  # Auto-set by Render
KEEP_ALIVE_INTERVAL = 600  # 10 minutes in seconds

async def keep_alive_ping():
    """Background task to ping health endpoint and prevent Render from sleeping"""
    if not KEEP_ALIVE_URL:
        print("⚠️ RENDER_EXTERNAL_URL not set, keep-alive disabled")
        return
    
    health_url = f"{KEEP_ALIVE_URL}/health"
    print(f"🏓 Starting keep-alive pings to: {health_url}")
    
    async with httpx.AsyncClient() as client:
        while True:
            await asyncio.sleep(KEEP_ALIVE_INTERVAL)
            try:
                response = await client.get(health_url, timeout=30)
                print(f"🏓 Keep-alive ping: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Keep-alive ping failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown events"""
    # Startup
    if KEEP_ALIVE_ENABLED and KEEP_ALIVE_URL:
        asyncio.create_task(keep_alive_ping())
        print("✅ Keep-alive task started")
    yield
    # Shutdown
    print("👋 Shutting down...")

# ============ Configuration ============
app = FastAPI(
    title="Spotify Clone API",
    description="Music streaming API powered by YouTube Music",
    version="1.0.0",
    lifespan=lifespan  # Enable keep-alive background task
)

# CORS - Allow all origins (update for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize YouTube Music API
ytmusic = YTMusic()

# Thread pool for sync operations
executor = ThreadPoolExecutor(max_workers=4)

# Caches (TTL in seconds)
search_cache = TTLCache(maxsize=500, ttl=300)      # 5 min
song_cache = TTLCache(maxsize=1000, ttl=600)       # 10 min
stream_cache = TTLCache(maxsize=200, ttl=1800)     # 30 min
artist_cache = TTLCache(maxsize=200, ttl=3600)     # 1 hour


# ============ Helper Functions ============
async def run_sync(func, *args, **kwargs):
    """Run sync function in thread pool"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(executor, lambda: func(*args, **kwargs))


def get_best_thumbnail(thumbnails: List[Dict]) -> Optional[str]:
    """Get highest quality thumbnail"""
    if not thumbnails:
        return None
    sorted_thumbs = sorted(thumbnails, key=lambda x: x.get('width', 0), reverse=True)
    return sorted_thumbs[0].get('url') if sorted_thumbs else None


def parse_song(item: Dict) -> Optional[Dict]:
    """Parse song from YTMusic response"""
    try:
        video_id = item.get('videoId')
        if not video_id:
            return None
        
        artists = item.get('artists', [])
        artist_name = ', '.join([a.get('name', '') for a in artists]) if artists else 'Unknown'
        artist_id = artists[0].get('id') if artists else None
        
        album = item.get('album', {})
        
        return {
            'videoId': video_id,
            'title': item.get('title', 'Unknown'),
            'artist': artist_name,
            'artistId': artist_id,
            'album': album.get('name') if album else None,
            'albumId': album.get('id') if album else None,
            'duration': item.get('duration', ''),
            'thumbnail': get_best_thumbnail(item.get('thumbnails', [])),
            'isExplicit': item.get('isExplicit', False)
        }
    except:
        return None


# ============ API Endpoints ============

@app.get("/")
async def root():
    """API info"""
    return {
        "name": "Spotify Clone API",
        "version": "1.0.0",
        "endpoints": {
            "search": "/search?q=song+name",
            "stream": "/stream/{videoId}",
            "song": "/song/{videoId}",
            "related": "/related/{videoId}",
            "lyrics": "/lyrics/{videoId}",
            "artist": "/artist/{browseId}",
            "album": "/album/{browseId}",
            "trending": "/trending",
            "genres": "/genres"
        }
    }


@app.get("/health")
async def health():
    """Health check for Cloud Run"""
    return {"status": "ok"}


# ============ Search ============

@app.get("/search")
async def search_songs(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=50)
):
    """Search for songs"""
    cache_key = f"search:{q}:{limit}"
    
    if cache_key in search_cache:
        return search_cache[cache_key]
    
    try:
        results = await run_sync(ytmusic.search, q, filter="songs", limit=limit)
        songs = [parse_song(item) for item in results if parse_song(item)]
        
        response = {"query": q, "results": songs}
        search_cache[cache_key] = response
        return response
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")


@app.get("/search/all")
async def search_all(
    q: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=20)
):
    """Search songs, artists, albums"""
    try:
        songs = await run_sync(ytmusic.search, q, filter="songs", limit=limit)
        artists = await run_sync(ytmusic.search, q, filter="artists", limit=limit)
        albums = await run_sync(ytmusic.search, q, filter="albums", limit=limit)
        
        return {
            "query": q,
            "songs": [parse_song(s) for s in songs if parse_song(s)],
            "artists": [
                {
                    "browseId": a.get('browseId', ''),
                    "name": a.get('artist', a.get('name', '')),
                    "thumbnail": get_best_thumbnail(a.get('thumbnails', []))
                }
                for a in artists
            ],
            "albums": [
                {
                    "browseId": a.get('browseId', ''),
                    "title": a.get('title', ''),
                    "artist": ', '.join([x.get('name', '') for x in a.get('artists', [])]),
                    "thumbnail": get_best_thumbnail(a.get('thumbnails', []))
                }
                for a in albums
            ]
        }
    except Exception as e:
        raise HTTPException(500, f"Search failed: {str(e)}")


# ============ Streaming ============

# Piped API instances (fallback list)
PIPED_INSTANCES = [
    "https://pipedapi.kavin.rocks",
    "https://pipedapi.adminforge.de",
    "https://api.piped.yt",
    "https://pipedapi.in.projectsegfau.lt",
]

@app.get("/stream/{video_id}")
async def get_stream_url(video_id: str):
    """Get audio stream URL for playback using Piped API"""
    cache_key = f"stream:{video_id}"
    
    if cache_key in stream_cache:
        return stream_cache[cache_key]
    
    # Try each Piped instance until one works
    for piped_url in PIPED_INSTANCES:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.get(f"{piped_url}/streams/{video_id}")
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Get audio streams
                    audio_streams = data.get('audioStreams', [])
                    if not audio_streams:
                        continue
                    
                    # Sort by bitrate (quality) - highest first
                    audio_streams.sort(key=lambda x: x.get('bitrate', 0), reverse=True)
                    best_audio = audio_streams[0]
                    
                    result = {
                        "videoId": video_id,
                        "streamUrl": best_audio.get('url'),
                        "duration": data.get('duration', 0),
                        "title": data.get('title', ''),
                        "thumbnail": data.get('thumbnailUrl', ''),
                        "format": best_audio.get('format', 'webm'),
                        "bitrate": best_audio.get('bitrate', 128) // 1000,  # Convert to kbps
                        "quality": best_audio.get('quality', 'unknown')
                    }
                    
                    stream_cache[cache_key] = result
                    return result
                    
        except Exception as e:
            print(f"Piped instance {piped_url} failed: {e}")
            continue
    
    # Fallback: Try yt-dlp with more aggressive settings
    try:
        url = f'https://music.youtube.com/watch?v={video_id}'
        
        ydl_opts = {
            'format': 'bestaudio[ext=m4a]/bestaudio/best',
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False,
            'skip_download': True,
            'extractor_args': {
                'youtube': {
                    'player_client': ['android_music', 'android', 'ios'],
                    'player_skip': ['webpage', 'configs', 'js'],
                }
            },
        }
        
        def extract():
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                return ydl.extract_info(url, download=False)
        
        info = await run_sync(extract)
        
        if info:
            formats = info.get('formats', [])
            audio_formats = [f for f in formats if f.get('acodec') != 'none' and f.get('vcodec') == 'none']
            
            if audio_formats:
                audio_formats.sort(key=lambda x: x.get('abr', 0) or 0, reverse=True)
                best = audio_formats[0]
                
                result = {
                    "videoId": video_id,
                    "streamUrl": best.get('url'),
                    "duration": info.get('duration', 0),
                    "title": info.get('title', ''),
                    "thumbnail": info.get('thumbnail', ''),
                    "format": best.get('ext', 'webm'),
                    "bitrate": best.get('abr', 128)
                }
                
                stream_cache[cache_key] = result
                return result
                
    except Exception as e:
        print(f"yt-dlp fallback failed: {e}")
    
    raise HTTPException(500, "Unable to get stream URL. Please try again later.")


@app.get("/play/{video_id}")
async def redirect_to_stream(video_id: str):
    """Redirect to actual audio stream (use in <audio> src)"""
    stream = await get_stream_url(video_id)
    return RedirectResponse(url=stream['streamUrl'])


# ============ Song Details ============

@app.get("/song/{video_id}")
async def get_song(video_id: str):
    """Get song details"""
    cache_key = f"song:{video_id}"
    
    if cache_key in song_cache:
        return song_cache[cache_key]
    
    try:
        info = await run_sync(ytmusic.get_song, video_id)
        
        if not info:
            raise HTTPException(404, "Song not found")
        
        video = info.get('videoDetails', {})
        
        response = {
            "videoId": video_id,
            "title": video.get('title', ''),
            "artist": video.get('author', ''),
            "duration": int(video.get('lengthSeconds', 0)),
            "thumbnail": get_best_thumbnail(video.get('thumbnail', {}).get('thumbnails', [])),
            "viewCount": video.get('viewCount', 0)
        }
        
        song_cache[cache_key] = response
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


# ============ Related/Recommendations ============

@app.get("/related/{video_id}")
async def get_related(
    video_id: str,
    limit: int = Query(15, ge=1, le=30)
):
    """Get related songs (recommendations based on song)"""
    try:
        watch = await run_sync(ytmusic.get_watch_playlist, videoId=video_id, limit=limit + 5)
        
        songs = []
        if watch and 'tracks' in watch:
            for track in watch['tracks']:
                parsed = parse_song(track)
                if parsed and parsed['videoId'] != video_id:
                    songs.append(parsed)
        
        return {"videoId": video_id, "related": songs[:limit]}
        
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


@app.get("/lyrics/{video_id}")
async def get_lyrics(video_id: str):
    """Get song lyrics"""
    try:
        watch = await run_sync(ytmusic.get_watch_playlist, videoId=video_id)
        
        if watch and 'lyrics' in watch and watch['lyrics']:
            lyrics_data = await run_sync(ytmusic.get_lyrics, watch['lyrics'])
            if lyrics_data:
                return {"videoId": video_id, "lyrics": lyrics_data.get('lyrics', '')}
        
        raise HTTPException(404, "Lyrics not available")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


# ============ Artist & Album ============

@app.get("/artist/{browse_id}")
async def get_artist(browse_id: str):
    """Get artist details with songs"""
    cache_key = f"artist:{browse_id}"
    
    if cache_key in artist_cache:
        return artist_cache[cache_key]
    
    try:
        artist = await run_sync(ytmusic.get_artist, browse_id)
        
        if not artist:
            raise HTTPException(404, "Artist not found")
        
        songs = []
        if 'songs' in artist and 'results' in artist['songs']:
            for s in artist['songs']['results'][:15]:
                parsed = parse_song(s)
                if parsed:
                    songs.append(parsed)
        
        albums = []
        if 'albums' in artist and 'results' in artist['albums']:
            for a in artist['albums']['results'][:10]:
                albums.append({
                    "browseId": a.get('browseId', ''),
                    "title": a.get('title', ''),
                    "year": a.get('year'),
                    "thumbnail": get_best_thumbnail(a.get('thumbnails', []))
                })
        
        response = {
            "browseId": browse_id,
            "name": artist.get('name', ''),
            "description": artist.get('description', ''),
            "thumbnail": get_best_thumbnail(artist.get('thumbnails', [])),
            "subscribers": artist.get('subscribers', ''),
            "songs": songs,
            "albums": albums
        }
        
        artist_cache[cache_key] = response
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


@app.get("/album/{browse_id}")
async def get_album(browse_id: str):
    """Get album with tracks"""
    try:
        album = await run_sync(ytmusic.get_album, browse_id)
        
        if not album:
            raise HTTPException(404, "Album not found")
        
        tracks = []
        for t in album.get('tracks', []):
            parsed = parse_song(t)
            if parsed:
                tracks.append(parsed)
        
        return {
            "browseId": browse_id,
            "title": album.get('title', ''),
            "artist": ', '.join([a.get('name', '') for a in album.get('artists', [])]),
            "year": album.get('year'),
            "thumbnail": get_best_thumbnail(album.get('thumbnails', [])),
            "trackCount": album.get('trackCount', len(tracks)),
            "duration": album.get('duration', ''),
            "tracks": tracks
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


# ============ Trending & Browse ============

@app.get("/trending")
async def get_trending(limit: int = Query(20, ge=1, le=50)):
    """Get trending songs"""
    cache_key = f"trending:{limit}"
    
    if cache_key in search_cache:
        return search_cache[cache_key]
    
    try:
        charts = await run_sync(ytmusic.get_charts, "IN")  # India charts
        
        songs = []
        if 'songs' in charts and 'items' in charts['songs']:
            for s in charts['songs']['items'][:limit]:
                parsed = parse_song(s)
                if parsed:
                    songs.append(parsed)
        
        artists = []
        if 'artists' in charts and 'items' in charts['artists']:
            for a in charts['artists']['items'][:10]:
                artists.append({
                    "browseId": a.get('browseId', ''),
                    "name": a.get('name', ''),
                    "thumbnail": get_best_thumbnail(a.get('thumbnails', []))
                })
        
        response = {"songs": songs, "artists": artists}
        search_cache[cache_key] = response
        return response
        
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


@app.get("/genres")
async def get_genres():
    """Get music genres/moods"""
    return {
        "genres": [
            {"id": "pop", "name": "Pop", "color": "#1DB954", "query": "pop hits 2024"},
            {"id": "bollywood", "name": "Bollywood", "color": "#E91E63", "query": "bollywood hindi songs"},
            {"id": "punjabi", "name": "Punjabi", "color": "#FF5722", "query": "punjabi songs 2024"},
            {"id": "hip-hop", "name": "Hip Hop", "color": "#9C27B0", "query": "hip hop rap"},
            {"id": "rock", "name": "Rock", "color": "#F44336", "query": "rock songs"},
            {"id": "electronic", "name": "Electronic", "color": "#00BCD4", "query": "electronic EDM"},
            {"id": "romance", "name": "Romance", "color": "#E91E63", "query": "romantic love songs hindi"},
            {"id": "chill", "name": "Chill", "color": "#4CAF50", "query": "chill lofi relax"},
            {"id": "party", "name": "Party", "color": "#FF9800", "query": "party dance songs"},
            {"id": "workout", "name": "Workout", "color": "#795548", "query": "workout gym music"},
            {"id": "retro", "name": "Retro", "color": "#607D8B", "query": "90s hindi songs"},
            {"id": "devotional", "name": "Devotional", "color": "#FF5722", "query": "bhajan devotional songs"},
        ]
    }


@app.get("/genre/{genre_id}")
async def get_genre_songs(
    genre_id: str,
    limit: int = Query(30, ge=1, le=50)
):
    """Get songs for a genre"""
    genres = {
        "pop": "pop hits 2024",
        "bollywood": "bollywood hindi songs 2024",
        "punjabi": "punjabi songs 2024",
        "hip-hop": "hip hop rap",
        "rock": "rock songs",
        "electronic": "electronic EDM",
        "romance": "romantic love songs hindi",
        "chill": "chill lofi relax",
        "party": "party dance songs",
        "workout": "workout gym music",
        "retro": "90s hindi songs",
        "devotional": "bhajan devotional songs"
    }
    
    query = genres.get(genre_id, f"{genre_id} songs")
    
    try:
        results = await run_sync(ytmusic.search, query, filter="songs", limit=limit)
        songs = [parse_song(s) for s in results if parse_song(s)]
        return {"genre": genre_id, "songs": songs}
    except Exception as e:
        raise HTTPException(500, f"Failed: {str(e)}")


# ============ Run Server ============
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)
