import React, { useState, useEffect } from 'react'
import { getWatchlist, removeFromWatchlist } from '../firebase'
import { getQuote } from '../utils/stockData'

function Watchlist({ user }) {
  const [stocks, setStocks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWatchlist()
  }, [])

  const loadWatchlist = async () => {
    setLoading(true)
    try {
      const symbols = await getWatchlist(user.uid)
      const stocksWithData = await Promise.all(
        symbols.map(async (symbol) => {
          const quote = await getQuote(symbol)
          return quote || { symbol, name: symbol, price: 0, change: 0, changePercent: 0 }
        })
      )
      setStocks(stocksWithData)
    } catch (err) {
      console.error('Failed to load watchlist:', err)
    }
    setLoading(false)
  }

  const handleRemove = async (symbol) => {
    try {
      await removeFromWatchlist(user.uid, symbol)
      setStocks(stocks.filter(s => s.symbol !== symbol))
    } catch (err) {
      console.error('Failed to remove from watchlist:', err)
    }
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Your Watchlist</h2>
      
      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : stocks.length === 0 ? (
        <p style={styles.empty}>No stocks in watchlist. Search for stocks to add them!</p>
      ) : (
        <div style={styles.grid}>
          {stocks.map((stock) => (
            <div key={stock.symbol} style={styles.card}>
              <div style={styles.cardHeader}>
                <div>
                  <h3 style={styles.symbol}>{stock.symbol}</h3>
                  <p style={styles.name}>{stock.name}</p>
                </div>
                <button 
                  onClick={() => handleRemove(stock.symbol)}
                  style={styles.removeBtn}
                >
                  Remove
                </button>
              </div>
              <div style={styles.priceInfo}>
                <span style={styles.price}>${stock.price?.toFixed(2)}</span>
                <span style={{
                  ...styles.change,
                  color: stock.change >= 0 ? '#26a69a' : '#ef5350'
                }}>
                  {stock.change >= 0 ? '+' : ''}{stock.change?.toFixed(2)} ({stock.changePercent?.toFixed(2)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    padding: '20px 40px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    marginBottom: '24px'
  },
  loading: {
    color: '#8b949e'
  },
  empty: {
    color: '#8b949e',
    textAlign: 'center',
    marginTop: '40px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px'
  },
  card: {
    background: '#161b22',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #30363d'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '16px'
  },
  symbol: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0
  },
  name: {
    color: '#8b949e',
    fontSize: '14px',
    margin: '4px 0 0'
  },
  removeBtn: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #30363d',
    background: 'transparent',
    color: '#f85149',
    fontSize: '12px',
    cursor: 'pointer'
  },
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  price: {
    fontSize: '24px',
    fontWeight: '700'
  },
  change: {
    fontSize: '14px'
  }
}

export default Watchlist