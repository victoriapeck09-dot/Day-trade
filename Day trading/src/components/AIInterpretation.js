import React from 'react';
import './AIInterpretation.css';

const AIInterpretation = ({ symbol, stockData }) => {
  if (!stockData || !stockData.chart || !stockData.chart.result || stockData.chart.result.length === 0) {
    return null;
  }

  const result = stockData.chart.result[0];
  const timestamps = result.timestamp || [];
  const indicators = result.indicators && result.indicators.quote && result.indicators.quote[0];
  
  if (!indicators || !indicators.close || indicators.close.length === 0) {
    return null;
  }

  // Simple AI interpretation based on recent price action
  const closes = indicators.close;
  const recentCloses = closes.slice(-5); // Last 5 days
  const currentPrice = recentCloses[recentCloses.length - 1];
  const priceChange = ((currentPrice - recentCloses[0]) / recentCloses[0]) * 100;

  // Determine trend
  let trend = 'neutral';
  let suggestion = 'Hold';
  let confidence = 'Medium';

  if (priceChange > 5) {
    trend = 'strongly bullish';
    suggestion = 'Consider buying';
    confidence = 'High';
  } else if (priceChange > 2) {
    trend = 'bullish';
    suggestion = 'Consider buying';
    confidence = 'Medium';
  } else if (priceChange < -5) {
    trend = 'strongly bearish';
    suggestion = 'Consider selling or avoiding';
    confidence = 'High';
  } else if (priceChange < -2) {
    trend = 'bearish';
    suggestion = 'Consider selling or avoiding';
    confidence = 'Medium';
  }

  // Simple pattern recognition (very basic)
  let pattern = 'No clear pattern detected';
  if (recentCloses.length >= 3) {
    const [d1, d2, d3, d4, d5] = recentCloses;
    if (d1 < d2 && d2 < d3 && d3 < d4 && d4 < d5) {
      pattern = 'Strong upward trend (5 consecutive higher closes)';
    } else if (d1 > d2 && d2 > d3 && d3 > d4 && d4 > d5) {
      pattern = 'Strong downward trend (5 consecutive lower closes)';
    } else if (d1 < d2 && d2 > d3 && d3 < d4 && d4 > d5) {
      pattern = 'Potential zigzag pattern';
    }
  }

  return (
    <div className="ai-interpretation">
      <h3>AI Interpretation for {symbol}</h3>
      <div className="interpretation-content">
        <p><strong>Current Price:</strong> ${currentPrice.toFixed(2)}</p>
        <p><strong>5-Day Change:</strong> {priceChange.toFixed(2)}%</p>
        <p><strong>Trend:</strong> {trend}</p>
        <p><strong>Suggested Action:</strong> {suggestion}</p>
        <p><strong>Confidence:</strong> {confidence}</p>
        <p><strong>Pattern Detected:</strong> {pattern}</p>
      </div>
      <div className="disclaimer">
        <p><em>Disclaimer: This is a simulated AI interpretation for demonstration purposes only. 
        Not financial advice. Always do your own research before making investment decisions.</em></p>
      </div>
    </div>
  );
};

export default AIInterpretation;