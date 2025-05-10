'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { WalletBalance } from './components/WalletBalance'
import { SendTokens } from './components/SendTokens'
import { ConnectWallet } from './components/ConnectWallet'
import { SwapTokens } from './components/SwapTokens'
import { MONAD_NETWORK } from './config/networks'

// Wapcast Mini App initialization
declare global {
  interface Window {
    wapcast?: {
      ready: () => void;
      isReady: boolean;
    };
    forecast?: {
      ready: () => void;
      isReady: boolean;
    };
  }
}

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)
  const [isWapcastReady, setIsWapcastReady] = useState(false)

  // Initialize Wapcast Mini App
  useEffect(() => {
    const initializeWapcast = () => {
      // Check if we're in the Wapcast Mini App environment
      if (window.wapcast) {
        console.log('Wapcast Mini App environment detected')
        // Signal that the app is ready
        window.wapcast.ready()
        setIsWapcastReady(true)
      } else if (window.forecast) {
        // Fallback to Forecast for backward compatibility
        console.log('Forecast Mini App environment detected')
        window.forecast.ready()
        setIsWapcastReady(true)
      } else {
        console.log('Running in standalone mode')
        setIsWapcastReady(true)
      }
    }

    // Wait for the window object to be available
    if (typeof window !== 'undefined') {
      initializeWapcast()
    }
  }, [])

  const fetchBalance = async (walletAddress: string) => {
    console.log('Fetching balance for address:', walletAddress)
    try {
      // Create provider with explicit network configuration
      const provider = new ethers.JsonRpcProvider(MONAD_NETWORK.rpcUrls[0], {
        name: MONAD_NETWORK.chainName,
        chainId: parseInt(MONAD_NETWORK.chainId, 16)
      })

      console.log('Provider created with RPC URL:', MONAD_NETWORK.rpcUrls[0])
      
      // Get network info to verify connection
      const network = await provider.getNetwork()
      console.log('Connected to network:', {
        name: network.name,
        chainId: network.chainId.toString(),
        expectedChainId: MONAD_NETWORK.chainId
      })

      // Fetch balance
      console.log('Requesting balance...')
      const balance = await provider.getBalance(walletAddress)
      console.log('Raw balance:', balance.toString())
      
      const formattedBalance = ethers.formatEther(balance)
      console.log('Formatted balance:', formattedBalance)
      
      setBalance(formattedBalance)
    } catch (error) {
      console.error('Detailed balance fetch error:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      // Set balance to 0 on error
      setBalance('0')
    }
  }

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        console.log('Checking network...')
        const chainId = await window.ethereum.request({ method: 'eth_chainId' })
        console.log('Current chainId:', chainId, 'Expected:', MONAD_NETWORK.chainId)
        
        // Compare chainIds after converting to lowercase and removing '0x' prefix
        const normalizedCurrentChainId = chainId.toLowerCase().replace('0x', '')
        const normalizedExpectedChainId = MONAD_NETWORK.chainId.toLowerCase().replace('0x', '')
        console.log('Normalized chainIds:', { current: normalizedCurrentChainId, expected: normalizedExpectedChainId })
        
        const isCorrect = normalizedCurrentChainId === normalizedExpectedChainId
        console.log('Is correct network:', isCorrect)
        
        setIsCorrectNetwork(isCorrect)
        if (isCorrect && address) {
          console.log('Network is correct, fetching balance...')
          await fetchBalance(address)
        } else {
          console.log('Network is incorrect or no address available')
        }
      } catch (error) {
        console.error('Error checking network:', error)
        setIsCorrectNetwork(false)
      }
    } else {
      console.log('No ethereum provider available')
    }
  }

  const switchToMonadNetwork = async () => {
    console.log('Attempting to switch network...')
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      throw new Error('No ethereum provider found')
    }
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_NETWORK.chainId }],
      })
      console.log('Network switch successful')
      setIsCorrectNetwork(true)
    } catch (switchError: any) {
      console.error('Network switch error:', switchError)
      if (switchError.code === 4902) {
        console.log('Network not found, attempting to add...')
        try {
          if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
            throw new Error('No ethereum provider found')
          }
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          })
          console.log('Network added successfully')
          setIsCorrectNetwork(true)
        } catch (addError) {
          console.error('Error adding Monad network:', addError)
          throw addError
        }
      } else {
        throw switchError
      }
    }
  }

  const connectWallet = async () => {
    console.log('Starting wallet connection...')
    try {
      if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
        console.error('No ethereum provider found')
        throw new Error('Please install a Web3 wallet!')
      }

      // Reset state first
      setAddress('')
      setBalance('0')
      setIsConnected(false)
      setIsCorrectNetwork(false)

      // Request account access
      console.log('Requesting account access...')
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
        params: [],
      })
      console.log('Accounts received:', accounts)

      if (!accounts || accounts.length === 0) {
        console.error('No accounts found')
        throw new Error('No accounts found. Please connect your wallet.')
      }

      console.log('Setting address and connection state...')
      setAddress(accounts[0])
      setIsConnected(true)
      
      // Check and switch network if needed
      console.log('Checking network...')
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      console.log('Current chainId:', chainId, 'Expected:', MONAD_NETWORK.chainId)
      
      if (chainId !== MONAD_NETWORK.chainId) {
        console.log('Switching to Monad network...')
        await switchToMonadNetwork()
      } else {
        console.log('Already on correct network')
        setIsCorrectNetwork(true)
      }

      // Fetch initial balance
      console.log('Fetching initial balance...')
      await fetchBalance(accounts[0])
      console.log('Wallet connection complete')
    } catch (error) {
      console.error('Detailed wallet connection error:', error)
      if (error instanceof Error) {
        console.error('Error name:', error.name)
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      alert(error instanceof Error ? error.message : 'Failed to connect wallet')
      setIsConnected(false)
      setAddress('')
    }
  }

  const disconnectWallet = () => {
    console.log('Disconnecting wallet...')
    // Reset all state
    setAddress('')
    setBalance('0')
    setIsConnected(false)
    setIsCorrectNetwork(false)
  }

  // Check wallet connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      try {
        if (typeof window.ethereum === 'undefined') {
          console.log('No ethereum provider available')
          return
        }

        // Only check if we're already connected, don't request accounts
        const isConnected = window.ethereum.isConnected?.() || false
        if (!isConnected) {
          console.log('Wallet not connected')
          return
        }

        // If connected, get the current account
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        console.log('Initial accounts check:', accounts)

        if (accounts && accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          
          // Check network
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          console.log('Initial network check:', chainId)
          setIsCorrectNetwork(chainId === MONAD_NETWORK.chainId)
          
          // Fetch balance
          await fetchBalance(accounts[0])
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error)
        setIsConnected(false)
        setAddress('')
      }
    }
    checkConnection()
  }, [])

  // Listen for network changes
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.ethereum === 'undefined') {
      console.log('Window or ethereum provider not available')
      return
    }

    const handleChainChanged = async (chainId: string) => {
      console.log('Chain changed event received:', chainId)
      const normalizedCurrentChainId = chainId.toLowerCase().replace('0x', '')
      const normalizedExpectedChainId = MONAD_NETWORK.chainId.toLowerCase().replace('0x', '')
      const isCorrect = normalizedCurrentChainId === normalizedExpectedChainId
      
      console.log('Chain change details:', {
        current: normalizedCurrentChainId,
        expected: normalizedExpectedChainId,
        isCorrect
      })
      
      setIsCorrectNetwork(isCorrect)
      if (isCorrect && address) {
        console.log('Network is correct after change, fetching balance...')
        await fetchBalance(address)
      }
    }

    const handleAccountsChanged = async (accounts: string[]) => {
      console.log('Accounts changed event received:', accounts)
      if (accounts.length > 0) {
        console.log('Setting new address:', accounts[0])
        setAddress(accounts[0])
        await checkNetwork()
      } else {
        console.log('No accounts available, disconnecting...')
        disconnectWallet()
      }
    }

    console.log('Setting up network listeners...')
    const ethereum = window.ethereum
    ethereum.on('chainChanged', handleChainChanged)
    ethereum.on('accountsChanged', handleAccountsChanged)

    // Initial network check
    console.log('Performing initial network check...')
    checkNetwork()

    return () => {
      console.log('Cleaning up network listeners...')
      ethereum.removeListener('chainChanged', handleChainChanged)
      ethereum.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [address])

  // Function to refresh balance
  const refreshBalance = () => {
    if (address) {
      fetchBalance(address)
    }
  }

  // Show loading state while initializing
  if (!isWapcastReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Initializing...</p>
        </div>
      </main>
    )
  }

  // If in Forecast/Wapcast environment, show a debug message
  if (typeof window !== 'undefined' && window.forecast && isWapcastReady) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <p className="text-lg">Hello Wapcast (Forecast Mini App detected)</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center mb-8">Monad Wallet Mini App</h1>
        
        {!isConnected ? (
          <ConnectWallet onConnect={connectWallet} />
        ) : (
          <div className="space-y-6">
            <WalletBalance 
              address={address} 
              balance={balance} 
              onDisconnect={disconnectWallet}
              onRefresh={refreshBalance}
            />
            
            {!isCorrectNetwork && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-center">
                <p className="text-yellow-200">Please switch to Monad Network</p>
                <button
                  onClick={switchToMonadNetwork}
                  className="mt-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
                >
                  Switch Network
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SendTokens 
                address={address} 
                onTransactionComplete={refreshBalance}
              />
              <SwapTokens 
                address={address}
                onTransactionComplete={refreshBalance}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  )
} 