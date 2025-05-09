interface WalletBalanceProps {
  address: string;
  balance: string;
}

export function WalletBalance({ address, balance }: WalletBalanceProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Wallet Address</h2>
        <p className="text-sm text-gray-400 break-all">{address}</p>
      </div>
      <div>
        <h2 className="text-lg font-semibold mb-2">Balance</h2>
        <p className="text-2xl font-bold text-primary">{balance} MON</p>
      </div>
    </div>
  )
} 