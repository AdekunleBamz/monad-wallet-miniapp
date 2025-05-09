'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { WalletBalance } from './components/WalletBalance'
import { SendTokens } from './components/SendTokens'
import { ConnectWallet } from './components/ConnectWallet'

// Monad network configuration
const MONAD_NETWORK = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://monad-testnet.drpc.org'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com']
}

export default function Home() {
  const [address, setAddress] = useState<string>('')
  const [balance, setBalance] = useState<string>('0')
  const [isConnected, setIsConnected] = useState(false)
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(false)

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      setIsCorrectNetwork(chainId === MONAD_NETWORK.chainId)
    }
  }

  const switchToMonadNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: MONAD_NETWORK.chainId }],
      })
      setIsCorrectNetwork(true)
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [MONAD_NETWORK],
          })
          setIsCorrectNetwork(true)
        } catch (addError) {
          console.error('Error adding Monad network:', addError)
        }
      }
    }
  }

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        setAddress(accounts[0])
        setIsConnected(true)
        await checkNetwork()
        if (accounts[0]) fetchBalance(accounts[0])
      } else {
        alert('Please install a Web3 wallet like MetaMask!')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  const disconnectWallet = () => {
    setAddress('')
    setBalance('0')
    setIsConnected(false)
    setIsCorrectNetwork(false)
  }

  const fetchBalance = async (walletAddress: string) => {
    try {
      const provider = new ethers.JsonRpcProvider(MONAD_NETWORK.rpcUrls[0])
      const balance = await provider.getBalance(walletAddress)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  // Check wallet connection on page load
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (accounts.length > 0) {
          setAddress(accounts[0])
          setIsConnected(true)
          await checkNetwork()
          fetchBalance(accounts[0])
        }
      }
    }
    checkConnection()
  }, [])

  // Listen for network changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', async (chainId: string) => {
        setIsCorrectNetwork(chainId === MONAD_NETWORK.chainId)
        if (address) fetchBalance(address)
      })

      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0])
          fetchBalance(accounts[0])
        } else {
          disconnectWallet()
        }
      })
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeListener('chainChanged', () => {})
        window.ethereum.removeListener('accountsChanged', () => {})
      }
    }
  }, [address])

  // Function to refresh balance
  const refreshBalance = () => {
    if (address) {
      fetchBalance(address)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Monad Wallet Mini App
        </h1>
        
        {!isConnected ? (
          <ConnectWallet onConnect={connectWallet} />
        ) : !isCorrectNetwork ? (
          <div className="text-center">
            <p className="text-red-500 mb-4">Please switch to Monad Testnet</p>
            <button
              onClick={switchToMonadNetwork}
              className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Switch to Monad Testnet
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="flex justify-end">
              <button
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Disconnect Wallet
              </button>
            </div>
            <WalletBalance address={address} balance={balance} />
            <SendTokens address={address} onTransactionComplete={refreshBalance} />
          </div>
        )}
      </div>
    </main>
  )
} 