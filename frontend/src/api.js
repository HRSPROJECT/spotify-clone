// API Helper Functions
import { API_URL } from './config'

// Generic fetch wrapper
async function fetchAPI(endpoint, options = {}) {
    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        })

        if (!res.ok) {
            throw new Error(`API Error: ${res.status}`)
        }

        return await res.json()
    } catch (err) {
        console.error(`API Error (${endpoint}):`, err)
        throw err
    }
}

// ============ Search ============
export async function searchSongs(query, limit = 20) {
    return fetchAPI(`/search?q=${encodeURIComponent(query)}&limit=${limit}`)
}

export async function searchAll(query, limit = 10) {
    return fetchAPI(`/search/all?q=${encodeURIComponent(query)}&limit=${limit}`)
}

// ============ Streaming ============
export async function getStreamUrl(videoId) {
    return fetchAPI(`/stream/${videoId}`)
}

// ============ Song Details ============
export async function getSong(videoId) {
    return fetchAPI(`/song/${videoId}`)
}

export async function getRelated(videoId, limit = 15) {
    return fetchAPI(`/related/${videoId}?limit=${limit}`)
}

export async function getLyrics(videoId) {
    return fetchAPI(`/lyrics/${videoId}`)
}

// ============ Browse ============
export async function getArtist(browseId) {
    return fetchAPI(`/artist/${browseId}`)
}

export async function getAlbum(browseId) {
    return fetchAPI(`/album/${browseId}`)
}

export async function getTrending(limit = 20) {
    return fetchAPI(`/trending?limit=${limit}`)
}

export async function getGenres() {
    return fetchAPI('/genres')
}

export async function getGenreSongs(genreId, limit = 30) {
    return fetchAPI(`/genre/${genreId}?limit=${limit}`)
}
