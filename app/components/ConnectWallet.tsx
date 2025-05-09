'use client'

import { useState } from 'react'

interface ConnectWalletProps {
  onConnect: () => void;
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  const [isConnecting, setIsConnecting] = useState(false)

  const handleConnect = async () => {
    try {
      setIsConnecting(true)
      console.log('Connect button clicked')
      await onConnect()
    } catch (error) {
      console.error('Error in ConnectWallet component:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      <p className="text-sm text-gray-400">
        Connect your wallet to view balance and send tokens
      </p>
    </div>
  )
} 