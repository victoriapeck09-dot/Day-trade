import axios from 'axios'

const API_KEY = 'demo'

export const searchSymbol = async (query) => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${API_KEY}`
    )
    const data = response.data.bestMatches?.[0]
    if (!data) return null
    
    return {
      symbol: data['1. symbol'],
      name: data['2. name'],
      marketCap: 'N/A'
    }
  } catch (error) {
    return null
  }
}

export const getQuote = async (symbol) => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${API_KEY}`
    )
    const data = response.data['Global Quote']
    if (!data || !data['05. price']) return null
    
    return {
      symbol: data['01. symbol'],
      name: symbol,
      price: parseFloat(data['05. price']),
      change: parseFloat(data['09. change']),
      changePercent: parseFloat(data['10. change percent'].replace('%', '')),
      previousClose: parseFloat(data['08. previous close']),
      open: parseFloat(data['02. open']),
      high: parseFloat(data['03. high']),
      low: parseFloat(data['04. low']),
      volume: parseInt(data['06. volume']),
      marketCap: null,
      fiftyTwoWeekHigh: parseFloat(data['03. high']),
      fiftyTwoWeekLow: parseFloat(data['04. low'])
    }
  } catch (error) {
    console.error('Error fetching quote:', error)
    return null
  }
}

export const getHistoricalData = async (symbol, period = '1y', interval = '1d') => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=full&apikey=${API_KEY}`
    )
    
    const timeSeries = response.data['Time Series (Daily)']
    if (!timeSeries) return []
    
    const data = Object.entries(timeSeries).slice(0, 100).map(([date, values]) => ({
      date,
      timestamp: new Date(date).getTime() / 1000,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    }))
    
    return data.reverse()
  } catch (error) {
    console.error('Error fetching historical data:', error)
    return []
  }
}

export const getIntradayData = async (symbol, interval = '5m') => {
  try {
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
    )
    
    const timeSeries = response.data['Time Series (5min)']
    if (!timeSeries) return []
    
    return Object.entries(timeSeries).slice(0, 100).map(([date, values]) => ({
      date,
      timestamp: new Date(date).getTime() / 1000,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume'])
    })).reverse()
  } catch (error) {
    console.error('Error fetching intraday data:', error)
    return []
  }
}