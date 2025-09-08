# 🚀 RiskShare – BlockDAG Hackathon Project

RiskShare is a decentralized prediction and trading platform built on the BlockDAG EVM.  
It provides two complementary modules:

1. Simple Trade Options – short-term UP/DOWN price predictions (15s, 1m, 1h).  
2. Halal Prediction Pool – Sharia-compliant YES/NO risk-sharing markets with refunds and pooled gains.

Demo: risk-share.vercel.app

---

## ✨ Features

### 🔹 Simple Trade Options
- Users stake BDAG and predict Above or Below the entry price.  
- Trades auto-resolve after the chosen timeframe.  
- Winners earn +80% reward, losers lose their stake.  
- Optional treasury fee sent to multisig wallet.

### 🔹 Halal Prediction Pool
- Users stake BDAG in YES or NO pools.  
- At resolution:
  - Winners share 20% of losers' pool proportionally.  
  - Losers are refunded 80% of their stake.  
- No zero-sum gambling, No leverage, No total wipe out → designed as a risk-sharing pool.  
- Council wallet (for demo) resolves outcome based on final price.

---

## 🛠 Tech Stack
- Smart Contracts: Solidity (SimpleTradeOptions.sol, HalalPredictionPool.sol)  
- Frontend: Next.js + React + Tailwind + shadcn/ui  
- Wallet: MetaMask (EVM-compatible, BlockDAG testnet)  
- Libraries: ethers.js v6, wagmi, viem  

---

## 📂 Project Structure
/RiskShare/
├── app/                     # Next.js App Router pages
│   ├── dashboard/           # Dashboard page
│   │   └── page.tsx
│   ├── markets/             # Markets listing page
│   │   └── page.tsx
│   └── trade/               # Trade module (UI + logic)
│       ├── page.tsx
│       ├── layout.tsx
│       └── globals.css
│
├── components/              # Reusable UI + feature components
│   ├── ui/                  # Base UI components (shadcn/ui)
│   ├── network-switcher.tsx # Switch between networks
│   ├── theme-provider.tsx   # Dark/Light theme provider
│   ├── theme-toggle.tsx     # Toggle theme button
│   ├── tradingview-chart.tsx# Live trading chart integration
│   └── wallet-connect-modal.tsx # Wallet connect modal
│
├── contexts/                # React context providers
│   └── wallet-context.tsx   # Wallet connection context
│
├── contracts/               # Contract ABIs
│   ├── HalalPredictionPool.json
│   └── HalalPredictionPool-new.json
│
├── hooks/                   # Custom React hooks
│   ├── use-contract.ts      # Hook to interact with contracts
│   ├── use-mobile.ts        # Responsive helper
│   └── use-toast.ts         # Toast notifications
│
├── lib/                     # Core logic and services
│   ├── contract.ts          # Contract service (ethers.js wrapper)
│   └── utils.ts             # Helper utilities
│
├── public/                  # Static assets (icons, images, etc.)
│
├── styles/                  # Global styles
│   └── globals.css
│
├── .gitignore               # Git ignore rules
├── components.json          # shadcn/ui config
├── next.config.mjs          # Next.js config
├── package.json             # Project metadata & dependencies
├── pnpm-lock.yaml           # Dependency lockfile
├── postcss.config.mjs       # PostCSS config
├── README.md                # Project documentation
└── tsconfig.json            # TypeScript config
