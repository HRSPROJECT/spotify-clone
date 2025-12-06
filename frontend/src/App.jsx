// Main App Component
import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore, useLibraryStore } from './store'

// Layout Components
import Sidebar from './components/Sidebar'
import Player from './components/Player'

// Pages
import Home from './pages/Home'
import Search from './pages/Search'
import Genre from './pages/Genre'
import Artist from './pages/Artist'
import Album from './pages/Album'
import LikedSongs from './pages/LikedSongs'
import Library from './pages/Library'
import { Login, Signup } from './pages/Auth'

// Layout wrapper for main app pages
function AppLayout({ children }) {
    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>
            <Player />
        </div>
    )
}

export default function App() {
    const { init, user } = useAuthStore()
    const { fetchLibrary } = useLibraryStore()

    // Initialize auth on mount
    useEffect(() => {
        init()
    }, [])

    // Fetch library when user changes
    useEffect(() => {
        if (user) {
            fetchLibrary()
        }
    }, [user])

    return (
        <BrowserRouter>
            <Routes>
                {/* Auth routes (no layout) */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />

                {/* App routes (with layout) */}
                <Route path="/" element={<AppLayout><Home /></AppLayout>} />
                <Route path="/search" element={<AppLayout><Search /></AppLayout>} />
                <Route path="/library" element={<AppLayout><Library /></AppLayout>} />
                <Route path="/liked" element={<AppLayout><LikedSongs /></AppLayout>} />
                <Route path="/genre/:genreId" element={<AppLayout><Genre /></AppLayout>} />
                <Route path="/artist/:browseId" element={<AppLayout><Artist /></AppLayout>} />
                <Route path="/album/:browseId" element={<AppLayout><Album /></AppLayout>} />
            </Routes>
        </BrowserRouter>
    )
}
