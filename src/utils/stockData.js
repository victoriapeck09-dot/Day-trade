import axios from 'axios'

const PROXY_URL = 'https://corsproxy.io/?'
const BASE_URL = 'https://query1.finance.yahoo.com/v10'

export const searchSymbol = async (query) => {
  try {
    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/finance/quoteSummary/${query}?modules=longName,shortName,symbol,marketCap`)}`)
    const data = response.data.quoteSummary.result[0]
    if (!data) return null
    
    return {
      symbol: data.symbol,
      name: data.shortName || data.longName || query,
      marketCap: data.price?.marketCap?.fmt || 'N/A'
    }
  } catch (error) {
    return null
  }
}

export const getQuote = async (symbol) => {
  try {
    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(`${BASE_URL}/finance/quote?symbols=${symbol}`)}`)
    const data = response.data.quoteResponse.result[0]
    if (!data) return null
    
    return {
      symbol: data.symbol,
      name: data.shortName || data.longName || symbol,
      price: data.regularMarketPrice,
      change: data.regularMarketChange,
      changePercent: data.regularMarketChangePercent,
      previousClose: data.regularMarketPreviousClose,
      open: data.regularMarketOpen,
      high: data.regularMarketDayHigh,
      low: data.regularMarketDayLow,
      volume: data.regularMarketVolume,
      marketCap: data.marketCap,
      fiftyTwoWeekHigh: data.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: data.fiftyTwoWeekLow
    }
  } catch (error) {
    return null
  }
}

export const getHistoricalData = async (symbol, period = '1y', interval = '1d') => {
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=0&period2=${Math.floor(Date.now() / 1000)}&interval=${interval}`
    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(url)}`)
    
    const data = response.data.chart.result[0]
    if (!data || !data.timestamp) return []
    
    const timestamps = data.timestamp
    const quotes = data.indicators?.quote?.[0]
    
    if (!quotes) return []
    
    return timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString().split('T')[0],
      timestamp,
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    })).filter(q => q.close !== null)
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

export const getIntradayData = async (symbol, interval = '5m') => {
  try {
    const now = Math.floor(Date.now() / 1000)
    const oneDayAgo = now - 86400
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${oneDayAgo}&period2=${now}&interval=${interval}`
    const response = await axios.get(`${PROXY_URL}${encodeURIComponent(url)}`)
    
    const data = response.data.chart.result[0]
    if (!data || !data.timestamp) return []
    
    const timestamps = data.timestamp
    const quotes = data.indicators?.quote?.[0]
    
    if (!quotes) return []
    
    return timestamps.map((timestamp, index) => ({
      date: new Date(timestamp * 1000).toISOString(),
      timestamp,
      open: quotes.open[index],
      high: quotes.high[index],
      low: quotes.low[index],
      close: quotes.close[index],
      volume: quotes.volume[index]
    })).filter(q => q.close !== null)
  } catch (error) {
    console.error('Error fetching intraday data:', error)
    return []
  }
}