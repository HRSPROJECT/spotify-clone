// Auth Pages - Login and Signup
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { FaMusic, FaSpotify } from 'react-icons/fa'

export function Login() {
    const navigate = useNavigate()
    const { signIn } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signIn(email, password)
            navigate('/')
        } catch (err) {
            setError(err.message || 'Failed to sign in')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-card slide-up">
                <div className="auth-logo">
                    <FaMusic size={48} color="var(--accent-primary)" />
                </div>

                <h1 className="auth-title">Log in to Spotify</h1>

                {error && (
                    <div style={{
                        background: 'rgba(241, 94, 94, 0.1)',
                        border: '1px solid var(--error-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        color: 'var(--error-color)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', marginTop: '24px' }}
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Log In'}
                    </button>
                </form>

                <div className="form-divider">or</div>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Don't have an account?{' '}
                    <Link to="/signup" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                        Sign up for Spotify
                    </Link>
                </p>
            </div>
        </div>
    )
}

export function Signup() {
    const navigate = useNavigate()
    const { signUp } = useAuthStore()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            await signUp(email, password, name)
            setSuccess(true)
        } catch (err) {
            setError(err.message || 'Failed to sign up')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="auth-container">
                <div className="auth-card slide-up" style={{ textAlign: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: 'var(--accent-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px'
                    }}>
                        <FaMusic size={32} color="var(--bg-primary)" />
                    </div>
                    <h2>Check your email!</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '16px 0' }}>
                        We've sent a confirmation link to {email}
                    </p>
                    <Link to="/login" className="btn btn-primary">
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="auth-container">
            <div className="auth-card slide-up">
                <div className="auth-logo">
                    <FaMusic size={48} color="var(--accent-primary)" />
                </div>

                <h1 className="auth-title">Sign up for free</h1>

                {error && (
                    <div style={{
                        background: 'rgba(241, 94, 94, 0.1)',
                        border: '1px solid var(--error-color)',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '16px',
                        color: 'var(--error-color)',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label">What's your name?</label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Create a password</label>
                        <input
                            type="password"
                            className="form-input"
                            placeholder="Create a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '14px', marginTop: '24px' }}
                        disabled={loading}
                    >
                        {loading ? 'Creating account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="form-divider">or</div>

                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    )
}
