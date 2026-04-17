# Stock Dashboard

A React application that displays stock data from Yahoo Finance with candlestick charts, AI interpretation, and watchlist functionality.

## Features

- Search for stocks by symbol or name
- View candlestick charts for selected stocks
- Add/remove stocks to/from a watchlist
- AI-based interpretation of stock patterns and suggestions
- Responsive design

## Setup Instructions

1. **Install Node.js** (if not already installed)
   - Download from https://nodejs.org/
   - Recommended version: LTS (Long Term Support)

2. **Clone or download this repository**

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open in browser**
   - The app will automatically open at http://localhost:3000
   - If not, manually navigate to http://localhost:3000

## How It Works

### Stock Search
- Uses Yahoo Finance API to search for stocks
- Displays search results with options to view or add to watchlist

### Stock Chart
- Displays candlestick chart using Chart.js with the financial chart plugin
- Shows 1 month of daily data by default
- Interactive tooltips show OHLC values

### Watchlist
- Stores watchlist in localStorage so it persists between sessions
- Click on a symbol in the watchlist to view its chart
- Remove symbols from watchlist with the remove button

### AI Interpretation
- Provides basic trend analysis based on recent price action
- Shows current price, 5-day change, trend direction, suggested action, and confidence level
- Includes simple pattern recognition (consecutive higher/lower closes)
- **Note**: This is a simulated interpretation for demonstration purposes only and should not be considered financial advice

## Technologies Used

- React 18
- Chart.js with react-chartjs-2 and chartjs-chart-financial
- Axios for HTTP requests
- Yahoo Finance API (public endpoints)
- LocalStorage for watchlist persistence

## Project Structure

```
src/
├── components/
│   ├── StockSearch.js      # Search for stocks and add to watchlist
│   ├── StockChart.js       # Display candlestick chart
│   ├── Watchlist.js        # Manage watchlist
│   └── AIInterpretation.js # Show AI-based analysis
├── App.js                  # Main application component
├── index.js                # Entry point
├── index.css               # Global styles
└── App.css                 # App-specific styles
```

## Limitations and Notes

1. **API Usage**: This application uses public Yahoo Finance endpoints without an API key. For production use or high-frequency requests, consider using a proper API with rate limiting and authentication.

2. **CORS**: The application makes direct requests to Yahoo Finance. In some environments, CORS restrictions may block these requests. In a production setting, you would typically use a backend proxy to handle API requests.

3. **AI Interpretation**: The AI interpretation is intentionally simplistic and for demonstration only. It does not constitute real financial analysis or advice.

4. **Data Frequency**: The chart shows daily data for the past month. Different intervals and ranges could be implemented by modifying the API parameters.

## Future Enhancements

- Add more time intervals (intraday, weekly, monthly)
- Implement technical indicators (moving averages, RSI, MACD)
- Improve AI interpretation with more sophisticated pattern recognition
- Add user authentication and saved watchlists
- Allow customization of chart appearance
- Add news and fundamentals data
- Implement real-time data updates

## License

This project is open source and available under the MIT License.