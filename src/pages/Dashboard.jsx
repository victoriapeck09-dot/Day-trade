import React, { useState, useEffect, useRef } from 'react'
import { getQuote, getHistoricalData } from '../utils/stockData'
import { analyzeCandlestickPatterns, generateAISuggestion } from '../utils/candlestickPatterns'
import { saveToWatchlist } from '../firebase'
import { createChart } from 'lightweight-charts'

function Dashboard() {
  const [symbol, setSymbol] = useState('')
  const [quote, setQuote] = useState(null)
  const [candles, setCandles] = useState([])
  const [patterns, setPatterns] = useState([])
  const [aiSuggestion, setAiSuggestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('1y')
  const [showAI, setShowAI] = useState(false)
  const [inWatchlist, setInWatchlist] = useState(false)
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    return () => {
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
      }
    }
  }, [])

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!symbol.trim()) return

    setLoading(true)
    setError('')
    setQuote(null)
    setCandles([])
    setPatterns([])
    setAiSuggestion('')

    try {
      const [quoteData, historicalData] = await Promise.all([
        getQuote(symbol.trim().toUpperCase()),
        getHistoricalData(symbol.trim().toUpperCase(), period)
      ])

      if (!quoteData) {
        setError('Stock not found. Please check the symbol and try again.')
        setLoading(false)
        return
      }

      setQuote(quoteData)
      setCandles(historicalData)

      const detectedPatterns = analyzeCandlestickPatterns(historicalData)
      setPatterns(detectedPatterns)

      if (historicalData.length > 0) {
        const suggestion = generateAISuggestion(quoteData, historicalData)
        setAiSuggestion(suggestion)
      }
    } catch (err) {
      setError('Failed to fetch stock data. Please try again.')
    }

    setLoading(false)
  }

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod)
    if (quote) {
      setLoading(true)
      const historicalData = await getHistoricalData(quote.symbol, newPeriod)
      setCandles(historicalData)
      const detectedPatterns = analyzeCandlestickPatterns(historicalData)
      setPatterns(detectedPatterns)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!chartContainerRef.current || candles.length === 0) return

    if (chartRef.current) {
      chartRef.current.remove()
    }

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: '#0d1117' },
        textColor: '#e6edf3'
      },
      grid: {
        vertLines: { color: '#21262d' },
        horzLines: { color: '#21262d' }
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false
      }
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350'
    })

    candleSeries.setData(candles.map(c => ({
      time: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close
    })))

    chart.timeScale().fitContent()
    chartRef.current = chart

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth })
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [candles])

  const addToWatchlist = async () => {
    if (!quote) return
    try {
      await saveToWatchlist(quote.symbol, quote.symbol)
      setInWatchlist(true)
    } catch (err) {
      console.error('Failed to add to watchlist:', err)
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSearch} style={styles.searchForm}>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Enter stock symbol (e.g., AAPL)"
          style={styles.searchInput}
        />
        <button type="submit" style={styles.searchButton} disabled={loading}>
          {loading ? 'Loading...' : 'Search'}
        </button>
      </form>

      {error && <div style={styles.error}>{error}</div>}

      {quote && (
        <div style={styles.content}>
          <div style={styles.header}>
            <div>
              <h2 style={styles.symbol}>{quote.symbol}</h2>
              <p style={styles.name}>{quote.name}</p>
            </div>
            <div style={styles.priceInfo}>
              <span style={styles.price}>${quote.price?.toFixed(2)}</span>
              <span style={{
                ...styles.change,
                color: quote.change >= 0 ? '#26a69a' : '#ef5350'
              }}>
                {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)
              </span>
            </div>
            <button onClick={addToWatchlist} style={styles.watchlistBtn}>
              {inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </button>
          </div>

          <div style={styles.periodButtons}>
            {['5d', '1mo', '3mo', '6mo', '1y', '2y'].map(p => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                style={{
                  ...styles.periodBtn,
                  background: period === p ? '#238636' : '#21262d'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <div ref={chartContainerRef} style={styles.chart} />

          <div style={styles.stats}>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Open</span>
              <span style={styles.statValue}>${quote.open?.toFixed(2)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>High</span>
              <span style={styles.statValue}>${quote.high?.toFixed(2)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Low</span>
              <span style={styles.statValue}>${quote.low?.toFixed(2)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>Volume</span>
              <span style={styles.statValue}>{quote.volume?.toLocaleString()}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>52W High</span>
              <span style={styles.statValue}>${quote.fiftyTwoWeekHigh?.toFixed(2)}</span>
            </div>
            <div style={styles.statItem}>
              <span style={styles.statLabel}>52W Low</span>
              <span style={styles.statValue}>${quote.fiftyTwoWeekLow?.toFixed(2)}</span>
            </div>
          </div>

          {patterns.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Candlestick Patterns</h3>
              <div style={styles.patterns}>
                {patterns.map((pattern, index) => (
                  <div key={index} style={styles.patternCard}>
                    <div style={styles.patternName}>
                      {pattern.name}
                      {pattern.bullish !== null && (
                        <span style={{
                          ...styles.bullishBadge,
                          background: pattern.bullish ? '#26a69a' : '#ef5350'
                        }}>
                          {pattern.bullish ? 'Bullish' : 'Bearish'}
                        </span>
                      )}
                    </div>
                    <p style={styles.patternMeaning}>{pattern.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setShowAI(!showAI)} style={styles.aiButton}>
            {showAI ? 'Hide AI Analysis' : 'Get AI Analysis'}
          </button>

          {showAI && aiSuggestion && (
            <div style={styles.aiSection}>
              <h3 style={styles.sectionTitle}>AI Analysis</h3>
              <p style={styles.aiText}>{aiSuggestion}</p>
            </div>
          )}
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
  searchForm: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px'
  },
  searchInput: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#0d1117',
    color: '#e6edf3',
    fontSize: '16px',
    outline: 'none'
  },
  searchButton: {
    padding: '14px 32px',
    borderRadius: '8px',
    border: 'none',
    background: '#238636',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    background: '#f8514920',
    border: '1px solid #f85149',
    borderRadius: '8px',
    padding: '12px',
    color: '#f85149',
    marginBottom: '16px'
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexWrap: 'wrap',
    gap: '16px'
  },
  symbol: {
    fontSize: '32px',
    fontWeight: '700',
    margin: 0
  },
  name: {
    color: '#8b949e',
    margin: '4px 0 0'
  },
  priceInfo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end'
  },
  price: {
    fontSize: '32px',
    fontWeight: '700'
  },
  change: {
    fontSize: '16px',
    fontWeight: '500'
  },
  watchlistBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#21262d',
    color: '#e6edf3',
    fontSize: '14px',
    cursor: 'pointer'
  },
  periodButtons: {
    display: 'flex',
    gap: '8px'
  },
  periodBtn: {
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none',
    color: '#e6edf3',
    fontSize: '14px',
    cursor: 'pointer'
  },
  chart: {
    width: '100%',
    height: '400px',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '16px'
  },
  statItem: {
    background: '#161b22',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #30363d'
  },
  statLabel: {
    display: 'block',
    color: '#8b949e',
    fontSize: '12px',
    marginBottom: '4px'
  },
  statValue: {
    fontSize: '18px',
    fontWeight: '600'
  },
  section: {
    marginTop: '16px'
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '12px'
  },
  patterns: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px'
  },
  patternCard: {
    background: '#161b22',
    padding: '16px',
    borderRadius: '8px',
    border: '1px solid #30363d'
  },
  patternName: {
    fontWeight: '600',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  bullishBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    color: '#fff'
  },
  patternMeaning: {
    color: '#8b949e',
    fontSize: '14px',
    margin: 0
  },
  aiButton: {
    padding: '14px 24px',
    borderRadius: '8px',
    border: '1px solid #30363d',
    background: '#21262d',
    color: '#e6edf3',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px'
  },
  aiSection: {
    background: '#161b22',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #30363d',
    marginTop: '16px'
  },
  aiText: {
    lineHeight: '1.6',
    margin: 0
  }
}

export default Dashboard