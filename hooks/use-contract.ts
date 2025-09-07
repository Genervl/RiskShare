"use client"

import { useState, useEffect, useCallback } from "react"
import { ContractService, switchToBlockDAG } from "@/lib/contract"
import { useWallet } from "@/contexts/wallet-context"

export function useContract() {
  const { signer, isConnected, chainId } = useWallet()
  const [contractService, setContractService] = useState<ContractService | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (signer && isConnected) {
      const service = new ContractService(signer)
      setContractService(service)
      console.log("[v0] Contract service initialized")
    } else {
      setContractService(null)
    }
  }, [signer, isConnected])

  const ensureCorrectNetwork = useCallback(async () => {
    if (chainId !== 1043) {
      console.log("[v0] Switching to BlockDAG network")
      await switchToBlockDAG()
      return true
    }
    return true
  }, [chainId])

  const createMarket = useCallback(
    async (question: string, entryPrice: string, durationMinutes: number) => {
      if (!contractService) throw new Error("Contract not initialized")

      setIsLoading(true)
      setError(null)

      try {
        await ensureCorrectNetwork()
        console.log("[v0] Creating market:", { question, entryPrice, durationMinutes })
        const marketId = await contractService.createQuickMarket(question, entryPrice, durationMinutes)
        console.log("[v0] Market created successfully:", marketId)
        return marketId
      } catch (err: any) {
        console.error("[v0] Failed to create market:", err)
        setError(err.message || "Failed to create market")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contractService, ensureCorrectNetwork],
  )

  const placeBet = useCallback(
    async (marketId: string, isYes: boolean, amount: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      setIsLoading(true)
      setError(null)

      try {
        await ensureCorrectNetwork()
        console.log("[v0] Placing bet:", { marketId, isYes, amount })
        const txHash = await contractService.placeBet(marketId, isYes, amount)
        console.log("[v0] Bet placed successfully:", txHash)
        return txHash
      } catch (err: any) {
        console.error("[v0] Failed to place bet:", err)
        setError(err.message || "Failed to place bet")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contractService, ensureCorrectNetwork],
  )

  const getMarket = useCallback(
    async (marketId: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      try {
        console.log("[v0] Getting market:", marketId)
        const market = await contractService.getMarket(marketId)
        console.log("[v0] Market data:", market)
        return market
      } catch (err: any) {
        console.error("[v0] Failed to get market:", err)
        setError(err.message || "Failed to get market")
        throw err
      }
    },
    [contractService],
  )

  const claimWinnings = useCallback(
    async (marketId: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      setIsLoading(true)
      setError(null)

      try {
        await ensureCorrectNetwork()
        console.log("[v0] Claiming winnings:", marketId)
        const txHash = await contractService.claimWinnings(marketId)
        console.log("[v0] Winnings claimed successfully:", txHash)
        return txHash
      } catch (err: any) {
        console.error("[v0] Failed to claim winnings:", err)
        setError(err.message || "Failed to claim winnings")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contractService, ensureCorrectNetwork],
  )

  const getUserBets = useCallback(
    async (marketId: string, userAddress: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      try {
        console.log("[v0] Getting user bets:", { marketId, userAddress })
        const bets = await contractService.getUserBets(marketId, userAddress)
        console.log("[v0] User bets:", bets)
        return bets
      } catch (err: any) {
        console.error("[v0] Failed to get user bets:", err)
        setError(err.message || "Failed to get user bets")
        throw err
      }
    },
    [contractService],
  )

  const hasClaimed = useCallback(
    async (marketId: string, userAddress: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      try {
        return await contractService.hasClaimed(marketId, userAddress)
      } catch (err: any) {
        console.error("[v0] Failed to check claim status:", err)
        throw err
      }
    },
    [contractService],
  )

  const getMarketCount = useCallback(async () => {
    if (!contractService) throw new Error("Contract not initialized")

    try {
      return await contractService.getMarketCount()
    } catch (err: any) {
      console.error("[v0] Failed to get market count:", err)
      throw err
    }
  }, [contractService])

  const getAllMarkets = useCallback(
    async (startId = 0, limit = 10) => {
      if (!contractService) throw new Error("Contract not initialized")

      try {
        console.log("[v0] Getting all markets:", { startId, limit })
        const result = await contractService.getAllMarkets(startId, limit)
        console.log("[v0] Markets fetched:", result)
        return result
      } catch (err: any) {
        console.error("[v0] Failed to get markets:", err)
        setError(err.message || "Failed to get markets")
        throw err
      }
    },
    [contractService],
  )

  const resolveMarket = useCallback(
    async (marketId: string, finalPrice: string) => {
      if (!contractService) throw new Error("Contract not initialized")

      setIsLoading(true)
      setError(null)

      try {
        await ensureCorrectNetwork()
        console.log("[v0] Resolving market:", { marketId, finalPrice })
        const txHash = await contractService.resolveMarket(marketId, finalPrice)
        console.log("[v0] Market resolved successfully:", txHash)
        return txHash
      } catch (err: any) {
        console.error("[v0] Failed to resolve market:", err)
        setError(err.message || "Failed to resolve market")
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    [contractService, ensureCorrectNetwork],
  )

  return {
    contractService,
    isLoading,
    error,
    createMarket,
    placeBet,
    getMarket,
    claimWinnings,
    getUserBets,
    hasClaimed,
    getMarketCount,
    getAllMarkets,
    resolveMarket,
    isReady: !!contractService && isConnected,
  }
}
