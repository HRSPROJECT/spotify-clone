// Library Page
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { PlaylistCard, Section } from '../components/Cards'
import { useLibraryStore, useAuthStore } from '../store'
import { FaHeart, FaPlus } from 'react-icons/fa'

export default function Library() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const { playlists, likedSongs, fetchLibrary, createPlaylist, loading } = useLibraryStore()

    useEffect(() => {
        if (!user) {
            navigate('/login')
            return
        }
        fetchLibrary()
    }, [user])

    const handleCreatePlaylist = async () => {
        const name = prompt('Enter playlist name:')
        if (name) {
            const { data } = await createPlaylist(name)
            if (data) {
                navigate(`/playlist/${data.id}`)
            }
        }
    }

    if (!user) return null

    return (
        <>
            <Header />

            <div className="page-content fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h1>Your Library</h1>
                    <button className="btn btn-secondary" onClick={handleCreatePlaylist}>
                        <FaPlus /> Create Playlist
                    </button>
                </div>

                <div className="grid-cards">
                    {/* Liked Songs Card */}
                    <div
                        className="card"
                        onClick={() => navigate('/liked')}
                        style={{
                            background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                            minHeight: '200px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end'
                        }}
                    >
                        <p className="card-title" style={{ fontSize: '1.25rem' }}>Liked Songs</p>
                        <p className="card-subtitle">{likedSongs.length} songs</p>
                    </div>

                    {/* User Playlists */}
                    {playlists.map(playlist => (
                        <PlaylistCard
                            key={playlist.id}
                            playlist={playlist}
                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                        />
                    ))}
                </div>

                {playlists.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                        <h2>Create your first playlist</h2>
                        <p style={{ marginBottom: '24px' }}>It's easy, we'll help you</p>
                        <button className="btn btn-primary" onClick={handleCreatePlaylist}>
                            Create Playlist
                        </button>
                    </div>
                )}
            </div>
        </>
    )
}
