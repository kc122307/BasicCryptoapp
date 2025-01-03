import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

const TOKENS = [
  {
    address: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
    name: "Wrapped Ether",
    symbol: "WETH",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png"
  },
  {
    address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    decimals: 8,
    logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png"
  },
  {
    address: "0x514910771af9ca656af840dff83e8264ecf986ca",
    name: "Chainlink",
    symbol: "LINK",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo.png"
  },
  {
    address: "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
    name: "Uniswap",
    symbol: "UNI",
    decimals: 18,
    logo: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo.png"
  }
];

export default function TokenSwap({ address, isConnected }) {
  const [fromToken, setFromToken] = useState(TOKENS[0]);
  const [toToken, setToToken] = useState(TOKENS[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mock exchange rate calculation
  const calculateExchangeRate = (from, to, amount) => {
    if (!amount) return "0";
    const rates = {
      'WETH': 1,
      'WBTC': 0.0615,
      'LINK': 150,
      'UNI': 350
    };
    const fromRate = rates[from.symbol];
    const toRate = rates[to.symbol];
    return ((amount * fromRate) / toRate).toFixed(6);
  };

  const handleFromAmountChange = (value) => {
    setFromAmount(value);
    setToAmount(calculateExchangeRate(fromToken, toToken, value));
  };

  const handleToAmountChange = (value) => {
    setToAmount(value);
    setFromAmount(calculateExchangeRate(toToken, fromToken, value));
  };

  const switchTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleSwap = async () => {
    if (!isConnected) {
      setError("Please connect your wallet first");
      return;
    }

    if (!fromAmount || !toAmount) {
      setError("Please enter an amount");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Here you would typically:
      // 1. Check allowance
      // 2. Approve tokens if needed
      // 3. Execute swap through DEX

      // For demo, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate transaction
      setSuccess(`Successfully swapped ${fromAmount} ${fromToken.symbol} for ${toAmount} ${toToken.symbol}`);
      setFromAmount("");
      setToAmount("");
    } catch (err) {
      setError(err.message || "Failed to execute swap");
    } finally {
      setLoading(false);
    }
  };

  const TokenSelect = ({ value, onChange, tokens }) => (
    <div className="relative">
      <select
        value={value.address}
        onChange={(e) => onChange(tokens.find(t => t.address === e.target.value))}
        className="appearance-none w-full bg-gray-700 bg-opacity-40 border border-gray-600 rounded-lg pl-3 pr-10 py-2 text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
      >
        {tokens.map((token) => (
          <option key={token.address} value={token.address}>
            {token.symbol}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
        <img
          src={value.logo}
          alt={value.symbol}
          className="w-6 h-6 rounded-full"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://via.placeholder.com/24/CCCCCC/000000?text=${value.symbol.charAt(0)}`;
          }}
        />
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
        Swap Tokens
      </h2>

      {error && (
        <div className="bg-red-900 bg-opacity-20 border-l-4 border-red-500 p-4 mb-4 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-900 bg-opacity-20 border-l-4 border-green-500 p-4 mb-4 rounded-lg">
          <p className="text-green-400">{success}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-gray-700 bg-opacity-40 rounded-xl p-6 border border-gray-600">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">From</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <input
                    type="number"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <TokenSelect value={fromToken} onChange={setFromToken} tokens={TOKENS} />
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={switchTokens}
                className="p-2 rounded-full hover:bg-gray-600 hover:bg-opacity-40 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">To</label>
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <input
                    type="number"
                    value={toAmount}
                    onChange={(e) => handleToAmountChange(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-gray-800 bg-opacity-40 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <TokenSelect value={toToken} onChange={setToToken} tokens={TOKENS.filter(t => t.address !== fromToken.address)} />
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={loading || !isConnected}
          className={`w-full py-4 px-6 rounded-xl font-medium transition-all duration-200 ${
            loading || !isConnected
              ? 'bg-gray-600 bg-opacity-40 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Swapping...
            </div>
          ) : !isConnected ? (
            'Connect Wallet to Swap'
          ) : (
            'Swap Tokens'
          )}
        </button>

        {fromAmount && toAmount && (
          <div className="bg-gray-700 bg-opacity-40 rounded-lg p-4 border border-gray-600">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Exchange Rate</span>
              <span className="text-gray-300">
                1 {fromToken.symbol} = {calculateExchangeRate(fromToken, toToken, 1)} {toToken.symbol}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 