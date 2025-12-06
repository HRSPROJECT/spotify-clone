// Header Component with Search
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { FaSearch, FaChevronLeft, FaChevronRight, FaUser } from 'react-icons/fa'

export default function Header({ showSearch = false }) {
    const navigate = useNavigate()
    const { user, signOut } = useAuthStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [showMenu, setShowMenu] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    return (
        <header className="main-header">
            {/* Navigation Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    className="btn-icon"
                    onClick={() => navigate(-1)}
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                    <FaChevronLeft />
                </button>
                <button
                    className="btn-icon"
                    onClick={() => navigate(1)}
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                >
                    <FaChevronRight />
                </button>

                {/* Search Box */}
                {showSearch && (
                    <form onSubmit={handleSearch} className="search-container" style={{ marginLeft: '16px' }}>
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="What do you want to listen to?"
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                )}
            </div>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
                {user ? (
                    <>
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                background: 'var(--bg-tertiary)',
                                padding: '4px 12px 4px 4px',
                                borderRadius: '999px',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <div style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                background: 'var(--accent-primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaUser size={12} />
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                {user.user_metadata?.display_name || user.email?.split('@')[0]}
                            </span>
                        </button>

                        {showMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '8px',
                                background: 'var(--bg-elevated)',
                                borderRadius: '4px',
                                padding: '4px',
                                minWidth: '150px',
                                boxShadow: 'var(--shadow-lg)',
                                zIndex: 1000
                            }}>
                                <Link
                                    to="/profile"
                                    style={{
                                        display: 'block',
                                        padding: '12px',
                                        fontSize: '0.875rem',
                                        borderRadius: '2px'
                                    }}
                                    onClick={() => setShowMenu(false)}
                                >
                                    Profile
                                </Link>
                                <button
                                    onClick={() => { signOut(); setShowMenu(false); }}
                                    style={{
                                        display: 'block',
                                        width: '100%',
                                        textAlign: 'left',
                                        padding: '12px',
                                        fontSize: '0.875rem',
                                        borderRadius: '2px',
                                        color: 'var(--text-primary)'
                                    }}
                                >
                                    Log out
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Link to="/signup" className="btn btn-secondary">
                            Sign up
                        </Link>
                        <Link to="/login" className="btn btn-primary">
                            Log in
                        </Link>
                    </div>
                )}
            </div>
        </header>
    )
}
