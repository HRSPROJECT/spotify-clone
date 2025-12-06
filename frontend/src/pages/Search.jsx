// Search Page
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { SongRow, SongCardSkeleton, GenreCard, ArtistCard, Section } from '../components/Cards'
import { searchAll, getGenres } from '../api'

export default function Search() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const query = searchParams.get('q') || ''

    const [results, setResults] = useState(null)
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(false)

    // Load genres for browse
    useEffect(() => {
        getGenres().then(data => setGenres(data.genres || []))
    }, [])

    // Search when query changes
    useEffect(() => {
        if (query) {
            setLoading(true)
            searchAll(query, 15)
                .then(data => setResults(data))
                .catch(console.error)
                .finally(() => setLoading(false))
        } else {
            setResults(null)
        }
    }, [query])

    return (
        <>
            <Header showSearch />

            <div className="page-content fade-in">
                {query ? (
                    // Search Results
                    <>
                        {loading ? (
                            <Section title="Searching...">
                                <div className="grid-cards">
                                    {Array(6).fill(0).map((_, i) => <SongCardSkeleton key={i} />)}
                                </div>
                            </Section>
                        ) : results ? (
                            <>
                                {/* Top Result & Songs */}
                                {results.songs?.length > 0 && (
                                    <Section title={`Results for "${query}"`}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                            {results.songs.map((song, i) => (
                                                <SongRow
                                                    key={song.videoId}
                                                    song={song}
                                                    index={i}
                                                    queue={results.songs}
                                                />
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Artists */}
                                {results.artists?.length > 0 && (
                                    <Section title="Artists">
                                        <div className="grid-cards">
                                            {results.artists.slice(0, 5).map(artist => (
                                                <ArtistCard
                                                    key={artist.browseId}
                                                    artist={artist}
                                                    onClick={() => navigate(`/artist/${artist.browseId}`)}
                                                />
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {/* Albums */}
                                {results.albums?.length > 0 && (
                                    <Section title="Albums">
                                        <div className="grid-cards">
                                            {results.albums.slice(0, 5).map(album => (
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
                                                    <p className="card-subtitle">{album.artist}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </Section>
                                )}

                                {!results.songs?.length && !results.artists?.length && !results.albums?.length && (
                                    <div style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                                        <h2>No results found for "{query}"</h2>
                                        <p>Try different keywords or check the spelling</p>
                                    </div>
                                )}
                            </>
                        ) : null}
                    </>
                ) : (
                    // Browse Genres
                    <>
                        <h1 style={{ marginBottom: '24px' }}>Browse All</h1>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                            gap: '16px'
                        }}>
                            {genres.map(genre => (
                                <GenreCard
                                    key={genre.id}
                                    genre={genre}
                                    onClick={() => navigate(`/genre/${genre.id}`)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}
