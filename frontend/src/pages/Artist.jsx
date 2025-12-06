// Artist Page
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { SongRow, SongRowSkeleton, Section } from '../components/Cards'
import { getArtist } from '../api'
import { usePlayerStore } from '../store'
import { FaPlay, FaRandom } from 'react-icons/fa'

export default function Artist() {
    const { browseId } = useParams()
    const navigate = useNavigate()
    const { playSong } = usePlayerStore()

    const [artist, setArtist] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                const data = await getArtist(browseId)
                setArtist(data)
            } catch (err) {
                console.error('Failed to fetch artist:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [browseId])

    const handlePlayAll = () => {
        if (artist?.songs?.length) {
            playSong(artist.songs[0], artist.songs)
        }
    }

    const handleShuffle = () => {
        if (artist?.songs?.length) {
            const shuffled = [...artist.songs].sort(() => Math.random() - 0.5)
            playSong(shuffled[0], shuffled)
        }
    }

    if (loading) {
        return (
            <>
                <Header />
                <div className="page-content">
                    <div className="skeleton" style={{ height: '300px', marginBottom: '24px' }} />
                    {Array(5).fill(0).map((_, i) => <SongRowSkeleton key={i} />)}
                </div>
            </>
        )
    }

    if (!artist) {
        return (
            <>
                <Header />
                <div className="page-content" style={{ textAlign: 'center', padding: '48px' }}>
                    <h2>Artist not found</h2>
                </div>
            </>
        )
    }

    return (
        <>
            <Header />

            {/* Artist Header */}
            <div
                style={{
                    background: `linear-gradient(180deg, #333 0%, var(--bg-primary) 100%)`,
                    padding: '80px 32px 32px',
                    marginTop: '-64px',
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '24px'
                }}
            >
                <img
                    src={artist.thumbnail || '/default-artist.png'}
                    alt={artist.name}
                    style={{
                        width: '232px',
                        height: '232px',
                        borderRadius: '50%',
                        boxShadow: 'var(--shadow-lg)'
                    }}
                />
                <div>
                    <p style={{ fontSize: '0.875rem', fontWeight: 500 }}>Artist</p>
                    <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '16px' }}>
                        {artist.name}
                    </h1>
                    {artist.subscribers && (
                        <p style={{ color: 'var(--text-muted)' }}>{artist.subscribers} subscribers</p>
                    )}
                </div>
            </div>

            <div className="page-content fade-in">
                {/* Play Buttons */}
                <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
                    <button className="btn-play" onClick={handlePlayAll}>
                        <FaPlay style={{ marginLeft: '2px' }} />
                    </button>
                    <button
                        className="btn btn-secondary"
                        onClick={handleShuffle}
                        style={{ borderRadius: '999px' }}
                    >
                        <FaRandom /> Shuffle
                    </button>
                </div>

                {/* Popular Songs */}
                {artist.songs?.length > 0 && (
                    <Section title="Popular">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {artist.songs.map((song, i) => (
                                <SongRow
                                    key={song.videoId}
                                    song={song}
                                    index={i}
                                    queue={artist.songs}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Albums */}
                {artist.albums?.length > 0 && (
                    <Section title="Albums">
                        <div className="grid-cards">
                            {artist.albums.map(album => (
                                <div
                                    key={album.browseId}
                                    className="card"
                                    onClick={() => navigate(`/album/${album.browseId}`)}
                                >
                                    <img
                                        src={album.thumbnail || '/default-album.png'}
                                        alt={album.title}
                                        className="card-image"
                                    />
                                    <p className="card-title">{album.title}</p>
                                    <p className="card-subtitle">{album.year}</p>
                                </div>
                            ))}
                        </div>
                    </Section>
                )}

                {/* Description */}
                {artist.description && (
                    <Section title="About">
                        <p style={{ color: 'var(--text-secondary)', maxWidth: '800px', lineHeight: 1.6 }}>
                            {artist.description}
                        </p>
                    </Section>
                )}
            </div>
        </>
    )
}
