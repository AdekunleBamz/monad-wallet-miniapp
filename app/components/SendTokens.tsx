'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'

interface SendTokensProps {
  address: string;
  onTransactionComplete: () => void;
}

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

export function SendTokens({ address, onTransactionComplete }: SendTokensProps) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [balance, setBalance] = useState('0')
  const [status, setStatus] = useState('')

  // Fetch balance when component mounts
  const fetchBalance = async () => {
    try {
      const provider = new ethers.JsonRpcProvider(MONAD_NETWORK.rpcUrls[0])
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error('Error fetching balance:', error)
    }
  }

  // Set max amount
  const setMaxAmount = () => {
    // Leave some for gas (0.01 MON)
    const maxAmount = parseFloat(balance) - 0.01
    setAmount(maxAmount > 0 ? maxAmount.toString() : '0')
  }

  useEffect(() => {
    if (address) {
      onTransactionComplete()
    }
  }, [address, onTransactionComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!window.ethereum) {
        throw new Error('No wallet found!')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address')
      }

      // Convert amount to Wei
      const amountInWei = ethers.parseEther(amount)
      
      // Create transaction
      const tx = await signer.sendTransaction({
        to: recipient,
        value: amountInWei
      })

      console.log('Transaction sent:', tx.hash)
      await tx.wait() // Wait for transaction to be mined
      console.log('Transaction confirmed')

      // Clear form
      setAmount('')
      setRecipient('')
      
      // Refresh balance
      onTransactionComplete()
    } catch (err) {
      console.error('Transaction error:', err)
      setError(err instanceof Error ? err.message : 'Failed to send transaction')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch balance on mount
  useEffect(() => {
    fetchBalance()
  }, [address]) // Add address as dependency to refetch when it changes

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Send Tokens</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter recipient address"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Amount (MON)
          </label>
          <input
            type="text"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter amount"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-lg ${
            isLoading
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
    </div>
  )
} 