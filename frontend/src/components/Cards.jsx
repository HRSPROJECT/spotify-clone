// Reusable UI Components
import { usePlayerStore, useLibraryStore, useAuthStore } from '../store'
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaEllipsisH } from 'react-icons/fa'

// ============ Song Card ============
export function SongCard({ song, queue = [], showArtist = true }) {
    const { playSong, currentSong, isPlaying } = usePlayerStore()
    const isCurrentSong = currentSong?.videoId === song.videoId

    const handlePlay = () => {
        if (isCurrentSong) {
            usePlayerStore.getState().togglePlay()
        } else {
            playSong(song, queue)
        }
    }

    return (
        <div className="card" onClick={handlePlay}>
            <div style={{ position: 'relative' }}>
                <img
                    src={song.thumbnail || '/default-song.png'}
                    alt={song.title}
                    className="card-image"
                />
                <button
                    className="btn-play"
                    style={{
                        position: 'absolute',
                        bottom: '8px',
                        right: '8px',
                        opacity: isCurrentSong ? 1 : 0,
                        transform: isCurrentSong ? 'translateY(0)' : 'translateY(8px)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {isCurrentSong && isPlaying ? <FaPause /> : <FaPlay style={{ marginLeft: '2px' }} />}
                </button>
            </div>
            <p className="card-title" style={{ color: isCurrentSong ? 'var(--accent-primary)' : 'inherit' }}>
                {song.title}
            </p>
            {showArtist && <p className="card-subtitle">{song.artist}</p>}
            <style>{`
        .card:hover .btn-play {
          opacity: 1 !important;
          transform: translateY(0) !important;
        }
      `}</style>
        </div>
    )
}

// ============ Song Row ============
export function SongRow({ song, index, queue = [] }) {
    const { playSong, currentSong, isPlaying, togglePlay } = usePlayerStore()
    const { toggleLike, isLiked } = useLibraryStore()
    const user = useAuthStore(s => s.user)

    const isCurrentSong = currentSong?.videoId === song.videoId
    const liked = isLiked(song.videoId)

    const handlePlay = () => {
        if (isCurrentSong) {
            togglePlay()
        } else {
            playSong(song, queue)
        }
    }

    const handleLike = (e) => {
        e.stopPropagation()
        if (user) {
            toggleLike(song)
        }
    }

    return (
        <div
            className="song-row"
            onClick={handlePlay}
            style={{
                background: isCurrentSong ? 'var(--bg-tertiary)' : 'transparent'
            }}
        >
            <div style={{ position: 'relative', width: '40px', textAlign: 'center' }}>
                <span className="song-row-number" style={{ display: isCurrentSong ? 'none' : 'block' }}>
                    {index + 1}
                </span>
                <span className="song-row-play" style={{ display: isCurrentSong ? 'block' : 'none' }}>
                    {isPlaying ? <FaPause size={12} /> : <FaPlay size={12} />}
                </span>
            </div>

            <div className="song-info">
                <img
                    src={song.thumbnail || '/default-song.png'}
                    alt={song.title}
                    className="song-thumbnail"
                />
                <div className="song-details">
                    <p className="song-title" style={{ color: isCurrentSong ? 'var(--accent-primary)' : 'inherit' }}>
                        {song.title}
                    </p>
                    <p className="song-artist">{song.artist}</p>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {user && (
                    <button onClick={handleLike} style={{ color: liked ? 'var(--accent-primary)' : 'var(--text-muted)' }}>
                        {liked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
                <span className="song-duration">{song.duration}</span>
            </div>
        </div>
    )
}

// ============ Artist Card ============
export function ArtistCard({ artist, onClick }) {
    return (
        <div className="card" onClick={onClick} style={{ textAlign: 'center' }}>
            <img
                src={artist.thumbnail || '/default-artist.png'}
                alt={artist.name}
                className="card-image"
                style={{ borderRadius: '50%' }}
            />
            <p className="card-title">{artist.name}</p>
            <p className="card-subtitle">Artist</p>
        </div>
    )
}

// ============ Genre Card ============
export function GenreCard({ genre, onClick }) {
    return (
        <div
            className="genre-card"
            onClick={() => onClick(genre)}
            style={{ background: genre.color }}
        >
            <span className="genre-card-title">{genre.name}</span>
        </div>
    )
}

// ============ Playlist Card ============
export function PlaylistCard({ playlist, onClick }) {
    return (
        <div className="card" onClick={onClick}>
            <div
                className="card-image"
                style={{
                    background: 'linear-gradient(135deg, #450af5, #c4efd9)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem'
                }}
            >
                🎵
            </div>
            <p className="card-title">{playlist.name}</p>
            <p className="card-subtitle">{playlist.playlist_songs?.[0]?.count || 0} songs</p>
        </div>
    )
}

// ============ Skeleton Loaders ============
export function SongCardSkeleton() {
    return (
        <div className="card">
            <div className="skeleton card-image" />
            <div className="skeleton" style={{ height: '16px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ height: '12px', width: '60%' }} />
        </div>
    )
}

export function SongRowSkeleton() {
    return (
        <div className="song-row">
            <div className="skeleton" style={{ width: '20px', height: '16px' }} />
            <div className="song-info">
                <div className="skeleton" style={{ width: '48px', height: '48px', borderRadius: '4px' }} />
                <div style={{ flex: 1 }}>
                    <div className="skeleton" style={{ height: '16px', marginBottom: '8px', width: '60%' }} />
                    <div className="skeleton" style={{ height: '12px', width: '40%' }} />
                </div>
            </div>
            <div className="skeleton" style={{ width: '40px', height: '16px' }} />
        </div>
    )
}

// ============ Section Component ============
export function Section({ title, children, onSeeAll }) {
    return (
        <section className="section">
            <div className="section-header">
                <h2 className="section-title">{title}</h2>
                {onSeeAll && (
                    <button
                        className="btn btn-secondary"
                        onClick={onSeeAll}
                        style={{ fontSize: '0.75rem', padding: '8px 16px' }}
                    >
                        See all
                    </button>
                )}
            </div>
            {children}
        </section>
    )
}
