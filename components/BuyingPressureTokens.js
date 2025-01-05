import { useState, useEffect } from 'react';
import { FaEthereum } from 'react-icons/fa';
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { RiPulseLine } from 'react-icons/ri';

const BuyingPressureTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBuyingPressureTokens = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY
          },
        };

        console.log('Fetching buying pressure with API key:', process.env.NEXT_PUBLIC_MORALIS_API_KEY?.substring(0, 10) + '...');

        const response = await fetch(
          'https://deep-index.moralis.io/api/v2.2/discovery/tokens/buying-pressure?chain=eth&one_month_net_volume_change_usd=1000000&min_market_cap=100000000&twitter_followers=10000&one_month_volume_change_usd=10000&security_score=70&one_month_price_percent_change_usd=1',
          options
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Full error response:', errorText);
          throw new Error(`API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        console.log('Buying pressure data:', data);
        setTokens(data);
      } catch (err) {
        console.error('Detailed error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyingPressureTokens();
  }, []);

  const ChangeIndicator = ({ value, prefix = '' }) => {
    const isPositive = parseFloat(value) >= 0;
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <BiTrendingUp className="mr-1" /> : <BiTrendingDown className="mr-1" />}
        <span>{prefix}{Math.abs(parseFloat(value)).toLocaleString()}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading tokens with buying pressure...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 backdrop-blur-lg border border-red-500/50 rounded-xl p-6">
        <p className="text-red-400">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-900/50 to-emerald-900/50 backdrop-blur-xl rounded-xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-400">Total Tokens</h3>
            <RiPulseLine className="text-green-400 text-xl animate-pulse" />
          </div>
          <p className="text-3xl font-bold text-white mt-2">{tokens.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20">
          <h3 className="text-gray-400">Avg Security Score</h3>
          <p className="text-3xl font-bold text-white mt-2">
            {(tokens.reduce((acc, token) => acc + token.security_score, 0) / tokens.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-gray-400">Total Market Cap</h3>
          <p className="text-3xl font-bold text-white mt-2">
            ${(tokens.reduce((acc, token) => acc + token.market_cap, 0) / 1e9).toFixed(2)}B
          </p>
        </div>
      </div>

      {/* Tokens Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {tokens.map((token) => (
          <div key={token.token_address} 
               className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl 
                        rounded-xl p-6 border border-gray-700/50 hover:border-green-500/50 
                        transition-all duration-300 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                {token.token_logo ? (
                  <img
                    src={token.token_logo}
                    alt={token.token_name}
                    className="w-12 h-12 rounded-full border-2 border-gray-700/50 group-hover:border-green-500/50 transition-all"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
                    <FaEthereum className="w-6 h-6 text-green-400" />
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-green-400 transition-colors">
                    {token.token_name}
                  </h3>
                  <p className="text-gray-400">{token.token_symbol}</p>
                </div>
              </div>
              <div className="bg-green-400/10 px-3 py-1 rounded-full">
                <p className="text-green-400 text-sm font-medium">Score: {token.security_score}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-sm text-gray-400 mb-1">Price USD</p>
                <p className="text-lg font-semibold text-white">${parseFloat(token.price_usd).toFixed(2)}</p>
                <ChangeIndicator value={token.price_percent_change_usd['1M']} prefix="%" />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                <p className="text-lg font-semibold text-white">
                  ${(token.market_cap / 1e6).toFixed(2)}M
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">30D Volume Change</p>
                <ChangeIndicator value={token.volume_change_usd['1M']} prefix="$" />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Net Volume Change</p>
                <ChangeIndicator value={token.net_volume_change_usd['1M']} prefix="$" />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Holders Change (30D)</p>
                <ChangeIndicator value={token.holders_change['1M']} />
              </div>

              <div>
                <p className="text-sm text-gray-400 mb-1">Twitter Followers</p>
                <p className="text-lg font-semibold text-white">
                  {token.twitter_followers.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyingPressureTokens; 