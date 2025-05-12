'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { MONAD_NETWORK } from '../config/networks'

interface SendTokensProps {
  address: string;
  balance: string;
  onTransactionComplete: () => void;
}

export function SendTokens({ address, balance, onTransactionComplete }: SendTokensProps) {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Set max amount
  const setMaxAmount = () => {
    // Leave some for gas (0.01 MON)
    const maxAmount = parseFloat(balance) - 0.01
    setAmount(maxAmount > 0 ? maxAmount.toString() : '0')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!window.ethereum) {
        throw new Error('No wallet found!')
      }

      // Create a provider that uses our RPC URL
      const provider = new ethers.BrowserProvider(window.ethereum, {
        name: MONAD_NETWORK.chainName,
        chainId: parseInt(MONAD_NETWORK.chainId, 16)
      })

      // Verify we're on the correct network
      const network = await provider.getNetwork()
      const expectedChainId = BigInt(parseInt(MONAD_NETWORK.chainId, 16))
      if (network.chainId !== expectedChainId) {
        throw new Error('Please switch to Monad Testnet')
      }

      const signer = await provider.getSigner()
      
      // Validate recipient address
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address')
      }

      // Convert amount to Wei
      const amountInWei = ethers.parseEther(amount)
      
      // Create transaction with explicit network parameters
      const tx = await signer.sendTransaction({
        to: recipient,
        value: amountInWei,
        chainId: parseInt(MONAD_NETWORK.chainId, 16)
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
            placeholder="0x..."
            required
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
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              MAX
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
              step="0.000000000000000001"
              min="0"
              required
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !recipient || !amount}
          className={`w-full py-2 px-4 rounded-lg ${
            isLoading || !recipient || !amount
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