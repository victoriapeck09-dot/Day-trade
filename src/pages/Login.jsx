import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { loginUser } from '../firebase'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await loginUser(email, password)
      navigate('/')
    } catch (err) {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Sign In</h2>
        {error && <div style={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.text}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 80px)',
    padding: '20px'
  },
  card: {
    background: '#161b22',
    border: '1px solid #30363d',
    borderRadius: '12px',
    padding: '40px',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    margin: '0 0 24px',
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  input: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#e6edf3',
    fontSize: '16px',
    outline: 'none'
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#238636',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  error: {
    background: '#f8514920',
    border: '1px solid #f85149',
    borderRadius: '8px',
    padding: '12px',
    marginBottom: '16px',
    color: '#f85149',
    fontSize: '14px'
  },
  text: {
    textAlign: 'center',
    marginTop: '16px',
    fontSize: '14px'
  },
  link: {
    color: '#58a6ff',
    textDecoration: 'none'
  }
}

export default Login