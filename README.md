# Monad Wallet Mini App

A simple and modern wallet interface for the Monad blockchain, built with Next.js and TypeScript.

## Features

- Connect to Monad Testnet
- View wallet balance
- Send MON tokens
- Auto-refresh balance after transactions
- MAX button for sending maximum amount
- Network switching support
- Modern UI with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MetaMask or other Web3 wallet
- Monad Testnet configured in your wallet

### Installation

1. Clone the repository:
```bash
git clone https://github.com/AdekunleBamz/monad-wallet-miniapp.git
cd monad-wallet-miniapp
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Monad Testnet Configuration

Add the following network to your MetaMask:

- Network Name: Monad Testnet
- RPC URL: https://monad-testnet.drpc.org
- Chain ID: 10143
- Currency Symbol: MON
- Block Explorer: https://testnet.monadexplorer.com

## Technologies Used

- Next.js 14
- TypeScript
- Tailwind CSS
- ethers.js
- MetaMask Web3 Provider

## License

MIT 