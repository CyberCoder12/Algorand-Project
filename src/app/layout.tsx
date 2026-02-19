import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import AlgorandWalletProvider from "@/components/WalletProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus Poll | Blockchain-Verified Voting",
  description: "Transparent, tamper-proof campus elections and polls powered by Algorand blockchain. Create polls, vote securely, and verify results on-chain.",
  keywords: ["Campus Poll", "Algorand", "Blockchain Voting", "Campus Elections", "Decentralized Voting", "Student Government", "AlgoKit"],
  authors: [{ name: "Campus Poll Team" }],
  icons: {
    icon: "/campus-poll-logo.svg",
    apple: "/campus-poll-logo.svg",
  },
  openGraph: {
    title: "Campus Poll - Blockchain-Verified Voting",
    description: "Transparent, tamper-proof campus elections powered by Algorand",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Campus Poll - Blockchain-Verified Voting",
    description: "Transparent, tamper-proof campus elections powered by Algorand",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AlgorandWalletProvider>
            {children}
            <Toaster />
          </AlgorandWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
