import React, { useState, useEffect } from 'react';
import './App.css';
import StockSearch from './components/StockSearch';
import StockChart from './components/StockChart';
import Watchlist from './components/Watchlist';
import AIInterpretation from './components/AIInterpretation';

function App() {
  const [selectedStock, setSelectedStock] = useState('');
  const [stockData, setStockData] = useState(null);
  const [watchlist, setWatchlist] = useState(JSON.parse(localStorage.getItem('watchlist')) || []);

  useEffect(() => {
    if (selectedStock) {
      fetchStockData(selectedStock);
    }
  }, [selectedStock]);

  const fetchStockData = async (symbol) => {
    try {
      // Using Yahoo Finance API via a CORS proxy for demonstration
      // In production, you would use a backend to avoid CORS issues and API key exposure
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1mo`);
      if (!response.ok) {
        throw new Error('Failed to fetch stock data');
      }
      const data = await response.json();
      setStockData(data);
    } catch (error) {
      console.error('Error fetching stock data:', error);
      setStockData(null);
    }
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
      localStorage.setItem('watchlist', JSON.stringify([...watchlist, symbol]));
    }
  };

  const removeFromWatchlist = (symbol) => {
    const newWatchlist = watchlist.filter(item => item !== symbol);
    setWatchlist(newWatchlist);
    localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Dashboard</h1>
      </header>
      <main>
        <div className="dashboard">
          <StockSearch 
            onStockSelect={setSelectedStock} 
            onAddToWatchlist={addToWatchlist} 
            watchlist={watchlist} 
          />
          
          <div className="chart-container">
            {selectedStock && stockData ? (
              <StockChart 
                stockData={stockData} 
                symbol={selectedStock} 
              />
            ) : (
              <div className="placeholder">Select a stock to view chart</div>
            )}
          </div>
          
          <div className="sidebar">
            <Watchlist 
              watchlist={watchlist} 
              onStockSelect={setSelectedStock} 
              onRemoveFromWatchlist={removeFromWatchlist} 
            />
            
            {selectedStock && stockData ? (
              <AIInterpretation 
                symbol={selectedStock} 
                stockData={stockData} 
              />
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;