'use client'

import { useState } from 'react'
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
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState('0')

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!recipient || !amount) return

    setIsLoading(true)
    try {
      // Use the browser provider for signing transactions
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      
      const tx = await signer.sendTransaction({
        to: recipient,
        value: ethers.parseEther(amount)
      })

      console.log('Transaction sent:', tx.hash)
      await tx.wait()
      alert('Transaction sent successfully!')
      
      setRecipient('')
      setAmount('')
      fetchBalance() // Refresh local balance
      onTransactionComplete() // Notify parent to refresh main balance
    } catch (error: any) {
      console.error('Error sending transaction:', error)
      alert(error.message || 'Error sending transaction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch balance on mount
  useState(() => {
    fetchBalance()
  }, [])

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Send Tokens</h2>
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="0x..."
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">
              Amount (MON)
            </label>
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-sm text-primary hover:text-secondary"
            >
              MAX
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="0.0"
              step="0.000000000000000001"
              min="0"
            />
            <div className="absolute right-3 top-2 text-sm text-gray-400">
              Balance: {balance} MON
            </div>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          className="w-full bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
} 