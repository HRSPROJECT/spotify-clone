// Genre Page
import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Header'
import { SongRow, SongRowSkeleton, Section } from '../components/Cards'
import { getGenreSongs, getGenres } from '../api'

export default function Genre() {
    const { genreId } = useParams()
    const [songs, setSongs] = useState([])
    const [genreName, setGenreName] = useState('')
    const [genreColor, setGenreColor] = useState('#1DB954')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            setLoading(true)
            try {
                // Get genre info
                const genresData = await getGenres()
                const genre = genresData.genres.find(g => g.id === genreId)
                if (genre) {
                    setGenreName(genre.name)
                    setGenreColor(genre.color)
                }

                // Get songs
                const data = await getGenreSongs(genreId, 50)
                setSongs(data.songs || [])
            } catch (err) {
                console.error('Failed to fetch genre songs:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [genreId])

    return (
        <>
            <Header />

            {/* Genre Header */}
            <div
                style={{
                    background: `linear-gradient(180deg, ${genreColor} 0%, var(--bg-primary) 100%)`,
                    padding: '80px 32px 32px',
                    marginTop: '-64px'
                }}
            >
                <h1 style={{ fontSize: '4rem', fontWeight: 900 }}>{genreName}</h1>
            </div>

            <div className="page-content fade-in">
                <Section title="Popular Songs">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {loading
                            ? Array(10).fill(0).map((_, i) => <SongRowSkeleton key={i} />)
                            : songs.map((song, i) => (
                                <SongRow
                                    key={song.videoId}
                                    song={song}
                                    index={i}
                                    queue={songs}
                                />
                            ))
                        }
                    </div>
                </Section>
            </div>
        </>
    )
}
