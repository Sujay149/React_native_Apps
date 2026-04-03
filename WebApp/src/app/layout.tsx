import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TaskTrack - Field Operations Management',
  description: 'Comprehensive field operations and service management system',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-background text-text-primary">
        {children}
      </body>
    </html>
  )
}
