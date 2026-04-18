export const analyzeCandlestickPatterns = (candles) => {
  if (!candles || candles.length < 5) return []
  
  const patterns = []
  const recentCandles = candles.slice(-20)
  
  for (let i = recentCandles.length - 1; i >= 1; i--) {
    const current = recentCandles[i]
    const prev = recentCandles[i - 1]
    
    if (!current || !prev) continue
    
    const body = current.close - current.open
    const bodySize = Math.abs(body)
    const range = current.high - current.low
    const upperShadow = current.high - Math.max(current.open, current.close)
    const lowerShadow = Math.min(current.open, current.close) - current.low
    
    if (range === 0) continue
    
    const bodyRatio = bodySize / range
    const upperShadowRatio = upperShadow / range
    const lowerShadowRatio = lowerShadow / range
    
    if (bodyRatio < 0.1 && upperShadowRatio > 0.4 && lowerShadowRatio > 0.4) {
      patterns.push({
        name: 'Doji',
        meaning: 'Indecision. The opening and closing prices are almost equal, showing market uncertainty.',
        bullish: null,
        date: current.date
      })
    }
    
    if (body > 0 && lowerShadowRatio > 0.6 && bodyRatio < 0.2) {
      patterns.push({
        name: 'Hammer',
        meaning: 'Bullish reversal. Shows buyers pushed prices up from lows despite selling pressure.',
        bullish: true,
        date: current.date
      })
    }
    
    if (body < 0 && lowerShadowRatio > 0.6 && bodyRatio < 0.2) {
      patterns.push({
        name: 'Inverted Hammer',
        meaning: 'Potential bullish reversal. Shows buying pressure at the lows.',
        bullish: true,
        date: current.date
      })
    }
    
    if (body < 0 && upperShadowRatio > 0.6 && bodyRatio < 0.2) {
      patterns.push({
        name: 'Shooting Star',
        meaning: 'Bearish reversal. Shows sellers rejected higher prices.',
        bullish: false,
        date: current.date
      })
    }
    
    if (body > 0 && upperShadowRatio > 0.6 && bodyRatio < 0.2) {
      patterns.push({
        name: 'Hanging Man',
        meaning: 'Bearish reversal pattern at top. Shows selling pressure emerging.',
        bullish: false,
        date: current.date
      })
    }
    
    if (upperShadowRatio < 0.1 && lowerShadowRatio < 0.1 && bodyRatio > 0.9) {
      patterns.push({
        name: 'Marubozu',
        meaning: body > 0 ? 'Strong bullish movement with full control by buyers.' : 'Strong bearish movement with full control by sellers.',
        bullish: body > 0,
        date: current.date
      })
    }
  }
  
  if (recentCandles.length >= 2) {
    const last = recentCandles[recentCandles.length - 1]
    const secondLast = recentCandles[recentCandles.length - 2]
    
    if (last && secondLast && last.close && secondLast.close) {
      const threeWhiteSoldiers = recentCandles.slice(-3).every(c => c && c.close > c.open)
      if (threeWhiteSoldiers) {
        patterns.push({
          name: 'Three White Soldiers',
          meaning: 'Strong bullish signal. Three consecutive strong bullish candles.',
          bullish: true,
          date: last.date
        })
      }
      
      const threeBlackCrows = recentCandles.slice(-3).every(c => c && c.close < c.open)
      if (threeBlackCrows) {
        patterns.push({
          name: 'Three Black Crows',
          meaning: 'Strong bearish signal. Three consecutive strong bearish candles.',
          bullish: false,
          date: last.date
        })
      }
      
      const lastClose = last.close
      const secondLastClose = secondLast.close
      const prevClose = recentCandles[recentCandles.length - 3]?.close
      
      if (lastClose > secondLastClose && secondLastClose > prevClose && last.volume > secondLast.volume) {
        patterns.push({
          name: 'Bullish Engulfing',
          meaning: 'Bullish reversal. Current candle completely engulfs the previous one with higher volume.',
          bullish: true,
          date: last.date
        })
      }
    }
  }
  
  return patterns.slice(-5)
}

export const getOverallTrend = (candles) => {
  if (!candles || candles.length < 20) return 'insufficient_data'
  
  const recent = candles.slice(-20)
  const firstPrice = recent[0]?.close
  const lastPrice = recent[recent.length - 1]?.close
  
  if (!firstPrice || !lastPrice) return 'insufficient_data'
  
  const change = ((lastPrice - firstPrice) / firstPrice) * 100
  
  if (change > 10) return 'strong_uptrend'
  if (change > 3) return 'uptrend'
  if (change < -10) return 'strong_downtrend'
  if (change < -3) return 'downtrend'
  return 'sideways'
}

export const generateAISuggestion = (quote, candles) => {
  const patterns = analyzeCandlestickPatterns(candles)
  const trend = getOverallTrend(candles)
  
  if (!quote) return 'Unable to analyze. Please try again later.'
  
  let trendText = ''
  switch (trend) {
    case 'strong_uptrend':
      trendText = 'The stock is in a strong uptrend'
      break
    case 'uptrend':
      trendText = 'The stock is showing an uptrend'
      break
    case 'strong_downtrend':
      trendText = 'The stock is in a strong downtrend'
      break
    case 'downtrend':
      trendText = 'The stock is showing a downtrend'
      break
    default:
      trendText = 'The stock is moving sideways'
  }
  
  let patternText = ''
  if (patterns.length > 0) {
    const latestPattern = patterns[patterns.length - 1]
    patternText = `Recent pattern detected: ${latestPattern.name}. ${latestPattern.meaning}`
  } else {
    patternText = 'No significant candlestick patterns detected recently.'
  }
  
  let priceText = `Current price: $${quote.price}. Change: $${quote.change} (${quote.changePercent}%).`
  
  let suggestion = ''
  if (trend === 'strong_uptrend' || trend === 'uptrend') {
    suggestion = 'The technical indicators suggest a bullish trend. However, always do your own research before making investment decisions.'
  } else if (trend === 'strong_downtrend' || trend === 'downtrend') {
    suggestion = 'The technical indicators suggest a bearish trend. Consider waiting for a better entry point or setting stop-losses.'
  } else {
    suggestion = 'The stock is in a consolidation phase. Monitor for a breakout in either direction.'
  }
  
  return `${trendText}. ${priceText} ${patternText} ${suggestion} This is not financial advice.`
}