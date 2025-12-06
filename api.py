# Install required packages
!pip install ytmusicapi yt-dlp -q

from ytmusicapi import YTMusic
import yt_dlp
from IPython.display import Audio, display, clear_output

# Initialize YouTube Music API
ytmusic = YTMusic()

def play_song_interactive():
    """Interactive song search and play"""
    
    # Step 1: Get song name from user
    song_query = input("🎵 Enter song name: ").strip()
    
    if not song_query:
        print("❌ Please enter a song name")
        return
    
    print(f"\n🔍 Searching for '{song_query}'...\n")
    
    # Step 2: Search and show results
    results = ytmusic.search(song_query, filter="songs", limit=10)
    
    if not results:
        print("❌ No results found. Try a different search term.")
        return
    
    # Display numbered results
    print("=" * 60)
    print("SEARCH RESULTS:")
    print("=" * 60)
    for i, song in enumerate(results, 1):
        artists = ", ".join([a['name'] for a in song.get('artists', [])])
        duration = song.get('duration', 'N/A')
        album = song.get('album', {}).get('name', '') if song.get('album') else ''
        
        print(f"\n{i}. {song['title']}")
        print(f"   Artist: {artists}")
        print(f"   Duration: {duration}")
        if album:
            print(f"   Album: {album}")
    
    print("=" * 60)
    
    # Step 3: Get user choice
    try:
        choice = int(input(f"\n▶️ Enter number (1-{len(results)}) to play: ").strip())
        
        if choice < 1 or choice > len(results):
            print(f"❌ Please enter a number between 1 and {len(results)}")
            return
        
        # Get selected song
        selected_song = results[choice - 1]
        video_id = selected_song['videoId']
        
        print(f"\n🎶 Now playing: {selected_song['title']}")
        print(f"   By: {selected_song['artists'][0]['name']}")
        print(f"\n⏳ Downloading audio...\n")
        
        # Download audio using yt-dlp
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': 'audio.%(ext)s',
            'quiet': True,
            'no_warnings': True,
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
        }
        
        url = f'https://www.youtube.com/watch?v={video_id}'
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        
        # Play the audio
        print("✅ Download complete! Playing now...\n")
        display(Audio('audio.mp3', autoplay=True))
        
    except ValueError:
        print("❌ Invalid input. Please enter a number.")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

# Run the interactive player
play_song_interactive()
