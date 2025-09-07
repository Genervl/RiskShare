import { ethers } from "ethers"
import contractABI from "../contracts/HalalPredictionPool-new.json"

// Contract configuration
export const CONTRACT_ADDRESS = "0x37c301ae2844c4970c2d1a1e2d3a0fd4c1ed4e37"
export const CONTRACT_ABI = contractABI.abi

export const BLOCKDAG_NETWORK = {
  chainId: "0x413", // 1043 in hex
  chainName: "Primordial BlockDAG Testnet",
  nativeCurrency: {
    name: "BDAG",
    symbol: "BDAG",
    decimals: 18,
  },
  rpcUrls: ["https://rpc.primordial.bdagscan.com"],
  blockExplorerUrls: ["https://primordial.bdagscan.com/"],
}

export class ContractService {
  private contract: ethers.Contract | null = null
  private signer: ethers.Signer | null = null

  constructor(signer?: ethers.Signer) {
    if (signer) {
      this.signer = signer
      this.contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
    }
  }

  // Create a new prediction market
  async createQuickMarket(question: string, entryPrice: string, durationMinutes: number) {
    if (!this.contract) throw new Error("Contract not initialized")

    const entryPriceWei = ethers.parseEther(entryPrice)
    const durationSeconds = durationMinutes * 60

    console.log("[v0] Creating market:", { question, entryPrice, durationMinutes })

    const tx = await this.contract.createQuickMarket(question, entryPriceWei, durationSeconds)
    const receipt = await tx.wait()

    // Get market ID from event
    const marketCreatedEvent = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id("MarketCreated(uint256,string,uint256)"),
    )

    if (marketCreatedEvent) {
      const marketId = ethers.getBigInt(marketCreatedEvent.topics[1])
      console.log("[v0] Market created with ID:", marketId.toString())
      return marketId.toString()
    }

    throw new Error("Market creation failed")
  }

  // Create market with specific deadline (alternative to createQuickMarket)
  async createMarket(question: string, entryPrice: string, deadline: number) {
    if (!this.contract) throw new Error("Contract not initialized")

    const entryPriceWei = ethers.parseEther(entryPrice)

    console.log("[v0] Creating market with deadline:", { question, entryPrice, deadline })

    const tx = await this.contract.createMarket(question, entryPriceWei, deadline)
    const receipt = await tx.wait()

    // Get market ID from event
    const marketCreatedEvent = receipt.logs.find(
      (log: any) => log.topics[0] === ethers.id("MarketCreated(uint256,string,uint256)"),
    )

    if (marketCreatedEvent) {
      const marketId = ethers.getBigInt(marketCreatedEvent.topics[1])
      console.log("[v0] Market created with ID:", marketId.toString())
      return marketId.toString()
    }

    throw new Error("Market creation failed")
  }

  // Place a bet on a market
  async placeBet(marketId: string, isYes: boolean, amount: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    const amountWei = ethers.parseEther(amount)

    console.log("[v0] Placing bet:", { marketId, isYes, amount })

    const tx = await this.contract.bet(marketId, isYes, { value: amountWei })
    const receipt = await tx.wait()

    console.log("[v0] Bet placed successfully:", receipt.hash)
    return receipt.hash
  }

  // Resolve market (council only)
  async resolveMarket(marketId: string, finalPrice: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    const finalPriceWei = ethers.parseEther(finalPrice)

    console.log("[v0] Resolving market:", { marketId, finalPrice })

    const tx = await this.contract.resolve(marketId, finalPriceWei)
    const receipt = await tx.wait()

    console.log("[v0] Market resolved successfully:", receipt.hash)
    return receipt.hash
  }

  // Get market details
  async getMarket(marketId: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    const market = await this.contract.markets(marketId)

    return {
      question: market.question,
      entryPrice: ethers.formatEther(market.entryPrice),
      deadline: Number(market.deadline),
      yesPool: ethers.formatEther(market.yesPool),
      noPool: ethers.formatEther(market.noPool),
      resolved: market.resolved,
      outcome: market.outcome,
      finalPrice: ethers.formatEther(market.finalPrice),
      oneSidedRefund: market.oneSidedRefund,
    }
  }

  // Get user's bets on a market
  async getUserBets(marketId: string, userAddress: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    const yesBet = await this.contract.yesBets(marketId, userAddress)
    const noBet = await this.contract.noBets(marketId, userAddress)

    return {
      yesBet: ethers.formatEther(yesBet),
      noBet: ethers.formatEther(noBet),
    }
  }

  // Claim winnings
  async claimWinnings(marketId: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    console.log("[v0] Claiming winnings for market:", marketId)

    const tx = await this.contract.claim(marketId)
    const receipt = await tx.wait()

    console.log("[v0] Winnings claimed successfully:", receipt.hash)
    return receipt.hash
  }

  // Check if user has claimed
  async hasClaimed(marketId: string, userAddress: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    return await this.contract.claimed(marketId, userAddress)
  }

  // Get market count
  async getMarketCount() {
    if (!this.contract) throw new Error("Contract not initialized")

    try {
      console.log("[v0] Attempting to get market count...")

      const isContractValid = await this.validateContract()
      if (!isContractValid) {
        console.log("[v0] Using fallback mode - returning 0 markets")
        return 0
      }

      const count = await this.contract.marketCount()
      console.log("[v0] Market count retrieved successfully:", count.toString())
      return Number(count)
    } catch (error: any) {
      console.error("[v0] Failed to get market count:", error)
      console.log("[v0] Using fallback mode - returning 0 markets")
      return 0
    }
  }

  // Get council address
  async getCouncil() {
    if (!this.contract) throw new Error("Contract not initialized")
    return await this.contract.council()
  }

  // Get loser fee in basis points
  async getLoserFeeBps() {
    if (!this.contract) throw new Error("Contract not initialized")
    const fee = await this.contract.loserFeeBps()
    return Number(fee)
  }

  // Set council (owner only)
  async setCouncil(councilAddress: string) {
    if (!this.contract) throw new Error("Contract not initialized")

    console.log("[v0] Setting council:", councilAddress)

    const tx = await this.contract.setCouncil(councilAddress)
    const receipt = await tx.wait()

    console.log("[v0] Council updated successfully:", receipt.hash)
    return receipt.hash
  }

  // Set loser fee (owner only)
  async setLoserFeeBps(bps: number) {
    if (!this.contract) throw new Error("Contract not initialized")

    console.log("[v0] Setting loser fee:", bps)

    const tx = await this.contract.setLoserFeeBps(bps)
    const receipt = await tx.wait()

    console.log("[v0] Loser fee updated successfully:", receipt.hash)
    return receipt.hash
  }

  // Get all markets (paginated)
  async getAllMarkets(startId = 0, limit = 10) {
    if (!this.contract) throw new Error("Contract not initialized")

    try {
      const isContractValid = await this.validateContract()
      if (!isContractValid) {
        console.log("[v0] No contract available - returning mock markets for demo")
        return {
          markets: this.getMockMarkets(),
          total: 3,
          hasMore: false,
        }
      }

      const marketCount = await this.getMarketCount()

      if (marketCount === 0) {
        console.log("[v0] No markets found - returning mock markets for demo")
        return {
          markets: this.getMockMarkets(),
          total: 3,
          hasMore: false,
        }
      }

      const markets = []
      const endId = Math.min(startId + limit, marketCount)

      for (let i = startId; i < endId; i++) {
        try {
          const market = await this.getMarket(i.toString())
          markets.push({
            id: i.toString(),
            ...market,
          })
        } catch (error) {
          console.warn(`Failed to fetch market ${i}:`, error)
        }
      }

      return {
        markets,
        total: marketCount,
        hasMore: endId < marketCount,
      }
    } catch (error) {
      console.error("[v0] Failed to get markets, using fallback:", error)
      return {
        markets: this.getMockMarkets(),
        total: 3,
        hasMore: false,
      }
    }
  }

  // Listen to contract events
  setupEventListeners(callbacks: {
    onMarketCreated?: (marketId: string, question: string, deadline: number) => void
    onBetPlaced?: (marketId: string, user: string, side: boolean, amount: string) => void
    onMarketResolved?: (marketId: string, outcome: boolean, finalPrice: string) => void
    onClaimed?: (marketId: string, user: string, amount: string) => void
  }) {
    if (!this.contract) throw new Error("Contract not initialized")

    // Market Created Event
    if (callbacks.onMarketCreated) {
      this.contract.on("MarketCreated", (id, question, deadline) => {
        callbacks.onMarketCreated!(id.toString(), question, Number(deadline))
      })
    }

    // Bet Placed Event
    if (callbacks.onBetPlaced) {
      this.contract.on("BetPlaced", (id, user, side, amount) => {
        callbacks.onBetPlaced!(id.toString(), user, side, ethers.formatEther(amount))
      })
    }

    // Market Resolved Event
    if (callbacks.onMarketResolved) {
      this.contract.on("MarketResolved", (id, outcome, finalPrice, oneSidedRefund) => {
        callbacks.onMarketResolved!(id.toString(), outcome, ethers.formatEther(finalPrice))
      })
    }

    // Claimed Event
    if (callbacks.onClaimed) {
      this.contract.on("Claimed", (id, user, amount) => {
        callbacks.onClaimed!(id.toString(), user, ethers.formatEther(amount))
      })
    }
  }

  // Remove all event listeners
  removeAllListeners() {
    if (this.contract) {
      this.contract.removeAllListeners()
    }
  }

  async validateContract() {
    if (!this.signer) throw new Error("Signer not available")

    try {
      const provider = this.signer.provider
      if (!provider) throw new Error("Provider not available")

      // Check if there's code at the contract address
      const code = await provider.getCode(CONTRACT_ADDRESS)
      console.log("[v0] Contract code at address:", code)

      if (code === "0x") {
        console.warn(`[v0] No contract found at address ${CONTRACT_ADDRESS} on this network. Using fallback mode.`)
        console.warn(`[v0] Please verify:`)
        console.warn(`[v0] 1. Contract is deployed at: ${CONTRACT_ADDRESS}`)
        console.warn(`[v0] 2. You're connected to: Primordial BlockDAG Testnet (Chain ID: 1043)`)
        console.warn(`[v0] 3. RPC URL is working: https://rpc.primordial.bdagscan.com`)
        return false
      }

      // Try to call a simple view function to test connectivity
      const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)
      const marketCount = await tempContract.marketCount()
      console.log("[v0] Contract validation successful, market count:", marketCount.toString())

      return true
    } catch (error) {
      console.warn("[v0] Contract validation failed, using fallback mode:", error)
      return false
    }
  }

  private getMockMarkets() {
    return [
      {
        id: "0",
        question: "Will BDAG price be above $0.05 in 1 hour?",
        entryPrice: "0.01",
        deadline: Date.now() + 3600000, // 1 hour from now
        yesPool: "2.5",
        noPool: "1.8",
        resolved: false,
        outcome: false,
        finalPrice: "0",
        oneSidedRefund: false,
      },
      {
        id: "1",
        question: "Will BDAG reach $0.10 by end of day?",
        entryPrice: "0.02",
        deadline: Date.now() + 86400000, // 24 hours from now
        yesPool: "5.2",
        noPool: "3.1",
        resolved: false,
        outcome: false,
        finalPrice: "0",
        oneSidedRefund: false,
      },
      {
        id: "2",
        question: "Will BDAG trading volume exceed 1M today?",
        entryPrice: "0.015",
        deadline: Date.now() + 43200000, // 12 hours from now
        yesPool: "1.9",
        noPool: "2.7",
        resolved: false,
        outcome: false,
        finalPrice: "0",
        oneSidedRefund: false,
      },
    ]
  }
}

// Helper function to add BlockDAG network to wallet
export async function addBlockDAGNetwork() {
  if (!window.ethereum) throw new Error("No wallet found")

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [BLOCKDAG_NETWORK],
    })
  } catch (error) {
    console.error("Failed to add BlockDAG network:", error)
    throw error
  }
}

// Helper function to switch to BlockDAG network
export async function switchToBlockDAG() {
  if (!window.ethereum) throw new Error("No wallet found")

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: BLOCKDAG_NETWORK.chainId }],
    })
  } catch (error: any) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      await addBlockDAGNetwork()
    } else {
      throw error
    }
  }
}
