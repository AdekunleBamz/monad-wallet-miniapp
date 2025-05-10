export const MONAD_NETWORK = {
  chainId: '0x279F', // 10143 in hex
  chainName: 'Monad Testnet',
  nativeCurrency: {
    name: 'MONAD',
    symbol: 'MON',
    decimals: 18
  },
  rpcUrls: ['https://monad-testnet.drpc.org'],
  blockExplorerUrls: ['https://testnet.monadexplorer.com'],
  // Add these fields to ensure proper network addition in wallets
  iconUrls: ['https://testnet.monadexplorer.com/favicon.ico'],
  shortName: 'monad-testnet',
  // Add these fields for ethers.js compatibility
  _defaultProvider: (providers: any) => new providers.JsonRpcProvider('https://monad-testnet.drpc.org'),
  // Ensure chainId is properly formatted for ethers.js
  _chainId: 10143
} 