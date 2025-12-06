// Global State Management using Zustand
import { create } from 'zustand'
import { supabase, API_URL } from './config'

// ============ Auth Store ============
export const useAuthStore = create((set, get) => ({
    user: null,
    loading: true,

    // Initialize auth state
    init: async () => {
        const { data: { session } } = await supabase.auth.getSession()
        set({ user: session?.user || null, loading: false })

        // Listen for auth changes
        supabase.auth.onAuthStateChange((_event, session) => {
            set({ user: session?.user || null })
        })
    },

    // Sign up
    signUp: async (email, password, name) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { display_name: name } }
        })
        if (error) throw error
        return data
    },

    // Sign in
    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    },

    // Sign out
    signOut: async () => {
        await supabase.auth.signOut()
        set({ user: null })
    }
}))


// ============ Player Store ============
export const usePlayerStore = create((set, get) => ({
    currentSong: null,
    queue: [],
    isPlaying: false,
    volume: 0.8,
    progress: 0,
    duration: 0,
    audioRef: null,

    // Set audio reference
    setAudioRef: (ref) => set({ audioRef: ref }),

    // Play a song
    playSong: async (song, queue = []) => {
        const state = get()

        // Get stream URL from API
        try {
            const res = await fetch(`${API_URL}/stream/${song.videoId}`)
            const data = await res.json()

            if (data.streamUrl) {
                set({
                    currentSong: { ...song, streamUrl: data.streamUrl },
                    queue: queue.length > 0 ? queue : state.queue,
                    isPlaying: true
                })

                // Record play in Supabase
                const user = useAuthStore.getState().user
                if (user) {
                    await supabase.from('listening_history').insert({
                        user_id: user.id,
                        video_id: song.videoId,
                        title: song.title,
                        artist_name: song.artist,
                        thumbnail_url: song.thumbnail
                    })
                }
            }
        } catch (err) {
            console.error('Failed to get stream:', err)
        }
    },

    // Toggle play/pause
    togglePlay: () => {
        const state = get()
        if (state.audioRef) {
            if (state.isPlaying) {
                state.audioRef.pause()
            } else {
                state.audioRef.play()
            }
            set({ isPlaying: !state.isPlaying })
        }
    },

    // Play next
    playNext: () => {
        const state = get()
        const currentIndex = state.queue.findIndex(
            s => s.videoId === state.currentSong?.videoId
        )
        if (currentIndex < state.queue.length - 1) {
            state.playSong(state.queue[currentIndex + 1])
        }
    },

    // Play previous
    playPrev: () => {
        const state = get()
        const currentIndex = state.queue.findIndex(
            s => s.videoId === state.currentSong?.videoId
        )
        if (currentIndex > 0) {
            state.playSong(state.queue[currentIndex - 1])
        }
    },

    // Set volume
    setVolume: (volume) => {
        const state = get()
        if (state.audioRef) {
            state.audioRef.volume = volume
        }
        set({ volume })
    },

    // Update progress
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),

    // Seek
    seek: (time) => {
        const state = get()
        if (state.audioRef) {
            state.audioRef.currentTime = time
            set({ progress: time })
        }
    }
}))


// ============ Library Store (Supabase) ============
export const useLibraryStore = create((set, get) => ({
    likedSongs: [],
    playlists: [],
    recentlyPlayed: [],
    loading: false,

    // Fetch user library
    fetchLibrary: async () => {
        const user = useAuthStore.getState().user
        if (!user) return

        set({ loading: true })

        try {
            // Fetch liked songs
            const { data: liked } = await supabase
                .from('liked_songs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Fetch playlists
            const { data: playlists } = await supabase
                .from('playlists')
                .select('*, playlist_songs(count)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            // Fetch recently played
            const { data: history } = await supabase
                .from('listening_history')
                .select('*')
                .eq('user_id', user.id)
                .order('played_at', { ascending: false })
                .limit(20)

            set({
                likedSongs: liked || [],
                playlists: playlists || [],
                recentlyPlayed: history || [],
                loading: false
            })
        } catch (err) {
            console.error('Error fetching library:', err)
            set({ loading: false })
        }
    },

    // Like/unlike song
    toggleLike: async (song) => {
        const user = useAuthStore.getState().user
        if (!user) return

        const state = get()
        const isLiked = state.likedSongs.some(s => s.video_id === song.videoId)

        if (isLiked) {
            // Unlike
            await supabase
                .from('liked_songs')
                .delete()
                .eq('user_id', user.id)
                .eq('video_id', song.videoId)

            set({
                likedSongs: state.likedSongs.filter(s => s.video_id !== song.videoId)
            })
        } else {
            // Like
            const { data } = await supabase
                .from('liked_songs')
                .insert({
                    user_id: user.id,
                    video_id: song.videoId,
                    title: song.title,
                    artist_name: song.artist,
                    thumbnail_url: song.thumbnail,
                    duration_text: song.duration
                })
                .select()
                .single()

            if (data) {
                set({ likedSongs: [data, ...state.likedSongs] })
            }
        }
    },

    // Create playlist
    createPlaylist: async (name, description = '') => {
        const user = useAuthStore.getState().user
        if (!user) return

        const { data, error } = await supabase
            .from('playlists')
            .insert({
                user_id: user.id,
                name,
                description
            })
            .select()
            .single()

        if (data) {
            set({ playlists: [data, ...get().playlists] })
        }
        return { data, error }
    },

    // Add song to playlist
    addToPlaylist: async (playlistId, song) => {
        const { error } = await supabase
            .from('playlist_songs')
            .insert({
                playlist_id: playlistId,
                video_id: song.videoId,
                title: song.title,
                artist_name: song.artist,
                thumbnail_url: song.thumbnail,
                duration_text: song.duration
            })

        return { error }
    },

    // Check if song is liked
    isLiked: (videoId) => {
        return get().likedSongs.some(s => s.video_id === videoId)
    }
}))
