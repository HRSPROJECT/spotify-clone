// Sidebar Navigation Component
import { NavLink, useNavigate } from 'react-router-dom'
import { useLibraryStore, useAuthStore } from '../store'
import {
    FaHome, FaSearch, FaBook, FaHeart, FaPlus, FaMusic
} from 'react-icons/fa'
import { useEffect } from 'react'

export default function Sidebar() {
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const { playlists, fetchLibrary, createPlaylist } = useLibraryStore()

    useEffect(() => {
        if (user) {
            fetchLibrary()
        }
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

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div className="sidebar-logo">
                <FaMusic size={32} color="var(--accent-primary)" />
                <h1>Spotify</h1>
            </div>

            {/* Main Navigation */}
            <nav className="sidebar-nav">
                <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaHome />
                    <span>Home</span>
                </NavLink>
                <NavLink to="/search" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaSearch />
                    <span>Search</span>
                </NavLink>
                <NavLink to="/library" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                    <FaBook />
                    <span>Your Library</span>
                </NavLink>
            </nav>

            {/* User Library */}
            <div className="sidebar-section">
                {user ? (
                    <>
                        <button className="nav-item" onClick={handleCreatePlaylist} style={{ width: '100%' }}>
                            <FaPlus />
                            <span>Create Playlist</span>
                        </button>
                        <NavLink
                            to="/liked"
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <FaHeart style={{ color: 'var(--accent-primary)' }} />
                            <span>Liked Songs</span>
                        </NavLink>

                        <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '16px', paddingTop: '16px' }}>
                            {playlists.map(playlist => (
                                <NavLink
                                    key={playlist.id}
                                    to={`/playlist/${playlist.id}`}
                                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                    style={{ padding: '8px 16px' }}
                                >
                                    <span style={{ fontSize: '0.875rem' }}>{playlist.name}</span>
                                </NavLink>
                            ))}
                        </div>
                    </>
                ) : (
                    <div style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.875rem' }}>
                            Sign in to create playlists and save songs
                        </p>
                        <NavLink to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                            Sign In
                        </NavLink>
                    </div>
                )}
            </div>
        </aside>
    )
}
