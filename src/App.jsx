import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Watchlist from './pages/Watchlist'
import Portfolio from './pages/Portfolio'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  const handleLogout = async () => {
    await signOut(auth)
  }

  if (loading) {
    return <div style={styles.loading}>Loading...</div>
  }

  return (
    <BrowserRouter>
      <div style={styles.container}>
        <nav style={styles.nav}>
          <h1 style={styles.logo}>DayTrade</h1>
          {user && (
            <div style={styles.navLinks}>
              <Link to="/" style={styles.link}>Search</Link>
              <Link to="/watchlist" style={styles.link}>Watchlist</Link>
              <Link to="/portfolio" style={styles.link}>Portfolio</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
            </div>
          )}
        </nav>
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
          <Route path="/watchlist" element={user ? <Watchlist user={user} /> : <Navigate to="/login" />} />
          <Route path="/portfolio" element={user ? <Portfolio user={user} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0d1117',
    color: '#e6edf3',
    fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif'
  },
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 40px',
    borderBottom: '1px solid #21262d'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#58a6ff',
    margin: 0
  },
  navLinks: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center'
  },
  link: {
    color: '#e6edf3',
    textDecoration: 'none',
    fontSize: '14px',
    transition: 'color 0.2s'
  },
  logoutBtn: {
    background: '#21262d',
    color: '#e6edf3',
    border: '1px solid #30363d',
    padding: '8px 16px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '18px',
    backgroundColor: '#0d1117',
    color: '#e6edf3'
  }
}

export default App