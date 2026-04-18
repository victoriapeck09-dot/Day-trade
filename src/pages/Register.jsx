import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser } from '../firebase'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      await registerUser(email, password)
      navigate('/')
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use')
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address')
      } else {
        setError('Failed to create account')
      }
    }
    setLoading(false)
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>
        <p style={styles.text}>
          Already have an account? <Link to="/login" style={styles.link}>Sign in</Link>
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

export default Register