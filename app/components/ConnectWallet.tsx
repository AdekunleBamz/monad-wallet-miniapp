interface ConnectWalletProps {
  onConnect: () => void;
}

export function ConnectWallet({ onConnect }: ConnectWalletProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={onConnect}
        className="bg-primary hover:bg-secondary text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
      >
        Connect Wallet
      </button>
      <p className="text-sm text-gray-400">
        Connect your wallet to view balance and send tokens
      </p>
    </div>
  )
} 