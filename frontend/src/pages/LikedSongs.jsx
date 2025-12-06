// Liked Songs Page
import { useEffect } from 'react'
import Header from '../components/Header'
import { SongRow, SongRowSkeleton, Section } from '../components/Cards'
import { useLibraryStore, usePlayerStore, useAuthStore } from '../store'
import { useNavigate } from 'react-router-dom'
import { FaPlay, FaHeart } from 'react-icons/fa'

export default function LikedSongs() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const { likedSongs, loading, fetchLibrary } = useLibraryStore()
    const { playSong } = usePlayerStore()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchLibrary()
    }, [user])

    // Convert liked songs to playable format
    const songs = likedSongs.map(s => ({
        videoId: s.video_id,
        title: s.title,
        artist: s.artist_name,
        thumbnail: s.thumbnail_url,
        duration: s.duration_text
    }))

    const handlePlayAll = () => {
        if (songs.length) {
            playSong(songs[0], songs)
        }
    }

    return (
        <>
            <Header />

            {/* Header */}
            <div
                style={{
                    background: 'linear-gradient(180deg, #5038a0 0%, var(--bg-primary) 100%)',
                    padding: '80px 32px 32px',
                    marginTop: '-64px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '24px'
                }}
            >
                <div
                    style={{
                        width: '232px',
                        height: '232px',
                        background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                >
                    <FaHeart size={80} color="white" />
                </div>
                <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Playlist</p>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '16px' }}>
                        Liked Songs
                    </h1>
                    <p>{likedSongs.length} songs</p>
                </div>
            </div>

            <div className="page-content fade-in">
                {songs.length > 0 && (
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                        <button className="btn-play" onClick={handlePlayAll}>
                            <FaPlay style={{ marginLeft: '2px' }} />
                        </button>
                    </div>
                )}

                {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {Array(5).fill(0).map((_, i) => <SongRowSkeleton key={i} />)}
                    </div>
                ) : songs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {songs.map((song, i) => (
                            <SongRow
                                key={song.videoId}
                                song={song}
                                index={i}
                                queue={songs}
                            />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <FaHeart size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                        <h2>Songs you like will appear here</h2>
                        <p>Save songs by tapping the heart icon</p>
                    </div>
                )}
            </div>
        </>
    )
}
