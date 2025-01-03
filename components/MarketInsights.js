import { useState, useEffect } from 'react';
import Moralis from 'moralis';

export default function MarketInsights() {
  const [topByMarketCap, setTopByMarketCap] = useState([]);
  const [topByVolume, setTopByVolume] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        await Moralis.start({
          apiKey: process.env.NEXT_PUBLIC_MORALIS_API_KEY
        });

        const [marketCapData, volumeData] = await Promise.all([
          Moralis.EvmApi.marketData.getTopCryptoCurrenciesByMarketCap({}),
          Moralis.EvmApi.marketData.getTopCryptoCurrenciesByTradingVolume({})
        ]);

        setTopByMarketCap(marketCapData.raw.slice(0, 5));
        setTopByVolume(volumeData.raw.slice(0, 5));
      } catch (err) {
        setError("Failed to fetch market data");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMarketData();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price);
  };

  const formatPercent = (percent) => {
    const num = parseFloat(percent);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Top by Market Cap</h3>
        <div className="space-y-4">
          {topByMarketCap.map((crypto) => (
            <div key={crypto.symbol} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={crypto.logo} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <h3 className="font-medium text-gray-900">{crypto.name}</h3>
                    <p className="text-sm text-gray-500">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(crypto.usd_price)}</p>
                  <p className={`text-sm ${parseFloat(crypto.usd_price_24hr_percent_change) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(crypto.usd_price_24hr_percent_change)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Top by Trading Volume</h3>
        <div className="space-y-4">
          {topByVolume.map((crypto) => (
            <div key={crypto.symbol} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img src={crypto.logo} alt={crypto.name} className="w-8 h-8 rounded-full" />
                  <div>
                    <h3 className="font-medium text-gray-900">{crypto.name}</h3>
                    <p className="text-sm text-gray-500">{crypto.symbol}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatPrice(crypto.total_volume)}</p>
                  <p className="text-sm text-gray-500">24h Volume</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 