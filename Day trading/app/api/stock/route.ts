import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { symbol } = req.query

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' })
  }

  try {
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=5m&range=1d`
    const response = await fetch(yahooUrl)
    const data = await response.json()
    
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate')
    res.status(200).json(data)
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(500).json({ error: 'Failed to fetch stock data' })
  }
}