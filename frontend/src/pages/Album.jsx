// Album Page
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { SongRow, SongRowSkeleton, Section } from '../components/Cards'
import { getAlbum } from '../api'
import { usePlayerStore } from '../store'
import { FaPlay, FaRandom, FaClock } from 'react-icons/fa'

export default function Album() {
    const { browseId } = useParams()
    const navigate = useNavigate()
    const { playSong } = usePlayerStore()

    const [album, setAlbum] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const data = await getAlbum(browseId)
                setAlbum(data)
            } catch (err) {
                console.error('Failed to fetch album:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [browseId])

    const handlePlayAll = () => {
        if (album?.tracks?.length) {
            playSong(album.tracks[0], album.tracks)
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="page-content">
                    <div className="skeleton" style={{ height: '300px', marginBottom: '24px' }} />
                    {Array(8).fill(0).map((_, i) => <SongRowSkeleton key={i} />)}
                </div>
            </>
        )
    }

    if (!album) {
        return (
            <>
                <Header />
                <div className="page-content" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Album not found</h2>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />

            {/* Album Header */}
            <div
                style={{
                    background: `linear-gradient(180deg, #5a3d7a 0%, var(--bg-primary) 100%)`,
                    padding: '80px 32px 32px',
                    marginTop: '-64px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '24px'
                }}
            >
                <img
                    src={album.thumbnail || '/default-album.png'}
                    alt={album.title}
                    style={{
                        width: '232px',
                        height: '232px',
                        borderRadius: '8px',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                />
                <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Album</p>
                    <h1 style={{ fontSize: '3rem', fontWeight: 900, marginBottom: '16px' }}>
                        {album.title}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                            style={{ cursor: 'pointer', fontWeight: 500 }}
                            onClick={() => album.artistId && navigate(`/artist/${album.artistId}`)}
                        >
                            {album.artist}
                        </span>
                        {album.year && (
                            <>
                                <span>•</span>
                                <span>{album.year}</span>
                            </>
                        )}
                        {album.trackCount && (
                            <>
                                <span>•</span>
                                <span>{album.trackCount} songs</span>
                            </>
                        )}
                        {album.duration && (
                            <>
                                <span>•</span>
                                <span>{album.duration}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="page-content fade-in">
                {/* Play Button */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <button className="btn-play" onClick={handlePlayAll}>
                        <FaPlay style={{ marginLeft: '2px' }} />
                    </button>
                </div>

                {/* Track Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1fr auto',
                    gap: '16px',
                    padding: '8px 16px',
                    borderBottom: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: '8px'
                }}>
                    <span>#</span>
                    <span>Title</span>
                    <FaClock size={12} />
                </div>

                {/* Tracks */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {album.tracks?.map((song, i) => (
                        <SongRow
                            key={song.videoId}
                            song={song}
                            index={i}
                            queue={album.tracks}
                        />
                    ))}
                </div>
            </div>
        </>
    )
}
