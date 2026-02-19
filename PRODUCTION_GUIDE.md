# Campus Poll - Production Deployment Guide

This guide provides step-by-step instructions to transition the Campus Poll demo to a production-ready application with real Algorand blockchain integration.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Smart Contract Development](#2-smart-contract-development)
3. [Campus Token Creation](#3-campus-token-creation)
4. [Wallet Integration](#4-wallet-integration)
5. [Environment Configuration](#5-environment-configuration)
6. [Security Considerations](#6-security-considerations)
7. [Deployment](#7-deployment)
8. [Testing](#8-testing)

---

## 1. Prerequisites

### Required Tools

| Tool | Purpose | Installation |
|------|---------|--------------|
| **AlgoKit** | Algorand development toolkit | `pip install algokit` or `brew install algokit` |
| **Pera Wallet** | Mobile wallet for testing | Download from App Store/Play Store |
| **Node.js 18+** | JavaScript runtime | `brew install node` or via nvm |
| **Bun** | Package manager | `curl -fsSL https://bun.sh/install | bash` |

### Accounts Needed

- **Algorand TestNet Account**: For development testing
- **Algorand MainNet Account**: For production deployment
- **WalletConnect Project ID**: From [walletconnect.com](https://walletconnect.com)
- **Pera Wallet Developer Account**: Optional, for deep linking

### Get TestNet ALGO

1. Visit [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/)
2. Enter your TestNet wallet address
3. Receive free test ALGO for development

---

## 2. Smart Contract Development

### Step 2.1: Initialize AlgoKit Project

```bash
# Create new AlgoKit project for the smart contract
algokit init campus-poll-contract

# Choose Python template (recommended for Algorand)
# Select "python" when prompted
```

### Step 2.2: Define Smart Contract

Create `smart_contracts/campus_poll.py`:

```python
from algopy import ARC4Contract, arc4, UInt64, String, DynamicArray, Global, Txn, op
from algopy.arc4 import abimethod

class CampusPoll(ARC4Contract):
    """
    Campus Poll Smart Contract
    Implements transparent, tamper-proof voting on Algorand
    """
    
    def __init__(self) -> None:
        self.creator = Global.zero_address
        self.question = String("")
        self.start_time = UInt64(0)
        self.end_time = UInt64(0)
        self.min_token_balance = UInt64(0)
        self.total_votes = UInt64(0)
        self.options = DynamicArray[String]()
        self.votes = DynamicArray[UInt64]()
    
    @abimethod(allow_actions=["NoOp"], create="require")
    def create_poll(
        self,
        question: String,
        options: DynamicArray[String],
        start_time: UInt64,
        end_time: UInt64,
        min_token_balance: UInt64,
        campus_token_id: UInt64
    ) -> None:
        """Create a new poll with specified parameters"""
        self.creator = Txn.sender
        self.question = question
        self.options = options
        self.start_time = start_time
        self.end_time = end_time
        self.min_token_balance = min_token_balance
        self.campus_token_id = campus_token_id
        
        # Initialize vote counts
        for i in range(options.length):
            self.votes.append(UInt64(0))
    
    @abimethod
    def cast_vote(self, option_index: UInt64) -> None:
        """Cast a vote for a specific option"""
        # Verify poll is active
        assert(Global.latest_timestamp >= self.start_time, "Poll not started")
        assert(Global.latest_timestamp <= self.end_time, "Poll ended")
        
        # Verify option is valid
        assert(option_index < self.options.length, "Invalid option")
        
        # Verify voter hasn't voted (check local state)
        has_voted = op.Box.get(Txn.sender.bytes)[1]
        assert(not has_voted, "Already voted")
        
        # Verify token balance
        token_balance = op.Asset.asset_holding_get(
            op.AssetHoldingField.AssetBalance,
            Txn.sender,
            self.campus_token_id
        )[0]
        assert(token_balance >= self.min_token_balance, "Insufficient token balance")
        
        # Record vote
        self.votes[option_index] = self.votes[option_index] + 1
        self.total_votes = self.total_votes + 1
        
        # Mark as voted in local state
        op.Box.put(Txn.sender.bytes, b"voted", b"1")
    
    @abimethod(readonly=True)
    def get_results(self) -> DynamicArray[UInt64]:
        """Get current vote counts for all options"""
        return self.votes
    
    @abimethod(readonly=True)
    def get_poll_info(self) -> tuple[String, UInt64, UInt64]:
        """Get poll information"""
        return (self.question, self.total_votes, self.options.length)
```

### Step 2.3: Build and Deploy Smart Contract

```bash
# Build the smart contract
algokit project build

# Deploy to TestNet
algokit project deploy --network testnet

# Note the App ID from deployment output
```

---

## 3. Campus Token Creation

### Step 3.1: Create Campus Token (ASA)

The Campus Token is an Algorand Standard Asset (ASA) used for voter eligibility.

```javascript
// scripts/create-campus-token.js
const algosdk = require('algosdk');

async function createCampusToken() {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
    
    // Your creator account (load from mnemonic securely)
    const creatorMnemonic = process.env.CREATOR_MNEMONIC;
    const creatorAccount = algosdk.mnemonicToSecretKey(creatorMnemonic);
    
    // Asset creation parameters
    const params = await algodClient.getTransactionParams().do();
    
    const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
        from: creatorAccount.addr,
        total: 1000000, // 1 million tokens
        decimals: 0,
        defaultFrozen: false,
        unitName: 'CAMPUS',
        assetName: 'Campus Voting Token',
        manager: creatorAccount.addr,
        reserve: creatorAccount.addr,
        freeze: creatorAccount.addr,
        clawback: creatorAccount.addr,
        suggestedParams: params
    });
    
    const signedTxn = txn.signTxn(creatorAccount.sk);
    const txId = txn.txID().toString();
    
    await algodClient.sendRawTransaction(signedTxn).do();
    const result = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    const assetId = result['asset-index'];
    console.log(`Campus Token created with Asset ID: ${assetId}`);
    
    return assetId;
}

createCampusToken();
```

### Step 3.2: Distribute Tokens to Students

```javascript
// scripts/distribute-tokens.js
async function distributeTokens(assetId, studentAddresses) {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
    
    for (const studentAddress of studentAddresses) {
        const params = await algodClient.getTransactionParams().do();
        
        // Opt-in transaction (student must do this first)
        // Then transfer tokens
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
            from: creatorAccount.addr,
            to: studentAddress,
            amount: 10, // Give each student 10 CAMPUS tokens
            assetIndex: assetId,
            suggestedParams: params
        });
        
        // Sign and send...
    }
}
```

---

## 4. Wallet Integration

### Step 4.1: Install WalletConnect

```bash
bun add @walletconnect/sign-client @walletconnect/modal
```

### Step 4.2: Create Wallet Provider

Create `src/lib/wallet-provider.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import SignClient from '@walletconnect/sign-client';
import { Web3Modal } from '@walletconnect/modal';

interface WalletContextType {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (txn: Uint8Array) => Promise<Uint8Array>;
}

const WalletContext = createContext<WalletContextType | null>(null);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<SignClient | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    initWalletConnect();
  }, []);

  async function initWalletConnect() {
    const signClient = await SignClient.init({
      projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID,
      metadata: {
        name: 'Campus Poll',
        description: 'Blockchain-Verified Campus Voting',
        url: 'https://campuspoll.app',
        icons: ['https://campuspoll.app/logo.png']
      }
    });
    
    setClient(signClient);
  }

  async function connect() {
    if (!client) return;
    
    const { uri, approval } = await client.connect({
      requiredNamespaces: {
        algorand: {
          chains: ['algorand:466026608-testnet-v1.0'],
          methods: ['algo_signTxn'],
          events: []
        }
      }
    });
    
    // Open WalletConnect modal
    if (uri) {
      const modal = new Web3Modal({
        projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_ID
      });
      modal.openModal({ uri });
    }
    
    const session = await approval();
    setSession(session);
    
    // Extract address from session
    const address = session.namespaces.algorand.accounts[0].split(':')[2];
    setAddress(address);
  }

  async function disconnect() {
    if (client && session) {
      await client.disconnect({ topic: session.topic });
    }
    setAddress(null);
    setSession(null);
  }

  async function signTransaction(txn: Uint8Array): Promise<Uint8Array> {
    if (!client || !session) throw new Error('Not connected');
    
    const result = await client.request({
      topic: session.topic,
      chainId: 'algorand:466026608-testnet-v1.0',
      request: {
        method: 'algo_signTxn',
        params: { txn }
      }
    });
    
    return new Uint8Array(Buffer.from(result, 'base64'));
  }

  return (
    <WalletContext.Provider value={{ 
      address, 
      connected: !!address, 
      connect, 
      disconnect,
      signTransaction 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
```

### Step 4.3: Pera Wallet Deep Link (Mobile)

```typescript
// src/lib/pera-wallet.ts
import algosdk from 'algosdk';

export function generatePeraWalletLink(txn: algosdk.Transaction): string {
  const encodedTxn = Buffer.from(
    algosdk.encodeUnsignedTransaction(txn)
  ).toString('base64');
  
  return `algorand-wallet://?txn=${encodedTxn}`;
}

export async function pollForSignature(txId: string): Promise<Uint8Array> {
  const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', 443);
  
  // Poll for transaction confirmation
  let result;
  while (!result) {
    try {
      result = await algosdk.waitForConfirmation(algodClient, txId, 1);
    } catch {
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  
  return result;
}
```

---

## 5. Environment Configuration

### Step 5.1: Create Environment File

Create `.env.production`:

```env
# Algorand Configuration
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_PORT=443
NEXT_PUBLIC_ALGOD_TOKEN=

# For MainNet, use:
# NEXT_PUBLIC_ALGOD_SERVER=https://mainnet-api.algonode.cloud

# Smart Contract
NEXT_PUBLIC_POLL_APP_ID=YOUR_APP_ID_HERE
NEXT_PUBLIC_CAMPUS_TOKEN_ID=YOUR_TOKEN_ID_HERE

# WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_ID=your_walletconnect_project_id

# Feature Flags
NEXT_PUBLIC_DEMO_MODE=false
```

### Step 5.2: Update Code to Use Real Blockchain

Update `src/lib/algorand.ts`:

```typescript
// Remove demo mode, use actual Algorand calls

export async function submitVote(
  pollAppId: number,
  optionIndex: number,
  sender: string
): Promise<string> {
  const algodClient = new algosdk.Algodv2(
    process.env.NEXT_PUBLIC_ALGOD_TOKEN || '',
    process.env.NEXT_PUBLIC_ALGOD_SERVER,
    parseInt(process.env.NEXT_PUBLIC_ALGOD_PORT || '443')
  );
  
  const params = await algodClient.getTransactionParams().do();
  
  // Create application call transaction
  const txn = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender,
    appIndex: pollAppId,
    appArgs: [
      new Uint8Array(Buffer.from('cast_vote')),
      algosdk.encodeUint64(optionIndex)
    ],
    suggestedParams: params
  });
  
  // Return encoded transaction for wallet signing
  return algosdk.encodeUnsignedTransaction(txn);
}
```

---

## 6. Security Considerations

### Smart Contract Security

1. **Reentrancy Protection**: Algorand is not susceptible to reentrancy attacks due to its AVM architecture

2. **Access Control**: Implement proper creator-only functions:
```python
@abimethod
def end_poll(self) -> None:
    assert(Txn.sender == self.creator, "Only creator can end poll")
    self.end_time = Global.latest_timestamp
```

3. **Integer Overflow**: Algorand uses big integers, but verify bounds:
```python
assert(option_index < self.options.length, "Index out of bounds")
```

### Frontend Security

1. **Never store private keys in frontend** - Always use wallet signing
2. **Validate all inputs** before sending to blockchain
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** to prevent spam

### API Security

```typescript
// src/app/api/vote/route.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  
  if (!success) {
    return new Response('Too many requests', { status: 429 });
  }
  
  // Process vote...
}
```

---

## 7. Deployment

### Step 7.1: Build for Production

```bash
bun run build
```

### Step 7.2: Deploy to Vercel

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

### Step 7.3: Configure Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add all variables from `.env.production`
3. Redeploy to apply changes

### Step 7.4: Custom Domain (Optional)

1. In Vercel Dashboard, go to Settings → Domains
2. Add your domain (e.g., `campuspoll.app`)
3. Configure DNS records as instructed
4. Enable HTTPS (automatic with Vercel)

---

## 8. Testing

### Step 8.1: Smart Contract Testing

```python
# tests/test_campus_poll.py
import pytest
from algopy import ARC4Contract
from campus_poll import CampusPoll

def test_create_poll():
    contract = CampusPoll()
    # Test poll creation
    contract.create_poll(
        question="Test Poll?",
        options=["Yes", "No"],
        start_time=0,
        end_time=1000000,
        min_token_balance=10
    )
    assert contract.question == "Test Poll?"

def test_cast_vote():
    contract = CampusPoll()
    # Setup and test voting
    # ...
```

### Step 8.2: Integration Testing

```typescript
// tests/integration.test.ts
import { describe, it, expect } from 'bun:test';

describe('Voting Flow', () => {
    it('should create poll and accept votes', async () => {
        // 1. Create poll
        // 2. Connect wallet
        // 3. Cast vote
        // 4. Verify results
    });
});
```

### Step 8.3: End-to-End Testing

Use Playwright or Cypress:

```typescript
// e2e/voting.spec.ts
import { test, expect } from '@playwright/test';

test('complete voting flow', async ({ page }) => {
    await page.goto('/');
    
    // Connect wallet (mocked)
    await page.click('[data-testid="connect-wallet"]');
    
    // Navigate to poll
    await page.click('[data-testid="poll-card"]');
    
    // Cast vote
    await page.click('[data-testid="option-1"]');
    await page.click('[data-testid="submit-vote"]');
    
    // Verify confirmation
    await expect(page.locator('[data-testid="vote-confirmed"]')).toBeVisible();
});
```

---

## Quick Checklist

- [ ] AlgoKit installed
- [ ] Smart contract written and tested
- [ ] Smart contract deployed to TestNet
- [ ] Campus Token (ASA) created
- [ ] WalletConnect project ID obtained
- [ ] Environment variables configured
- [ ] Frontend updated for real blockchain
- [ ] Security audit completed
- [ ] Deployed to production hosting
- [ ] Custom domain configured
- [ ] End-to-end tests passing

---

## Support Resources

- [Algorand Developer Portal](https://developer.algorand.org)
- [AlgoKit Documentation](https://github.com/algorandfoundation/algokit)
- [Pera Wallet Integration Guide](https://github.com/perawallet/connect)
- [WalletConnect Documentation](https://docs.walletconnect.com)

---

*This guide is a starting point. Consult with blockchain security experts before handling real assets or sensitive voting data.*
