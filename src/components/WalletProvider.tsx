"use client";

import { NetworkId, WalletId, WalletManager, WalletProvider } from "@txnlab/use-wallet-react";

const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.KIBISIS
  ],
  network: NetworkId.TESTNET,
  algod: {
    token: '',
    baseServer: 'https://testnet-api.algonode.cloud',
    port: 443,
  }
});

export default function AlgorandWalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider manager={walletManager}>
      {children}
    </WalletProvider>
  );
}
