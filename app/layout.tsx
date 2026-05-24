import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CarMatch AI — Find Your Perfect Car',
  description:
    'Confused by too many car options? Answer 4 quick questions about your lifestyle, and get a curated top-3 shortlist tailored to Indian buyers — with match reasoning and side-by-side comparisons.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
