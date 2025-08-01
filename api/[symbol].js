module.exports = async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'Symbol is required' });
  }

  const upperSymbol = symbol.toUpperCase();
  const tradingPair = `${upperSymbol}USDT`;

  try {
    const response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${tradingPair}&limit=10`);
    const data = await response.json();

    if (!data.bids || !data.asks) {
      return res.status(404).json({ error: 'Invalid trading pair or no market depth' });
    }

    const bids = data.bids.map(b => parseFloat(b[0]));
    const asks = data.asks.map(a => parseFloat(a[0]));
    const prices = [...bids, ...asks].sort((a, b) => a - b);

    const mid = Math.floor(prices.length / 2);
    const median = prices.length % 2 === 0
      ? (prices[mid - 1] + prices[mid]) / 2
      : prices[mid];

    return res.status(200).json({
      symbol: tradingPair,
      medianPrice: median,
      time: new Date().toISOString(),
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Failed to fetch price data',
      details: err.message || err
    });
  }
};
