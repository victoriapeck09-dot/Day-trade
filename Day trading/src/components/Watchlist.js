import React from 'react';
import './Watchlist.css';

const Watchlist = ({ watchlist, onStockSelect, onRemoveFromWatchlist }) => {
  return (
    <div className="watchlist">
      <h3>Watchlist</h3>
      {watchlist.length === 0 ? (
        <p className="empty">Your watchlist is empty. Search for stocks to add.</p>
      ) : (
        <ul className="watchlist-items">
          {watchlist.map((symbol, index) => (
            <li key={symbol} className="watchlist-item">
              <span className="symbol">{symbol}</span>
              <button
                onClick={() => onStockSelect(symbol)}
                className="view-button"
              >
                View
              </button>
              <button
                onClick={() => onRemoveFromWatchlist(symbol)}
                className="remove-button"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist;