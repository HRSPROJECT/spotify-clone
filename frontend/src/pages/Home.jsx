// Home Page
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import { SongCard, GenreCard, Section, SongCardSkeleton } from '../components/Cards'
import { getTrending, getGenres } from '../api'
import { useLibraryStore, useAuthStore } from '../store'

export default function Home() {
    const navigate = useNavigate()
    const user = useAuthStore(s => s.user)
    const { recentlyPlayed } = useLibraryStore()

    const [trending, setTrending] = useState([])
    const [genres, setGenres] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [trendingData, genresData] = await Promise.all([
                    getTrending(20),
                    getGenres()
                ])
                setTrending(trendingData.songs || [])
                setGenres(genresData.genres || [])
            } catch (err) {
                console.error('Failed to fetch home data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Get greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours()
        if (hour < 12) return 'Good morning'
        if (hour < 18) return 'Good afternoon'
        return 'Good evening'
    }

    return (
        <>
            <Header />

            <div className="page-content fade-in">
                <h1 style={{ marginBottom: '24px' }}>{getGreeting()}</h1>

                {/* Recently Played (for logged in users) */}
                {user && recentlyPlayed.length > 0 && (
                    <Section title="Recently Played">
                        <div className="grid-cards">
                            {recentlyPlayed.slice(0, 6).map(song => (
                                <SongCard
                                    key={song.video_id}
                                    song={{
                                        videoId: song.video_id,
                                        title: song.title,
                                        artist: song.artist_name,
                                        thumbnail: song.thumbnail_url
                                    }}
                                />
                            ))}
                        </div>
                    </Section>
                )}

                {/* Genres */}
                <Section title="Browse Genres">
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                        gap: '16px'
                    }}>
                        {genres.slice(0, 8).map(genre => (
                            <GenreCard
                                key={genre.id}
                                genre={genre}
                                onClick={() => navigate(`/genre/${genre.id}`)}
                            />
                        ))}
                    </div>
                </Section>

                {/* Trending */}
                <Section title="Trending Now" onSeeAll={() => navigate('/trending')}>
                    <div className="grid-cards">
                        {loading
                            ? Array(6).fill(0).map((_, i) => <SongCardSkeleton key={i} />)
                            : trending.slice(0, 6).map(song => (
                                <SongCard
                                    key={song.videoId}
                                    song={song}
                                    queue={trending}
                                />
                            ))
                        }
                    </div>
                </Section>

                {/* Made For You - More Songs */}
                <Section title="Made For You">
                    <div className="grid-cards">
                        {trending.slice(6, 12).map(song => (
                            <SongCard
                                key={song.videoId}
                                song={song}
                                queue={trending}
                            />
                        ))}
                    </div>
                </Section>
            </div>
        </>
    )
}
