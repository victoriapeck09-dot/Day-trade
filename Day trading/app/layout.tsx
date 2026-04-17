import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Day Trade Helper',
  description: 'AI-powered day trading assistant with candlestick analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://unpkg.com/lightweight-charts/dist/lightweight-charts.standalone.production.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}