# 🚀 PredictFi – BlockDAG Hackathon Project

PredictFi is a decentralized prediction and trading platform built on the BlockDAG EVM.  
It provides two complementary modules:

1. Simple Trade Options – short-term UP/DOWN price predictions (15s, 1m, 1h).  
2. Halal Prediction Pool – Sharia-compliant YES/NO risk-sharing markets with refunds and pooled gains.

---

## ✨ Features

### 🔹 Simple Trade Options
- Users stake BDAG and predict Above or Below the entry price.  
- Trades auto-resolve after the chosen timeframe.  
- Winners earn +80% reward, losers lose stake.  
- Optional treasury fee sent to multisig wallet.

### 🔹 Halal Prediction Pool
- Users stake BDAG into YES or NO pools.  
- At resolution:
  - Winners share 20% of losers' pool proportionally.  
  - Losers are refunded 80% of their stake.  
- No zero-sum gambling → designed as a risk-sharing pool.  
- Council wallet (for demo) resolves outcome based on final price.

---

## 🛠 Tech Stack
- Smart Contracts: Solidity (SimpleTradeOptions.sol, HalalPredictionPool.sol)  
- Frontend: Next.js + React + Tailwind + shadcn/ui  
- Wallet: MetaMask (EVM-compatible, BlockDAG testnet)  
- Libraries: ethers.js v6, wagmi, viem  

---

## 📂 Project Structure
