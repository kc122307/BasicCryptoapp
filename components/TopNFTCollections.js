import { useState, useEffect } from 'react';
import { FaEthereum, FaChartLine, FaTwitter } from 'react-icons/fa';
import { BiTrendingUp, BiTrendingDown } from 'react-icons/bi';
import { motion } from 'framer-motion';

const TopNFTCollections = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [sortBy, setSortBy] = useState('rank');
  const [isHoveredId, setIsHoveredId] = useState(null);

  useEffect(() => {
    const fetchTopCollections = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            'X-API-Key': process.env.NEXT_PUBLIC_MORALIS_API_KEY
          },
        };

        const response = await fetch(
          'https://deep-index.moralis.io/api/v2.2/market-data/nfts/top-collections',
          options
        );

        if (!response.ok) {
          throw new Error('Failed to fetch NFT collections');
        }

        const data = await response.json();
        setCollections(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopCollections();
  }, []);

  const TrendingIndicator = ({ value, size = 'normal' }) => {
    const isPositive = parseFloat(value) >= 0;
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center ${isPositive ? 'text-green-400' : 'text-red-400'} 
                   ${size === 'large' ? 'text-lg' : 'text-sm'}`}
      >
        {isPositive ? 
          <BiTrendingUp className={`mr-1 ${size === 'large' ? 'text-xl' : 'text-base'}`} /> : 
          <BiTrendingDown className={`mr-1 ${size === 'large' ? 'text-xl' : 'text-base'}`} />
        }
        <span>{Math.abs(parseFloat(value)).toFixed(2)}%</span>
      </motion.div>
    );
  };

  const TimeframeSelector = () => (
    <div className="flex space-x-2 mb-6">
      {['1h', '24h', '7d', '30d'].map((timeframe) => (
        <button
          key={timeframe}
          onClick={() => setSelectedTimeframe(timeframe)}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${
            selectedTimeframe === timeframe
              ? 'bg-purple-500 text-white'
              : 'bg-gray-700/50 text-gray-400 hover:bg-gray-600/50'
          }`}
        >
          {timeframe.toUpperCase()}
        </button>
      ))}
    </div>
  );

  const SortSelector = () => (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="bg-gray-700/50 text-gray-300 rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
    >
      <option value="rank">Rank</option>
      <option value="volume">Volume</option>
      <option value="marketCap">Market Cap</option>
      <option value="floorPrice">Floor Price</option>
    </select>
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-400">Loading collections...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-900/20 backdrop-blur-lg border border-red-500/50 rounded-xl p-6"
      >
        <p className="text-red-400">Error: {error}</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <TimeframeSelector />
        <SortSelector />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 backdrop-blur-xl rounded-xl p-6 border border-purple-500/20"
        >
          <h3 className="text-gray-400 mb-2">Total Collections</h3>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-white"
          >
            {collections.length}
          </motion.p>
        </motion.div>
        <div className="bg-gradient-to-br from-blue-900/50 to-cyan-900/50 backdrop-blur-xl rounded-xl p-6 border border-blue-500/20">
          <h3 className="text-gray-400 mb-2">Highest Market Cap</h3>
          <p className="text-3xl font-bold text-white">
            ${Math.max(...collections.map(c => parseFloat(c.market_cap_usd))).toLocaleString()}
          </p>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/50 to-teal-900/50 backdrop-blur-xl rounded-xl p-6 border border-cyan-500/20">
          <h3 className="text-gray-400 mb-2">Total Volume</h3>
          <p className="text-3xl font-bold text-white">
            ${collections.reduce((acc, c) => acc + parseFloat(c.volume_usd), 0).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {collections.map((collection) => (
          <motion.div
            key={collection.collection_address}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            onHoverStart={() => setIsHoveredId(collection.collection_address)}
            onHoverEnd={() => setIsHoveredId(null)}
            className="group bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-xl 
                     rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/50 
                     transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  {collection.collection_image ? (
                    <img
                      src={collection.collection_image}
                      alt={collection.collection_title}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-gray-700/50 group-hover:border-purple-500/50 transition-all"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                      <FaEthereum className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </motion.div>
                <div>
                  <h3 className="font-bold text-xl text-white group-hover:text-purple-400 transition-colors">
                    {collection.collection_title}
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span>Rank #{collection.rank}</span>
                    {isHoveredId === collection.collection_address && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-2"
                      >
                        <FaChartLine className="text-purple-400" />
                        <FaTwitter className="text-blue-400" />
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Floor Price</p>
                  <div className="flex items-center space-x-2">
                    <FaEthereum className="text-purple-400" />
                    <span className="text-lg font-semibold text-white">
                      {parseFloat(collection.floor_price).toFixed(3)}
                    </span>
                  </div>
                  <TrendingIndicator value={collection.floor_price_24hr_percent_change} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                  <p className="text-lg font-semibold text-white">
                    ${parseFloat(collection.market_cap_usd).toLocaleString()}
                  </p>
                  <TrendingIndicator value={collection.market_cap_24hr_percent_change} />
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">24h Volume</p>
                  <p className="text-lg font-semibold text-white">
                    ${parseFloat(collection.volume_usd).toLocaleString()}
                  </p>
                  <TrendingIndicator value={collection.volume_24hr_percent_change} />
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Floor Price (USD)</p>
                  <p className="text-lg font-semibold text-white">
                    ${parseFloat(collection.floor_price_usd).toLocaleString()}
                  </p>
                  <TrendingIndicator value={collection.floor_price_usd_24hr_percent_change} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopNFTCollections; 