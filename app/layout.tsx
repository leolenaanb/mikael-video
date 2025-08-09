import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ClerkProvider } from "@clerk/nextjs"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mikael Software - Viral Video Generator",
  description: "Create viral videos in minutes with our powerful video editor",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body className={inter.className}>
          <div className="min-h-screen bg-background text-foreground">{children}</div>
        </body>
      </html>
    </ClerkProvider>
  )
}
