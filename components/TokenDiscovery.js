import { useState, useEffect } from 'react';

const DEMO_TOKENS = [
  {
    token_address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    token_name: "Wrapped Ether",
    token_symbol: "WETH",
    price_usd: "2250.52",
    market_cap: "12500000000",
    price_change_24h: 2.5,
    volume_24h: "1500000000"
  },
  {
    token_address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    token_name: "Wrapped Bitcoin",
    token_symbol: "WBTC",
    price_usd: "42150.80",
    market_cap: "8900000000",
    price_change_24h: 1.8,
    volume_24h: "950000000"
  },
  {
    token_address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    token_name: "Chainlink",
    token_symbol: "LINK",
    price_usd: "15.20",
    market_cap: "7200000000",
    price_change_24h: 3.2,
    volume_24h: "420000000"
  },
  {
    token_address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    token_name: "Uniswap",
    token_symbol: "UNI",
    price_usd: "6.80",
    market_cap: "4800000000",
    price_change_24h: -1.5,
    volume_24h: "280000000"
  },
  {
    token_address: "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
    token_name: "Aave",
    token_symbol: "AAVE",
    price_usd: "98.50",
    market_cap: "1400000000",
    price_change_24h: -0.8,
    volume_24h: "150000000"
  }
];

const TRENDING_TOKENS = [
  {
    token_address: "0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce",
    token_name: "SHIBA INU",
    token_symbol: "SHIB",
    price_usd: "0.00000850",
    market_cap: "5100000000",
    price_change_24h: 12.5,
    volume_24h: "250000000"
  },
  {
    token_address: "0x6b3595068778dd592e39a122f4f5a5cf09c90fe2",
    token_name: "Sushi",
    token_symbol: "SUSHI",
    price_usd: "1.45",
    market_cap: "380000000",
    price_change_24h: 8.2,
    volume_24h: "85000000"
  },
  {
    token_address: "0x4d224452801aced8b2f0aebe155379bb5d594381",
    token_name: "ApeCoin",
    token_symbol: "APE",
    price_usd: "1.98",
    market_cap: "720000000",
    price_change_24h: 15.4,
    volume_24h: "180000000"
  },
  {
    token_address: "0x15d4c048f83bd7e37d49ea4c83a07267ec4203da",
    token_name: "Gala",
    token_symbol: "GALA",
    price_usd: "0.025",
    market_cap: "210000000",
    price_change_24h: 18.7,
    volume_24h: "95000000"
  },
  {
    token_address: "0x0f5d2fb29fb7d3cfee444a200298f468908cc942",
    token_name: "Decentraland",
    token_symbol: "MANA",
    price_usd: "0.42",
    market_cap: "890000000",
    price_change_24h: 9.3,
    volume_24h: "120000000"
  }
];

export default function TokenDiscovery() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const formatUSD = (value) => {
    if (!value) return '$0.00';
    const num = parseFloat(value);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: num >= 1000000 ? 'compact' : 'standard',
      minimumFractionDigits: num >= 1 ? 2 : 8,
      maximumFractionDigits: num >= 1 ? 2 : 8
    }).format(num);
  };

  const formatChange = (value) => {
    if (!value) return '0%';
    const num = parseFloat(value);
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  };

  const TokenCard = ({ token }) => (
    <div className="bg-gray-700 bg-opacity-40 p-4 rounded-lg shadow-sm border border-gray-600 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src={`https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/${token.token_address}/logo.png`}
            alt={token.token_name}
            className="w-8 h-8 rounded-full bg-gray-600"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = `https://via.placeholder.com/32/666666/FFFFFF?text=${token.token_symbol.charAt(0)}`;
            }}
          />
          <div>
            <h3 className="font-medium text-white">{token.token_name}</h3>
            <p className="text-sm text-gray-300">{token.token_symbol}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-medium text-white">{formatUSD(token.price_usd)}</p>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-300">24h:</span>
            <span className={`text-sm ${parseFloat(token.price_change_24h) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatChange(token.price_change_24h)}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="text-gray-300">
          Market Cap: <span className="text-white">{formatUSD(token.market_cap)}</span>
        </div>
        <div className="text-gray-300">
          24h Volume: <span className="text-white">{formatUSD(token.volume_24h)}</span>
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-6">
        {[...Array(2)].map((_, sectionIndex) => (
          <div key={sectionIndex}>
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 rounded">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Top Market Cap Tokens
        </h2>
        <div className="space-y-4">
          {DEMO_TOKENS.map((token) => (
            <TokenCard key={token.token_address} token={token} />
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Trending Tokens
        </h2>
        <div className="space-y-4">
          {TRENDING_TOKENS.map((token) => (
            <TokenCard key={token.token_address} token={token} />
          ))}
        </div>
      </div>
    </div>
  );
} 