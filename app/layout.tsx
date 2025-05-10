import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Monad Wallet Mini App',
  description: 'A simple wallet interface for Monad blockchain',
  manifest: '/manifest.json',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: 'website',
    title: 'Monad Wallet Mini App',
    description: 'A simple wallet interface for Monad blockchain',
    url: 'https://monad-wallet-miniapp.vercel.app',
    images: [
      {
        url: 'https://monad-wallet-miniapp.vercel.app/icon.png',
        width: 512,
        height: 512,
        alt: 'Monad Wallet Icon',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Monad Wallet Mini App',
    description: 'A simple wallet interface for Monad blockchain',
    images: ['https://monad-wallet-miniapp.vercel.app/icon.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#6366f1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-background text-white min-h-screen`}>
        {children}
      </body>
    </html>
  )
} 