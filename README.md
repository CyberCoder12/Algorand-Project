# Campus Poll - Blockchain-Verified Voting Platform

<div align="center">
  <img src="public/logo.svg" alt="Campus Poll Logo" width="120" height="120">
  
  <h3>Transparent, Tamper-Proof Campus Elections on Algorand</h3>
  
  [![Algorand](https://img.shields.io/badge/Algorand-TestNet-black?style=flat-square&logo=algorand)](https://algorand.com)
  [![AlgoKit](https://img.shields.io/badge/AlgoKit-3.0-blue?style=flat-square)](https://github.com/algorandfoundation/algokit)
  [![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
</div>

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Problem Statement](#-problem-statement)
- [Live Demo](#-live-demo)
- [Architecture Overview](#-architecture-overview)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Installation & Setup](#-installation--setup)
- [Usage Guide](#-usage-guide)
- [Smart Contract Details](#-smart-contract-details)
- [Known Limitations](#-known-limitations)
- [Team Members](#-team-members)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Project Overview

Campus Poll is a decentralized voting platform designed for campus elections, club decisions, and opinion polls. Built on the Algorand blockchain, it ensures that every vote is counted exactly once, results are transparent and tamper-proof, and only verified students can participate.

### Key Benefits

- **🔒 Immutable Voting Records**: Every vote is permanently recorded on the Algorand blockchain, providing an unalterable audit trail that guarantees election integrity and eliminates any possibility of vote manipulation or tampering.

- **👤 Privacy-Preserving Verification**: Voter identities are protected through cryptographic anonymization while still maintaining complete transparency of the voting process, ensuring both privacy and accountability.

- **🎓 Token-Gated Eligibility**: Only verified students holding the required campus tokens can participate, preventing unauthorized voting and ensuring elections remain exclusive to the campus community.

- **📊 Real-Time Results**: Watch election results unfold in real-time with beautiful visualizations, including pie charts and bar graphs, while maintaining confidence in the accuracy of every vote counted.

- **🔍 Complete Audit Trail**: Every transaction is traceable on the Algorand explorer, allowing anyone to verify the legitimacy of the election without compromising voter privacy.

---

## ❓ Problem Statement

Traditional campus voting systems suffer from several critical issues that undermine democratic processes and erode trust in election outcomes:

### Trust and Transparency Issues

**Lack of Transparency**: Centralized voting systems operate as "black boxes" where students must blindly trust that administrators are counting votes correctly. There is no way for the average voter to verify that their vote was actually counted or that the final results match the actual votes cast.

**Susceptibility to Manipulation**: Paper ballots can be lost, damaged, or altered. Electronic voting machines can be hacked or reprogrammed. Central databases can be modified by anyone with administrative access. These vulnerabilities create opportunities for election fraud that can go completely undetected.

### Verification and Security Problems

**Double Voting**: Without proper identity verification tied to a tamper-proof record, determined individuals can potentially vote multiple times under different identities, skewing results and disenfranchising legitimate voters.

**Identity Fraud**: Traditional student ID verification can be circumvented through fake IDs, stolen credentials, or collusion with voting officials. Once a fraudulent vote is cast, it is nearly impossible to detect and remove.

### Accessibility and Engagement Challenges

**Low Participation**: When students don't trust the voting process or find it inconvenient, participation rates plummet. Low turnout undermines the legitimacy of election results and can lead to leadership that doesn't truly represent the student body.

**Limited Poll Options**: Creating official polls often requires administrative approval, lengthy setup processes, and technical resources. This friction discourages ad-hoc polling for club decisions, event planning, and other democratic processes that would benefit from structured voting.

### Our Solution

Campus Poll addresses all these challenges by leveraging the Algorand blockchain's unique capabilities: instant finality, negligible transaction fees, and a carbon-negative footprint. By recording every vote as an immutable blockchain transaction and implementing token-based eligibility verification, we create a voting system that is transparent, secure, and trustworthy by design.

---

## 🌐 Live Demo

**Live Demo URL**: `[PLACEHOLDER: Add your deployed application URL here]`

**LinkedIn Demo Video**: `[PLACEHOLDER: Add your LinkedIn demo video URL here]`

### Testnet Information

- **App ID (Testnet)**: `[PLACEHOLDER: Add your deployed App ID here]`
- **Testnet Explorer Link**: `[PLACEHOLDER: Add your Algorand Testnet explorer link here]`

---

## 🏗️ Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   Poll      │  │   Vote      │  │   Results   │            │
│  │   Creator   │  │   Form      │  │   Dashboard │            │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│         │                │                │                    │
│  ┌──────┴────────────────┴────────────────┴──────┐            │
│  │              Zustand State Manager             │            │
│  └─────────────────────┬──────────────────────────┘            │
└────────────────────────┼────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                        │        Backend Layer                    │
│  ┌─────────────────────┴──────────────────────┐                │
│  │              Algorand SDK Client            │                │
│  │         (Transaction Building & Signing)    │                │
│  └─────────────────────┬──────────────────────┘                │
└────────────────────────┼────────────────────────────────────────┘
                         │
┌────────────────────────┼────────────────────────────────────────┐
│                        │      Blockchain Layer                   │
│  ┌─────────────────────┴──────────────────────┐                │
│  │         Campus Poll Smart Contract          │                │
│  │              (Algorand ARC-0032)            │                │
│  │  ┌─────────────┐  ┌─────────────┐          │                │
│  │  │   Create    │  │   Cast      │          │                │
│  │  │   Poll      │  │   Vote      │          │                │
│  │  └─────────────┘  └─────────────┘          │                │
│  └─────────────────────────────────────────────┘                │
│                                                                  │
│  ┌─────────────────────────────────────────────┐                │
│  │          Campus Token (ASA)                 │                │
│  │       (Voter Eligibility Verification)      │                │
│  └─────────────────────────────────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

### Smart Contract + Frontend Interaction

1. **Poll Creation**: The frontend constructs a smart contract deployment transaction using AlgoKit, defining poll parameters (question, options, duration, eligibility requirements). The contract is deployed to Algorand TestNet with a unique App ID.

2. **Wallet Connection**: Users connect their Algorand wallet (Pera, Defly, etc.) through WalletConnect or mobile wallet pairing. The frontend queries the user's Campus Token balance to verify eligibility.

3. **Vote Casting**: When a user votes, the frontend creates an application call transaction that invokes the smart contract's vote method. The contract verifies:
   - User hasn't voted in this poll (one-vote-per-address enforcement)
   - User holds required Campus Token balance
   - Poll is currently active (within start/end times)

4. **Result Aggregation**: Vote counts are stored in the smart contract's global state. The frontend queries this state to display real-time results. The audit log shows all votes (transaction IDs, timestamps) without revealing voter identities.

5. **Verification**: Anyone can verify election integrity by checking the smart contract state on the Algorand explorer, confirming that the number of votes matches the number of unique voter addresses.

---

## 🛠️ Tech Stack

### Blockchain Infrastructure

| Technology | Purpose | Version |
|------------|---------|---------|
| **Algorand** | Layer-1 Blockchain | TestNet |
| **AlgoKit** | Development Toolkit | 3.0+ |
| **algosdk** | JavaScript SDK | 3.5.2 |
| **ARC-0032** | Smart Contract Standard | Latest |

### Frontend Framework

| Technology | Purpose | Version |
|------------|---------|---------|
| **Next.js** | React Framework | 16.1 |
| **React** | UI Library | 19.0 |
| **TypeScript** | Type Safety | 5.x |
| **Tailwind CSS** | Styling | 4.x |

### UI Components & Visualization

| Technology | Purpose | Version |
|------------|---------|---------|
| **shadcn/ui** | Component Library | Latest |
| **Recharts** | Charts & Graphs | 2.15 |
| **Lucide Icons** | Icon Library | Latest |
| **Framer Motion** | Animations | 12.x |

### State Management & Data

| Technology | Purpose | Version |
|------------|---------|---------|
| **Zustand** | Global State | 5.0 |
| **React Hook Form** | Form Handling | 7.x |
| **Zod** | Validation | 4.x |

---

## ✨ Features

### 📝 Poll Management

- **Create Polls**: Define questions, multiple choice options, start/end times, and minimum token requirements
- **Edit Polls**: Modify poll parameters before voting begins (creator only)
- **End Polls**: Manually conclude active polls (creator only)
- **Poll Discovery**: Browse all available polls with filtering by status

### 🔐 Wallet Integration

- **Multi-Wallet Support**: Connect via Pera Wallet, Defly, Exodus, and other Algorand-compatible wallets
- **Balance Display**: View your CAMPUS token balance in real-time
- **Eligibility Indicator**: Clear visual feedback on voting eligibility status

### 🗳️ Voting System

- **One-Person-One-Vote**: Blockchain-enforced single vote per address per poll
- **Token Gating**: Only voters meeting minimum balance requirements can participate
- **Confirmation Flow**: Review your vote before final submission
- **Transaction Receipt**: Receive a blockchain transaction ID for your vote

### 📊 Results Dashboard

- **Real-Time Updates**: Watch vote counts update as they're cast
- **Pie Charts**: Visual distribution of votes across options
- **Bar Charts**: Comparative view of option popularity
- **Percentage Calculations**: Automatic computation of vote percentages
- **Leading Indicator**: Highlight the current winning option

### 🔍 Audit System

- **Complete Vote Log**: Every vote recorded with transaction ID and timestamp
- **Anonymized View**: Voter addresses partially hidden for privacy
- **Blockchain Verification**: Links to Algorand explorer for independent verification
- **Search & Filter**: Find specific votes or filter by poll

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** 18.x or later
- **Bun** package manager (recommended) or npm/yarn
- **Algorand Wallet** (Pera, Defly, etc.) with TestNet account
- **TestNet ALGO** for transaction fees (get from [Algorand TestNet Dispenser](https://bank.testnet.algorand.network/))

### Clone and Install

```bash
# Clone the repository
git clone [PLACEHOLDER: Add repository URL]
cd campus-poll

# Install dependencies
bun install

# Or with npm
npm install
```

### Environment Configuration

Create a `.env.local` file in the root directory:

```env
# Algorand Configuration (TestNet)
NEXT_PUBLIC_ALGOD_SERVER=https://testnet-api.algonode.cloud
NEXT_PUBLIC_ALGOD_PORT=443
NEXT_PUBLIC_ALGOD_TOKEN=""

# Campus Token Asset ID (replace with your token)
NEXT_PUBLIC_CAMPUS_TOKEN_ID=[PLACEHOLDER]

# WalletConnect Project ID (get from walletconnect.com)
NEXT_PUBLIC_WALLET_CONNECT_ID=[PLACEHOLDER]
```

### Run Development Server

```bash
# Start development server
bun run dev

# Or with npm
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
bun run build

# Start production server
bun run start
```

---

## 📖 Usage Guide

### Creating a Poll

1. **Connect Your Wallet**: Click "Connect Wallet" and approve the connection request in your Algorand wallet app.

2. **Navigate to Create Tab**: Click the "Create" tab in the navigation bar.

3. **Fill in Poll Details**:
   - Enter your poll question
   - Add at least 2 voting options (up to 10 maximum)
   - Set start and end dates/times
   - Define minimum CAMPUS token balance required to vote

4. **Submit**: Click "Create Poll" and approve the transaction in your wallet.

5. **Share**: Use the generated App ID to share your poll with voters.

### Voting in a Poll

1. **Ensure Eligibility**: Check that you have the required CAMPUS token balance.

2. **Select a Poll**: Browse active polls and click "Vote Now" on your chosen poll.

3. **Make Your Selection**: Click on your preferred voting option.

4. **Confirm**: Review your choice in the confirmation dialog.

5. **Approve Transaction**: Sign the vote transaction in your wallet.

6. **Receipt**: Save your transaction ID for verification purposes.

### Viewing Results

1. **Navigate to Results**: Click "View Results" on any poll card.

2. **Switch Chart Types**: Toggle between pie chart and bar chart views.

3. **Detailed Breakdown**: Scroll down to see exact vote counts and percentages for each option.

### Auditing Votes

1. **Access Audit Log**: Click the "Audit" tab in the navigation.

2. **Search**: Find votes by transaction ID, poll name, or option.

3. **Filter**: Narrow down by poll or confirmation status.

4. **Verify**: Click the external link to view any vote on the Algorand explorer.

### Screenshots

`[PLACEHOLDER: Add application screenshots here]`

| Feature | Screenshot |
|---------|------------|
| Poll List View | `[PLACEHOLDER]` |
| Create Poll Form | `[PLACEHOLDER]` |
| Voting Interface | `[PLACEHOLDER]` |
| Results Dashboard | `[PLACEHOLDER]` |
| Audit Log | `[PLACEHOLDER]` |

---

## 📜 Smart Contract Details

### Contract Methods

| Method | Description | Access |
|--------|-------------|--------|
| `create_poll` | Initialize a new poll with options and parameters | Creator |
| `cast_vote` | Submit a vote for a specific option | Any eligible voter |
| `end_poll` | Manually end an active poll | Creator |
| `get_results` | Query current vote counts | Read-only |

### Global State Schema

| Key | Type | Description |
|-----|------|-------------|
| `creator` | bytes | Poll creator address |
| `question` | bytes | Poll question text |
| `start_time` | uint64 | Unix timestamp for poll start |
| `end_time` | uint64 | Unix timestamp for poll end |
| `min_balance` | uint64 | Minimum token balance required |
| `total_votes` | uint64 | Total votes cast |
| `option_X_votes` | uint64 | Vote count for option X |

### Local State Schema

| Key | Type | Description |
|-----|------|-------------|
| `has_voted` | bool | Whether address has voted |
| `voted_option` | uint64 | Option the address voted for |

---

## ⚠️ Known Limitations

### Current Limitations

1. **Demo Mode**: The current implementation uses simulated blockchain interactions for demonstration purposes. Full integration requires deploying smart contracts to TestNet using AlgoKit.

2. **Wallet Connection**: WalletConnect integration is simulated. Production deployment requires proper WalletConnect project ID and session management.

3. **Token Distribution**: The Campus Token distribution mechanism (how students receive tokens) is not implemented. This would typically integrate with university identity systems.

4. **Gas Fees**: Vote transactions require ALGO for fees. A fee abstraction mechanism or sponsored transactions would improve user experience.

5. **Scalability**: While Algorand handles high throughput, the current frontend doesn't implement pagination for large vote datasets.

### Future Enhancements

- **Mobile App**: Native mobile application for easier wallet integration
- **Ranking Polls**: Support for ranked-choice voting
- **Quadratic Voting**: Weight votes by token holdings
- **Delegate Voting**: Allow voters to delegate their vote
- **Anonymous Voting**: Zero-knowledge proofs for complete anonymity
- **Multi-Signature Polls**: Require multiple approvals for certain poll types

---

## 👥 Team Members

| Name | Role | LinkedIn |
|------|------|----------|
| `[PLACEHOLDER: Name]` | `[PLACEHOLDER: Role]` | `[PLACEHOLDER: LinkedIn URL]` |
| `[PLACEHOLDER: Name]` | `[PLACEHOLDER: Role]` | `[PLACEHOLDER: LinkedIn URL]` |
| `[PLACEHOLDER: Name]` | `[PLACEHOLDER: Role]` | `[PLACEHOLDER: LinkedIn URL]` |

---

## 🤝 Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Follow the existing TypeScript and React conventions
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Add tests for new features

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Algorand Foundation** for the blockchain infrastructure and development tools
- **AlgoKit Team** for the excellent developer experience
- **shadcn/ui** for the beautiful component library
- **The Algorand Developer Community** for support and resources

---

<div align="center">
  <p>Built with ❤️ for transparent campus governance</p>
  <p>
    <a href="#-live-demo">Live Demo</a> •
    <a href="#-installation--setup">Installation</a> •
    <a href="#-usage-guide">Usage Guide</a> •
    <a href="#-contributing">Contributing</a>
  </p>
</div>
