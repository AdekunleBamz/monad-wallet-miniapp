'use client'

import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { MONAD_NETWORK } from '../config/networks'

// Pandaria DEX Router Contract ABI (minimal for swap functionality)
const ROUTER_ABI = [
  "function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
  "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
  "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)"
]

// Pandaria DEX Router Contract Address (replace with actual address)
const ROUTER_ADDRESS = '0x...' // TODO: Add actual router address

// Common token addresses on Monad Testnet (replace with actual addresses)
const TOKENS = {
  MON: '0x...', // Native MON token
  USDC: '0x...', // TODO: Add actual USDC address
  // Add more tokens as needed
}
type TokenKey = keyof typeof TOKENS;

interface SwapTokensProps {
  address: string;
  balance: string;
  onTransactionComplete: () => void;
}

export function SwapTokens({ address, balance, onTransactionComplete }: SwapTokensProps) {
  const [fromToken, setFromToken] = useState<TokenKey>('MON') // Default to MON
  const [toToken, setToToken] = useState<TokenKey>('USDC')
  const [amount, setAmount] = useState('')
  const [slippage, setSlippage] = useState('0.5') // Default 0.5%
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [estimatedOutput, setEstimatedOutput] = useState('0')

  // Set max amount
  const setMaxAmount = () => {
    // Leave some for gas (0.01 MON)
    const maxAmount = parseFloat(balance) - 0.01
    setAmount(maxAmount > 0 ? maxAmount.toString() : '0')
  }

  // Estimate output amount
  const estimateOutput = async (inputAmount: string) => {
    if (!inputAmount || parseFloat(inputAmount) <= 0) {
      setEstimatedOutput('0')
      return
    }

    try {
      const provider = new ethers.JsonRpcProvider(MONAD_NETWORK.rpcUrls[0])
      const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, provider)

      const path = fromToken === 'MON' 
        ? [TOKENS.MON, TOKENS[toToken]]
        : [TOKENS[fromToken], TOKENS[toToken]]

      const amountIn = ethers.parseEther(inputAmount)
      const amounts = await router.getAmountsOut(amountIn, path)
      const amountOut = amounts[amounts.length - 1]
      
      setEstimatedOutput(ethers.formatUnits(amountOut, 18)) // Assuming 18 decimals for all tokens
    } catch (error) {
      console.error('Error estimating output:', error)
      setEstimatedOutput('0')
    }
  }

  // Update estimate when amount changes
  useEffect(() => {
    estimateOutput(amount)
  }, [amount, fromToken, toToken])

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      if (!window.ethereum) {
        throw new Error('No wallet found!')
      }

      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const router = new ethers.Contract(ROUTER_ADDRESS, ROUTER_ABI, signer)

      const amountIn = ethers.parseEther(amount)
      const path = fromToken === 'MON' 
        ? [TOKENS.MON, TOKENS[toToken]]
        : [TOKENS[fromToken], TOKENS[toToken]]

      // Calculate minimum amount out with slippage
      const minAmountOut = (BigInt(ethers.parseEther(estimatedOutput)) * 
        BigInt(1000 - Math.floor(parseFloat(slippage) * 10))) / 
        BigInt(1000)

      const deadline = Math.floor(Date.now() / 1000) + 300 // 5 minutes

      let tx
      if (fromToken === 'MON') {
        // Swap MON for tokens
        tx = await router.swapExactETHForTokens(
          minAmountOut,
          path,
          address,
          deadline,
          { value: amountIn }
        )
      } else {
        // TODO: Implement token approval and swapExactTokensForTokens
        throw new Error('Token swaps not implemented yet')
      }

      console.log('Swap transaction sent:', tx.hash)
      await tx.wait()
      console.log('Swap confirmed')

      // Clear form and refresh balance
      setAmount('')
      onTransactionComplete()
    } catch (err) {
      console.error('Swap error:', err)
      setError(err instanceof Error ? err.message : 'Failed to execute swap')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Swap Tokens</h2>
      <form onSubmit={handleSwap} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium">From</label>
            <button
              type="button"
              onClick={setMaxAmount}
              className="text-sm text-blue-500 hover:text-blue-400"
            >
              MAX
            </button>
          </div>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.0"
              step="0.000000000000000001"
              min="0"
              required
            />
            <select
              value={fromToken}
              onChange={(e) => setFromToken(e.target.value as TokenKey)}
              className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MON">MON</option>
              {/* Add more tokens as they become available */}
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => {
              const temp = fromToken
              setFromToken(toToken)
              setToToken(temp)
              setAmount('')
            }}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            ↓↑
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">To</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={estimatedOutput}
              readOnly
              className="flex-1 px-3 py-2 bg-gray-700 rounded-lg focus:outline-none"
              placeholder="0.0"
            />
            <select
              value={toToken}
              onChange={(e) => setToToken(e.target.value as TokenKey)}
              className="px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="USDC">USDC</option>
              {/* Add more tokens as they become available */}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Slippage Tolerance (%)
          </label>
          <input
            type="number"
            value={slippage}
            onChange={(e) => setSlippage(e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            step="0.1"
            min="0.1"
            max="100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className={`w-full py-2 px-4 rounded-lg ${
            isLoading || !amount || parseFloat(amount) <= 0
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          } transition-colors duration-200`}
        >
          {isLoading ? 'Swapping...' : 'Swap'}
        </button>
      </form>
      {error && <p className="mt-4 text-center text-sm text-red-500">{error}</p>}
    </div>
  )
} 