import { NextResponse } from 'next/server'

const manifest = {
  "id": "monad-wallet-miniapp",
  "name": "Monad Wallet Mini App",
  "description": "A simple token wallet (connect, view balance, send, and swap tokens) for Monad Testnet.",
  "version": "1.0.0",
  "icon": "https://monad-wallet-miniapp.vercel.app/icon.png",
  "launch_url": "https://monad-wallet-miniapp.vercel.app/",
  "developer": {
    "name": "Monad Wallet Team",
    "url": "https://monad-wallet-miniapp.vercel.app/"
  },
  "permissions": [
    "camera",
    "geolocation",
    "notifications"
  ],
  "categories": ["finance", "utilities"],
  "screenshots": [
    {
      "src": "https://monad-wallet-miniapp.vercel.app/icon.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ],
  "shortcuts": [
    {
      "name": "Open Wallet",
      "url": "/",
      "description": "Open the Monad Wallet"
    }
  ],
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#6366f1",
  "background_color": "#000000",
  "start_url": "/",
  "scope": "/"
}

export async function GET() {
  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=3600',
    },
  })
} 