import { useState, useEffect } from 'react';
import { useEvmNativeBalance } from "@moralisweb3/next";
import { ethers } from 'ethers';
import MarketInsights from '../components/MarketInsights';
import TokenDiscovery from '../components/TokenDiscovery';
import TokenSwap from '../components/TokenSwap';
import TopNFTCollections from '../components/TopNFTCollections';


export default function Home() {
  const [address, setAddress] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [showSendForm, setShowSendForm] = useState(false);

  const { data: nativeBalance } = useEvmNativeBalance({ 
    address,
    chain: "0xaa36a7" // Sepolia chain ID
  });

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        // Request account access
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // Switch to Sepolia network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }], // Sepolia chain ID
          });
        } catch (switchError) {
          // If Sepolia network is not added, add it
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: '0xaa36a7',
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'SepoliaETH',
                    symbol: 'SepoliaETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io']
                }]
              });
            } catch (addError) {
              setError('Failed to add Sepolia network');
              return;
            }
          }
        }
        
        setAddress(accounts[0]);
        setIsConnected(true);
        setError("");
      } catch (err) {
        setError('Failed to connect wallet');
        console.error(err);
      }
    } else {
      setError('Please install MetaMask!');
    }
  };

  const disconnectWallet = () => {
    setAddress("");
    setIsConnected(false);
    setShowSendForm(false);
  };

  const handleSendCrypto = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!ethers.utils.isAddress(recipientAddress)) {
        throw new Error('Invalid recipient address');
      }

      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      
      // Convert amount to Wei
      const amountWei = ethers.utils.parseEther(amount);
      
      // Create transaction object
      const tx = {
        to: recipientAddress,
        value: amountWei
      };

      // Send transaction
      const transaction = await signer.sendTransaction(tx);
      
      // Wait for transaction to be mined
      await transaction.wait();

      setSuccess(`Successfully sent ${amount} ETH to ${recipientAddress}`);
      setAmount("");
      setRecipientAddress("");
      setShowSendForm(false);
    } catch (err) {
      setError(err.message || 'Failed to send transaction');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
        } else {
          setAddress("");
          setIsConnected(false);
          setShowSendForm(false);
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500">
            Crypto Exchange Platform
          </h1>
          <p className="mt-2 text-gray-400">Swap, Trade, and Track Cryptocurrencies</p>
        </div>

        {/* Wallet and Market Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Wallet Section */}
          <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 backdrop-blur-lg bg-opacity-50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                Wallet Dashboard
              </h2>
              {isConnected && (
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-red-500 bg-opacity-20 text-red-400 rounded-lg hover:bg-opacity-30 transition-all duration-200 border border-red-500"
                >
                  Disconnect
                </button>
              )}
            </div>

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

            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
              >
                Connect MetaMask
              </button>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-700 bg-opacity-40 rounded-lg border border-gray-600">
                    <h3 className="text-sm font-medium text-gray-400">Connected Network</h3>
                    <p className="text-lg font-medium text-purple-400">Sepolia Testnet</p>
                  </div>
                  <div className="p-4 bg-gray-700 bg-opacity-40 rounded-lg border border-gray-600">
                    <h3 className="text-sm font-medium text-gray-400">Wallet Balance</h3>
                    <p className="text-lg font-medium text-blue-400">
                      {nativeBalance ? `${nativeBalance.balance.ether} ETH` : '0.0000 ETH'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-700 bg-opacity-40 rounded-lg border border-gray-600">
                  <h3 className="text-sm font-medium text-gray-400">Wallet Address</h3>
                  <p className="text-lg font-medium text-gray-300 break-all">{address}</p>
                </div>

                {!showSendForm ? (
                  <button
                    onClick={() => setShowSendForm(true)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium"
                  >
                    Send Crypto
                  </button>
                ) : (
                  <form onSubmit={handleSendCrypto} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Recipient Address
                      </label>
                      <input
                        type="text"
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full bg-gray-700 bg-opacity-40 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Amount (ETH)
                      </label>
                      <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.0"
                        step="0.0001"
                        min="0"
                        className="w-full bg-gray-700 bg-opacity-40 border border-gray-600 rounded-lg px-4 py-2 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Sending...' : 'Send'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowSendForm(false);
                          setRecipientAddress("");
                          setAmount("");
                        }}
                        className="flex-1 py-3 px-4 bg-gray-600 bg-opacity-40 text-gray-300 rounded-lg hover:bg-opacity-60 transition-all duration-200 font-medium border border-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Market Insights Section */}
          <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 backdrop-blur-lg bg-opacity-50">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
              Market Insights
            </h2>
            <MarketInsights />
          </div>
        </div>

        {/* Token Swap Section */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 backdrop-blur-lg bg-opacity-50">
          <TokenSwap address={address} isConnected={isConnected} />
        </div>

        {/* Token Discovery Section */}
        <div className="bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-700 backdrop-blur-lg bg-opacity-50">
          <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-6">
            Token Discovery
          </h2>
          <TokenDiscovery />
        </div>

        {/* Top NFT Collections Section */}
        <div className="bg-gray-800/50 backdrop-blur-xl shadow-xl rounded-xl p-6 border border-gray-700">
          <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-8">
            Top NFT Collections
          </h2>
          <TopNFTCollections />
        </div>
      </div>
    </div>
  );
} 