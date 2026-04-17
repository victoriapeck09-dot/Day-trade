import React, { useState } from 'react';
import './StockSearch.css';

const StockSearch = ({ onStockSelect, onAddToWatchlist, watchlist }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchStocks = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      // Using Yahoo Finance API to search for stocks
      // Note: This is a simplified example. In production, you'd want to handle CORS and API limits
      const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(term)}&quotesCount=10`);
      if (!response.ok) {
        throw new Error('Failed to search stocks');
      }
      const data = await response.json();
      setSearchResults(data.quotes || []);
    } catch (error) {
      console.error('Error searching stocks:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    searchStocks(searchTerm);
  };

  return (
    <div className="stock-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search for stocks (e.g., AAPL, MSFT)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button type="submit" className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {searchResults.length > 0 && (
        <div className="search-results">
          <h3>Search Results</h3>
          <ul className="results-list">
            {searchResults.map((result) => (
              <li key={result.symbol} className="result-item">
                <div className="result-info">
                  <span className="symbol">{result.symbol}</span>
                  <span className="name">{result.shortname || result.longname || 'N/A'}</span>
                </div>
                <div className="result-actions">
                  <button
                    onClick={() => {
                      onStockSelect(result.symbol);
                      setSearchTerm(result.symbol);
                      setSearchResults([]);
                    }}
                    className="view-button"
                  >
                    View
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddToWatchlist(result.symbol);
                    }}
                    className={watchlist.includes(result.symbol) ? 'watched-button' : 'watch-button'}
                  >
                    {watchlist.includes(result.symbol) ? 'Watched' : 'Watch'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default StockSearch;