import React from 'react';
import { Candlestick } from 'react-chartjs-2';
import 'chartjs-chart-financial';
import './StockChart.css';

const StockChart = ({ stockData, symbol }) => {
  if (!stockData || !stockData.chart || !stockData.chart.result || stockData.chart.result.length === 0) {
    return <div className="chart-placeholder">No data available for {symbol}</div>;
  }

  const result = stockData.chart.result[0];
  const timestamps = result.timestamp || [];
  const indicators = result.indicators && result.indicators.quote && result.indicators.quote[0];
  
  if (!indicators || !indicators.open) {
    return <div className="chart-placeholder">No price data available for {symbol}</div>;
  }

  const candlestickData = timestamps.map((ts, index) => ({
    x: new Date(ts * 1000).toLocaleDateString(), // Format as date string for x-axis
    o: indicators.open[index],
    h: indicators.high[index],
    l: indicators.low[index],
    c: indicators.close[index]
  }));

  // Filter out any undefined values (in case of missing data)
  const validData = candlestickData.filter(d => 
    d.o !== null && d.o !== undefined && 
    d.h !== null && d.h !== undefined && 
    d.l !== null && d.l !== undefined && 
    d.c !== null && d.c !== undefined
  );

  const data = {
    datasets: [{
      label: `${symbol} Stock Price`,
      data: validData,
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.4)',
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day'
        },
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price (USD)'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: `${symbol} Candlestick Chart`
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const datum = context.dataset.data[context.dataIndex];
            return [
              `Date: ${context.parsed.x}`,
              `Open: $${datum.o.toFixed(2)}`,
              `High: $${datum.h.toFixed(2)}`,
              `Low: $${datum.l.toFixed(2)}`,
              `Close: $${datum.c.toFixed(2)}`
            ];
          }
        }
      }
    }
  };

  return (
    <div className="chart-wrapper">
      <Candlestick 
        data={data} 
        options={options} 
      />
    </div>
  );
};

export default StockChart;