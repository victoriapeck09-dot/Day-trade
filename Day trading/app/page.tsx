'use client'

import { useState, useEffect, useRef } from 'react'

interface StockQuote {
  c: number
  d: number
  dp: number
  h: number
  l: number
  o: number
  pc: number
  t: number
}

interface CandleData {
  time: number
  o: number
  h: number
  l: number
  c: number
}

interface WatchlistItem {
  symbol: string
  price: number
  change: number
  changePercent: number
}

interface PortfolioItem {
  id: string
  symbol: string
  shares: number
  entryPrice: number
  currentPrice: number
  date: string
}

interface APIKeys {
  openai: string
  finnhub: string
}

declare global {
  interface Window {
    LightweightCharts: any
  }
}

export default function Home() {
  const [searchSymbol, setSearchSymbol] = useState('')
  const [currentSymbol, setCurrentSymbol] = useState('AAPL')
  const [quote, setQuote] = useState<StockQuote | null>(null)
  const [candleData, setCandleData] = useState<CandleData[]>([])
  const [detectedPattern, setDetectedPattern] = useState<string>('')
  const [aiResponse, setAiResponse] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [apiKeys, setApiKeys] = useState<APIKeys | null>(null)
  const [showKeyModal, setShowKeyModal] = useState(false)
  const [showAddToWatchlist, setShowAddToWatchlist] = useState(false)
  const [showAddToPortfolio, setShowAddToPortfolio] = useState(false)
  const [newPortfolioItem, setNewPortfolioItem] = useState({ shares: '', entryPrice: '' })
  const [openaiKey, setOpenaiKey] = useState('')
  const [finnhubKey, setFinnhubKey] = useState('')
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<any>(null)
  const seriesRef = useRef<any>(null)

  useEffect(() => {
    const savedKeys = localStorage.getItem('apiKeys')
    if (savedKeys) {
      setApiKeys(JSON.parse(savedKeys))
    }

    const savedWatchlist = localStorage.getItem('watchlist')
    if (savedWatchlist) {
      setWatchlist(JSON.parse(savedWatchlist))
    }

    const savedPortfolio = localStorage.getItem('portfolio')
    if (savedPortfolio) {
      setPortfolio(JSON.parse(savedPortfolio))
    }
  }, [])

  useEffect(() => {
    if (currentSymbol) {
      fetchStockData()
    }
  }, [currentSymbol])

  useEffect(() => {
    if (quote && currentSymbol) {
      analyzePattern()
    }
  }, [quote, candleData])

  const saveApiKeys = () => {
    if (openaiKey && finnhubKey) {
      const keys = { openai: openaiKey, finnhub: finnhubKey }
      localStorage.setItem('apiKeys', JSON.stringify(keys))
      setApiKeys(keys)
      setShowKeyModal(false)
    }
  }

  const fetchStockData = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/stock?symbol=${currentSymbol}`)
      const yahooData = await res.json()

      if (yahooData.chart?.result?.[0]) {
        const result = yahooData.chart.result[0]
        const meta = result.meta
        
        const quoteData = {
          c: meta.regularMarketPrice,
          d: meta.regularMarketPrice - meta.previousClose,
          dp: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
          h: meta.regularMarketDayHigh,
          l: meta.regularMarketDayLow,
          o: meta.chartPreviousClose,
          pc: meta.previousClose,
          t: Math.floor(Date.now() / 1000)
        }
        setQuote(quoteData)

        const timestamps = result.timestamp
        const indicators = result.indicators.quote[0]

        if (timestamps) {
          const candles: CandleData[] = []
          for (let i = 0; i < timestamps.length; i++) {
            candles.push({
              time: timestamps[i],
              o: indicators.open[i] || 0,
              h: indicators.high[i] || 0,
              l: indicators.low[i] || 0,
              c: indicators.close[i] || 0
            })
          }
          setCandleData(candles)
          createChart(candles)
        }
      } else {
        throw new Error('Symbol not found: ' + currentSymbol)
      }
    } catch (err) {
      console.error('Failed to fetch stock data:', err)
    }
    setLoading(false)
  }

  const createChart = (data: CandleData[]) => {
    if (!chartContainerRef.current || typeof window === 'undefined') return

    const container = chartContainerRef.current
    const existingChart = container.querySelector('#chart')
    if (existingChart) {
      existingChart.remove()
    }

    const chartDiv = document.createElement('div')
    chartDiv.id = 'chart'
    chartDiv.style.width = '100%'
    chartDiv.style.height = '350px'
    container.appendChild(chartDiv)

    if (window.LightweightCharts && chartDiv) {
      if (chartRef.current) {
        chartRef.current.remove()
      }

      chartRef.current = window.LightweightCharts.createChart(chartDiv, {
        width: chartDiv.clientWidth,
        height: 350,
        layout: {
          background: { color: '#161b22' },
          textColor: '#8b949e'
        },
        grid: {
          vertLines: { color: '#21262d' },
          horzLines: { color: '#21262d' }
        },
        crosshair: {
          mode: 1
        },
        timeScale: {
          borderColor: '#30363d'
        },
        rightPriceScale: {
          borderColor: '#30363d'
        }
      })

      seriesRef.current = chartRef.current.addCandlestickSeries({
        upColor: '#3fb950',
        downColor: '#f85149',
        borderUpColor: '#3fb950',
        borderDownColor: '#f85149',
        wickUpColor: '#3fb950',
        wickDownColor: '#f85149'
      })

      seriesRef.current.setData(data)
      chartRef.current.timeScale().fitContent()
      console.log('Chart created with', data.length, 'candles')
    }
  }

  const analyzePattern = () => {
    if (candleData.length < 5) {
      setDetectedPattern('Insufficient data')
      return
    }

    const last = candleData[candleData.length - 1]
    const prev = candleData[candleData.length - 2]
    const prev2 = candleData[candleData.length - 3]

    const lastBody = Math.abs(last.c - last.o)
    const lastRange = last.h - last.l
    const prevBody = Math.abs(prev.c - prev.o)

    if (!last || !prev) {
      setDetectedPattern('Insufficient data')
      return
    }

    let pattern = ''

    if (last.o > last.c && last.l < last.o && lastRange > lastBody * 2) {
      if (last.c > prev.c && prev.o > prev.c) {
        pattern = 'Bullish Engulfing - Potential reversal upward'
      } else {
        pattern = 'Hammer - Potential bullish reversal'
      }
    } else if (last.c > last.o && last.h > last.o && lastRange > lastBody * 2) {
      if (last.o < prev.o && prev.o > prev.c) {
        pattern = 'Bearish Engulfing - Potential reversal downward'
      } else {
        pattern = 'Shooting Star - Potential bearish reversal'
      }
    } else if (lastBody < lastRange * 0.1) {
      pattern = 'Doji - Market indecision'
    } else if (last.c > last.o && last.c > prev.c && prev.c > prev.o) {
      pattern = 'Bullish momentum building'
    } else if (last.c < last.o && last.c < prev.c && prev.c < prev.o) {
      pattern = 'Bearish pressure continuing'
    } else if (last.o > prev.h || last.l > prev.h) {
      pattern = 'Breakout above recent high'
    } else if (last.h < prev.l || last.c < prev.l) {
      pattern = 'Breakdown below recent low'
    } else {
      pattern = 'Sideways movement - Watch for confirmation'
    }

    setDetectedPattern(pattern)
  }

  const fetchAIInterpretation = async () => {
    if (!apiKeys?.openai || !quote || !detectedPattern) return

    setAiLoading(true)
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKeys.openai}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a day trading assistant. Analyze candlestick patterns and provide actionable suggestions. Be concise and practical. Always include a confidence level and risk note.'
            },
            {
              role: 'user',
              content: `Analyze ${currentSymbol}:\nCurrent Price: $${quote.c}\nChange: ${quote.d} (${quote.dp}%)\nDay Range: $${quote.l} - $${quote.h}\nPrevious Close: $${quote.pc}\n\nDetected Pattern: ${detectedPattern}\n\nProvide:\n1. Pattern explanation\n2. Suggested action (BUY/HOLD/SELL) with confidence level\n3. Key risks to watch\n4. Price targets for next 5-15 minutes`
            }
          ],
          max_tokens: 300
        })
      })

      const data = await response.json()
      if (data.choices && data.choices[0]) {
        setAiResponse(data.choices[0].message.content)
      }
    } catch (err) {
      console.error('AI request failed:', err)
      setAiResponse('Failed to get AI analysis. Please check your API key.')
    }
    setAiLoading(false)
  }

  const handleSearch = () => {
    if (searchSymbol.trim()) {
      setCurrentSymbol(searchSymbol.trim().toUpperCase())
      setSearchSymbol('')
    }
  }

  const addToWatchlist = () => {
    if (quote && currentSymbol) {
      const newItem: WatchlistItem = {
        symbol: currentSymbol,
        price: quote.c,
        change: quote.d,
        changePercent: quote.dp
      }
      const updated = [...watchlist, newItem]
      setWatchlist(updated)
      localStorage.setItem('watchlist', JSON.stringify(updated))
      setShowAddToWatchlist(false)
    }
  }

  const removeFromWatchlist = (symbol: string) => {
    const updated = watchlist.filter(item => item.symbol !== symbol)
    setWatchlist(updated)
    localStorage.setItem('watchlist', JSON.stringify(updated))
  }

  const addToPortfolio = () => {
    if (currentSymbol && newPortfolioItem.shares && newPortfolioItem.entryPrice) {
      const newItem: PortfolioItem = {
        id: Date.now().toString(),
        symbol: currentSymbol,
        shares: parseFloat(newPortfolioItem.shares),
        entryPrice: parseFloat(newPortfolioItem.entryPrice),
        currentPrice: quote?.c || parseFloat(newPortfolioItem.entryPrice),
        date: new Date().toISOString().split('T')[0]
      }
      const updated = [...portfolio, newItem]
      setPortfolio(updated)
      localStorage.setItem('portfolio', JSON.stringify(updated))
      setShowAddToPortfolio(false)
      setNewPortfolioItem({ shares: '', entryPrice: '' })
    }
  }

  const removeFromPortfolio = (id: string) => {
    const updated = portfolio.filter(item => item.id !== id)
    setPortfolio(updated)
    localStorage.setItem('portfolio', JSON.stringify(updated))
  }

  const selectStock = (symbol: string) => {
    setCurrentSymbol(symbol)
  }

  const totalValue = portfolio.reduce((sum, item) => {
    const currentPrice = quote && item.symbol === currentSymbol ? quote.c : item.currentPrice
    return sum + (item.shares * currentPrice)
  }, 0)

  const totalPnL = portfolio.reduce((sum, item) => {
    const currentPrice = quote && item.symbol === currentSymbol ? quote.c : item.currentPrice
    return sum + (item.shares * (currentPrice - item.entryPrice))
  }, 0)

  return (
    <div className="app">
      <div className="header">
        <h1>Day Trade Helper</h1>
        <p>AI-powered candlestick analysis and portfolio tracking</p>
      </div>

      <div className="main-grid">
        <div className="main-content">
          <div className="search-section">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Enter stock symbol (e.g., AAPL, TSLA, NVDA)"
                value={searchSymbol}
                onChange={(e) => setSearchSymbol(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch} disabled={loading}>
                {loading ? 'Loading...' : 'Search'}
              </button>
            </div>
          </div>

          <div className="chart-container" ref={chartContainerRef}>
            <div className="chart-header">
              <h2>{currentSymbol}</h2>
              {quote && (
                <div className="stock-info">
                  <span className="stock-price">${quote.c.toFixed(2)}</span>
                  <span className={`stock-change ${quote.d >= 0 ? 'positive' : 'negative'}`}>
                    {quote.d >= 0 ? '+' : ''}{quote.d.toFixed(2)} ({quote.dp.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            {loading && <div className="loading">Loading chart...</div>}
          </div>

          <div className="ai-section">
            <h3>Detected Pattern</h3>
            <span className="pattern-badge">{detectedPattern || 'Analyzing...'}</span>

            <button
              className="add-btn"
              onClick={fetchAIInterpretation}
              disabled={aiLoading || !detectedPattern}
              style={{ marginTop: '12px', marginBottom: '12px' }}
            >
              {aiLoading ? 'Analyzing...' : 'Get AI Suggestion'}
            </button>

            {aiResponse && (
              <div className="ai-response">
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{aiResponse}</pre>
              </div>
            )}

            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <button
                className="btn-success"
                onClick={() => setShowAddToPortfolio(true)}
              >
                Add to Portfolio
              </button>
              <button
                className="btn-primary"
                onClick={() => setShowAddToWatchlist(true)}
              >
                Add to Watchlist
              </button>
            </div>
          </div>
        </div>

        <div className="sidebar">
          <div className="panel">
            <h3>Watchlist</h3>
            {watchlist.length === 0 ? (
              <div className="empty-state">No stocks in watchlist</div>
            ) : (
              watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="watchlist-item"
                  onClick={() => selectStock(item.symbol)}
                  onDoubleClick={() => removeFromWatchlist(item.symbol)}
                >
                  <div>
                    <div className="watchlist-ticker">{item.symbol}</div>
                  </div>
                  <div className="watchlist-price">
                    <div>${item.price.toFixed(2)}</div>
                    <div className={`watchlist-change ${item.change >= 0 ? 'pnl-positive' : 'pnl-negative'}`}>
                      {item.change >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="panel">
            <h3>Portfolio</h3>
            {portfolio.length === 0 ? (
              <div className="empty-state">No holdings yet</div>
            ) : (
              portfolio.map((item) => {
                const pnl = item.shares * (item.currentPrice - item.entryPrice)
                return (
                  <div key={item.id} className="portfolio-item">
                    <div>
                      <div className="watchlist-ticker">{item.symbol}</div>
                      <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>
                        {item.shares} shares @ ${item.entryPrice}
                      </div>
                    </div>
                    <div className="watchlist-price">
                      <div>${(item.shares * item.currentPrice).toFixed(2)}</div>
                      <div className={pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            {portfolio.length > 0 && (
              <div style={{ marginTop: '12px', padding: '12px', background: '#21262d', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Total Value:</span>
                  <span>${totalValue.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Total P&L:</span>
                  <span className={totalPnL >= 0 ? 'pnl-positive' : 'pnl-negative'}>
                    {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showKeyModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Enter API Keys</h3>
            <p style={{ color: '#8b949e', marginBottom: '16px' }}>
              Enter your API keys to use the app. These are stored locally on your computer.
            </p>
            <div className="form-group">
              <label>OpenAI API Key</label>
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="sk-..."
              />
            </div>
            <div className="form-group">
              <label>Finnhub API Key</label>
              <input
                type="password"
                value={finnhubKey}
                onChange={(e) => setFinnhubKey(e.target.value)}
                placeholder="Your Finnhub API key"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={saveApiKeys}>
                Save Keys
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddToWatchlist && (
        <div className="modal-overlay" onClick={() => setShowAddToWatchlist(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add {currentSymbol} to Watchlist?</h3>
            <div className="modal-actions">
              <button className="btn-primary" onClick={addToWatchlist}>
                Add
              </button>
              <button className="btn-secondary" onClick={() => setShowAddToWatchlist(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showAddToPortfolio && (
        <div className="modal-overlay" onClick={() => setShowAddToPortfolio(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add {currentSymbol} to Portfolio</h3>
            <div className="form-group">
              <label>Number of Shares</label>
              <input
                type="number"
                value={newPortfolioItem.shares}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, shares: e.target.value })}
                placeholder="10"
              />
            </div>
            <div className="form-group">
              <label>Entry Price</label>
              <input
                type="number"
                step="0.01"
                value={newPortfolioItem.entryPrice}
                onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, entryPrice: e.target.value })}
                placeholder={quote?.c.toFixed(2)}
              />
            </div>
            <div className="modal-actions">
              <button className="btn-primary" onClick={addToPortfolio}>
                Add
              </button>
              <button className="btn-secondary" onClick={() => setShowAddToPortfolio(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}