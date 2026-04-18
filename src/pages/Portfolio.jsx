import React, { useState, useEffect } from 'react'
import { getPortfolio, saveToPortfolio, deleteFromPortfolio } from '../firebase'
import { getQuote } from '../utils/stockData'

function Portfolio({ user }) {
  const [holdings, setHoldings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    buyPrice: ''
  })

  useEffect(() => {
    loadPortfolio()
  }, [])

  const loadPortfolio = async () => {
    setLoading(true)
    try {
      const data = await getPortfolio(user.uid)
      const holdingsWithQuotes = await Promise.all(
        data.map(async (holding) => {
          const quote = await getQuote(holding.symbol)
          return {
            ...holding,
            currentPrice: quote?.price || 0,
            currentChange: quote?.change || 0,
            currentChangePercent: quote?.changePercent || 0
          }
        })
      )
      setHoldings(holdingsWithQuotes)
    } catch (err) {
      console.error('Failed to load portfolio:', err)
    }
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await saveToPortfolio(
        user.uid,
        formData.symbol.toUpperCase(),
        parseFloat(formData.shares),
        parseFloat(formData.buyPrice),
        new Date().toISOString().split('T')[0]
      )
      setFormData({ symbol: '', shares: '', buyPrice: '' })
      setShowForm(false)
      loadPortfolio()
    } catch (err) {
      console.error('Failed to add to portfolio:', err)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteFromPortfolio(id)
      setHoldings(holdings.filter(h => h.id !== id))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  const calculateTotalValue = () => {
    return holdings.reduce((total, h) => total + (h.shares * h.currentPrice), 0)
  }

  const calculateTotalGain = () => {
    return holdings.reduce((total, h) => {
      const gain = (h.currentPrice - h.buyPrice) * h.shares
      return total + gain
    }, 0)
  }

  const calculateTotalGainPercent = () => {
    const totalCost = holdings.reduce((total, h) => total + (h.buyPrice * h.shares), 0)
    const totalValue = calculateTotalValue()
    if (totalCost === 0) return 0
    return ((totalValue - totalCost) / totalCost) * 100
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Your Portfolio</h2>
        <button onClick={() => setShowForm(!showForm)} style={styles.addBtn}>
          {showForm ? 'Cancel' : 'Add Position'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Stock Symbol (e.g., AAPL)"
            value={formData.symbol}
            onChange={(e) => setFormData({...formData, symbol: e.target.value})}
            style={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Number of Shares"
            value={formData.shares}
            onChange={(e) => setFormData({...formData, shares: e.target.value})}
            style={styles.input}
            required
          />
          <input
            type="number"
            placeholder="Buy Price"
            value={formData.buyPrice}
            onChange={(e) => setFormData({...formData, buyPrice: e.target.value})}
            style={styles.input}
            step="0.01"
            required
          />
          <button type="submit" style={styles.submitBtn}>Add</button>
        </form>
      )}

      {holdings.length > 0 && (
        <div style={styles.summary}>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Value</span>
            <span style={styles.summaryValue}>${calculateTotalValue().toFixed(2)}</span>
          </div>
          <div style={styles.summaryItem}>
            <span style={styles.summaryLabel}>Total Gain/Loss</span>
            <span style={{
              ...styles.summaryValue,
              color: calculateTotalGain() >= 0 ? '#26a69a' : '#ef5350'
            }}>
              {calculateTotalGain() >= 0 ? '+' : ''}{calculateTotalGain().toFixed(2)} ({calculateTotalGainPercent().toFixed(2)}%)
            </span>
          </div>
        </div>
      )}

      {loading ? (
        <p style={styles.loading}>Loading...</p>
      ) : holdings.length === 0 ? (
        <p style={styles.empty}>No positions in portfolio. Add your first stock!</p>
      ) : (
        <div style={styles.grid}>
          {holdings.map((holding) => {
            const gain = (holding.currentPrice - holding.buyPrice) * holding.shares
            const gainPercent = ((holding.currentPrice - holding.buyPrice) / holding.buyPrice) * 100
            
            return (
              <div key={holding.id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.symbol}>{holding.symbol}</h3>
                    <p style={styles.shares}>{holding.shares} shares @ ${holding.buyPrice}</p>
                  </div>
                  <button 
                    onClick={() => handleDelete(holding.id)}
                    style={styles.removeBtn}
                  >
                    Remove
                  </button>
                </div>
                <div style={styles.priceInfo}>
                  <div style={styles.priceRow}>
                    <span style={styles.priceLabel}>Current Price</span>
                    <span style={styles.priceValue}>${holding.currentPrice?.toFixed(2)}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceLabel}>Market Value</span>
                    <span style={styles.priceValue}>${(holding.shares * holding.currentPrice).toFixed(2)}</span>
                  </div>
                  <div style={styles.priceRow}>
                    <span style={styles.priceLabel}>Gain/Loss</span>
                    <span style={{
                      ...styles.priceValue,
                      color: gain >= 0 ? '#26a69a' : '#ef5350'
                    }}>
                      {gain >= 0 ? '+' : ''}{gain.toFixed(2)} ({gainPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px'
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    margin: 0
  },
  addBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: '#238636',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  form: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  input: {
    flex: '1 1 200px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#e6edf3',
    fontSize: '16px',
    outline: 'none'
  },
  submitBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    background: '#238636',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  summary: {
    display: 'flex',
    gap: '24px',
    marginBottom: '24px',
    flexWrap: 'wrap'
  },
  summaryItem: {
    background: '#161b22',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #30363d',
    flex: '1 1 200px'
  },
  summaryLabel: {
    display: 'block',
    color: '#8b949e',
    fontSize: '14px',
    marginBottom: '8px'
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '700'
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
  shares: {
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
    gap: '8px'
  },
  priceRow: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  priceLabel: {
    color: '#8b949e',
    fontSize: '14px'
  },
  priceValue: {
    fontSize: '14px',
    fontWeight: '600'
  }
}

export default Portfolio