interface WalletBalanceProps {
  address: string;
  balance: string;
  onDisconnect: () => void;
  onRefresh: () => void;
}

export function WalletBalance({ address, balance, onDisconnect, onRefresh }: WalletBalanceProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold mb-2">Wallet Address</h2>
          <p className="text-sm text-gray-400 break-all">{address}</p>
        </div>
        <button
          onClick={onDisconnect}
          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Balance</h2>
          <button
            onClick={onRefresh}
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            Refresh
          </button>
        </div>
        <p className="text-2xl font-bold text-primary">{balance} MON</p>
      </div>
    </div>
  )
} 