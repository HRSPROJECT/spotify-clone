// Audio Player Component
import { useEffect, useRef } from 'react'
import { usePlayerStore, useLibraryStore, useAuthStore } from '../store'
import {
    FaPlay, FaPause, FaStepForward, FaStepBackward,
    FaVolumeUp, FaVolumeMute, FaHeart, FaRegHeart,
    FaRandom, FaRedo
} from 'react-icons/fa'

export default function Player() {
    const audioRef = useRef(null)
    const {
        currentSong, isPlaying, volume, progress, duration,
        setAudioRef, togglePlay, playNext, playPrev, setVolume, setProgress, setDuration, seek
    } = usePlayerStore()

    const { toggleLike, isLiked } = useLibraryStore()
    const user = useAuthStore(s => s.user)

    // Set audio ref on mount
    useEffect(() => {
        if (audioRef.current) {
            setAudioRef(audioRef.current)
            audioRef.current.volume = volume
        }
    }, [])

    // Play when song changes
    useEffect(() => {
        if (audioRef.current && currentSong?.streamUrl) {
            audioRef.current.src = currentSong.streamUrl
            audioRef.current.play().catch(console.error)
        }
    }, [currentSong?.streamUrl])

    // Handle time updates
    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setProgress(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleEnded = () => {
        playNext()
    }

    // Format time
    const formatTime = (seconds) => {
        if (!seconds || isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    // Progress bar click
    const handleProgressClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        seek(percent * duration)
    }

    // Volume click
    const handleVolumeClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const percent = (e.clientX - rect.left) / rect.width
        setVolume(Math.max(0, Math.min(1, percent)))
    }

    const liked = currentSong ? isLiked(currentSong.videoId) : false

    if (!currentSong) {
        return (
            <div className="player-bar" style={{ justifyContent: 'center' }}>
                <p style={{ color: 'var(--text-muted)' }}>Select a song to play</p>
                <audio ref={audioRef} />
            </div>
        )
    }

    return (
        <div className="player-bar">
            {/* Hidden audio element */}
            <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={handleEnded}
            />

            {/* Now Playing */}
            <div className="now-playing">
                <img
                    src={currentSong.thumbnail || '/default-song.png'}
                    alt={currentSong.title}
                    className="now-playing-image"
                />
                <div className="now-playing-info">
                    <p className="now-playing-title">{currentSong.title}</p>
                    <p className="now-playing-artist">{currentSong.artist}</p>
                </div>
                {user && (
                    <button
                        onClick={() => toggleLike(currentSong)}
                        style={{
                            color: liked ? 'var(--accent-primary)' : 'var(--text-muted)',
                            marginLeft: '8px'
                        }}
                    >
                        {liked ? <FaHeart /> : <FaRegHeart />}
                    </button>
                )}
            </div>

            {/* Player Controls */}
            <div className="player-controls">
                <div className="player-buttons">
                    <button className="player-btn">
                        <FaRandom size={14} />
                    </button>
                    <button className="player-btn" onClick={playPrev}>
                        <FaStepBackward size={16} />
                    </button>
                    <button className="btn-play" onClick={togglePlay} style={{ width: '40px', height: '40px' }}>
                        {isPlaying ? <FaPause size={16} /> : <FaPlay size={16} style={{ marginLeft: '2px' }} />}
                    </button>
                    <button className="player-btn" onClick={playNext}>
                        <FaStepForward size={16} />
                    </button>
                    <button className="player-btn">
                        <FaRedo size={14} />
                    </button>
                </div>

                <div className="progress-container">
                    <span className="progress-time">{formatTime(progress)}</span>
                    <div className="progress-bar" onClick={handleProgressClick}>
                        <div
                            className="progress-fill"
                            style={{ width: `${(progress / duration) * 100 || 0}%` }}
                        />
                    </div>
                    <span className="progress-time">{formatTime(duration)}</span>
                </div>
            </div>

            {/* Volume Controls */}
            <div className="volume-controls">
                <button
                    className="player-btn"
                    onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                >
                    {volume === 0 ? <FaVolumeMute size={16} /> : <FaVolumeUp size={16} />}
                </button>
                <div className="volume-slider" onClick={handleVolumeClick}>
                    <div
                        style={{
                            height: '100%',
                            width: `${volume * 100}%`,
                            background: 'var(--accent-primary)',
                            borderRadius: '999px'
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
