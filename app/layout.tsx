import type { Metadata } from 'next'
import { Geist_Mono } from 'next/font/google'
import './globals.css'

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL('https://callsign.vercel.app/'),

  title: {
    default: 'CALLSIGN | EVM Calldata Decoder',
    template: '%s | CALLSIGN',
  },
  description:
    'Terminal-style EVM calldata decoder. Paste any raw hex calldata and get a fully decoded, human-readable breakdown — function name, parameters, and Safe multiSend support.',

  keywords: [
    'EVM',
    'calldata',
    'decoder',
    'Ethereum',
    'ABI',
    'hex decoder',
    'function selector',
    '4byte',
    'Safe multisend',
    'onchain',
    'web3',
    'smart contract',
  ],

  authors: [{ name: 'Victor Okpukpan', url: 'https://x.com/victorokpukpan_' }],

  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },

  openGraph: {
    type: 'website',
    url: 'https://callsign.vercel.app/',
    siteName: 'CALLSIGN',
    title: 'CALLSIGN | EVM Calldata Decoder',
    description:
      'Terminal-style EVM calldata decoder. Paste any raw hex calldata and get a fully decoded, human-readable breakdown — function name, parameters, and Safe multiSend support.',
    images: [
      {
        url: '/og.png',
        width: 1200,
        height: 630,
        alt: 'CALLSIGN — EVM Calldata Decoder',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    site: '@victorokpukpan_',
    creator: '@victorokpukpan_',
    title: 'CALLSIGN | EVM Calldata Decoder',
    description:
      'Terminal-style EVM calldata decoder. Paste any raw hex calldata and get a fully decoded, human-readable breakdown.',
    images: ['/og.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full`}>
      <body className="h-full">{children}</body>
    </html>
  )
}
