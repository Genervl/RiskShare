"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Check, X, TrendingUp, Clock, Wallet, BarChart3, Plus, Trophy } from "lucide-react"
import { TradingViewChart } from "@/components/tradingview-chart"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet-context"
import { useContract } from "@/hooks/use-contract"
import ThemeToggle from "@/components/theme-toggle"

interface Market {
  id: string
  question: string
  entryPrice: string
  deadline: number
  resolved: boolean
  finalPrice: string
  totalYesBets: string
  totalNoBets: string
  userYesBet: string
  userNoBet: string
  canClaim: boolean
}

const TRADING_PAIRS = [
  { symbol: "BDAG/USD", name: "BlockDAG", basePrice: 0.0178 },
  { symbol: "BTC/USD", name: "Bitcoin", basePrice: 67234.56 },
  { symbol: "ETH/USD", name: "Ethereum", basePrice: 3456.78 },
  { symbol: "SOL/USD", name: "Solana", basePrice: 234.12 },
  { symbol: "ADA/USD", name: "Cardano", basePrice: 1.23 },
]

export default function TradePage() {
  const { isConnected, address, balance, updateBalance, disconnectWallet, getBalanceAsNumber } = useWallet()
  const {
    createMarket,
    placeBet,
    getMarket,
    getUserBets,
    claimWinnings,
    getMarketCount,
    isLoading: contractLoading,
    error: contractError,
    isReady,
  } = useContract()

  const [selectedPair, setSelectedPair] = useState("BDAG/USD")
  const [currentPrice, setCurrentPrice] = useState(0.0178)
  const [betAmount, setBetAmount] = useState("")
  const [timeframe, setTimeframe] = useState("1")
  const [customTimeframe, setCustomTimeframe] = useState("")
  const [priceHistory, setPriceHistory] = useState<{ time: number; value: number }[]>([])

  const [markets, setMarkets] = useState<Market[]>([])
  const [selectedMarket, setSelectedMarket] = useState<string | null>(null)
  const [showCreateMarket, setShowCreateMarket] = useState(false)
  const [newMarketQuestion, setNewMarketQuestion] = useState("")
  const [loadingMarkets, setLoadingMarkets] = useState(false)

  const loadMarkets = async () => {
    if (!isReady) return

    setLoadingMarkets(true)
    try {
      const marketCount = await getMarketCount()
      const marketPromises = []

      for (let i = 0; i < Math.min(marketCount, 10); i++) {
        // Load last 10 markets
        marketPromises.push(loadMarketData(i.toString()))
      }

      const loadedMarkets = await Promise.all(marketPromises)
      setMarkets(loadedMarkets.filter(Boolean) as Market[])
    } catch (error) {
      console.error("[v0] Failed to load markets:", error)
    } finally {
      setLoadingMarkets(false)
    }
  }

  const loadMarketData = async (marketId: string): Promise<Market | null> => {
    try {
      const marketData = await getMarket(marketId)
      const userBets = await getUserBets(marketId, address!)

      return {
        id: marketId,
        question: marketData.question,
        entryPrice: marketData.entryPrice,
        deadline: Number(marketData.deadline),
        resolved: marketData.resolved,
        finalPrice: marketData.finalPrice,
        totalYesBets: marketData.totalYesBets,
        totalNoBets: marketData.totalNoBets,
        userYesBet: userBets.yesBet,
        userNoBet: userBets.noBet,
        canClaim: userBets.canClaim,
      }
    } catch (error) {
      console.error(`[v0] Failed to load market ${marketId}:`, error)
      return null
    }
  }

  useEffect(() => {
    if (isReady && isConnected) {
      loadMarkets()
    }
  }, [isReady, isConnected])

  useEffect(() => {
    const pair = TRADING_PAIRS.find((p) => p.symbol === selectedPair)
    if (pair) {
      setCurrentPrice(pair.basePrice)
      const now = Date.now()
      const getDataPoints = () => {
        if (timeframe === "custom") {
          const minutes = Number.parseInt(customTimeframe) || 30
          return Math.min(minutes * 2, 120) // Max 120 data points for performance
        } else if (timeframe === "60") {
          return 120 // 1 hour = 120 data points (30 second intervals)
        } else {
          return Number.parseInt(timeframe) * 2 // 1 minute = 2 data points (30 second intervals)
        }
      }

      const dataPoints = getDataPoints()
      const intervalMs = 30000 // 30 seconds between data points

      const initialHistory = Array.from({ length: dataPoints }, (_, i) => {
        const timeOffset = (dataPoints - 1 - i) * intervalMs
        return {
          time: Math.floor((now - timeOffset) / 1000),
          value: pair.basePrice + (Math.random() - 0.5) * (pair.basePrice * 0.02),
        }
      })
      setPriceHistory(initialHistory)
      console.log("[v0] TradingView chart data initialized:", initialHistory.length, "points for timeframe:", timeframe)
    }
  }, [selectedPair, timeframe, customTimeframe])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPrice((prev) => {
        const pair = TRADING_PAIRS.find((p) => p.symbol === selectedPair)
        if (!pair) return prev

        const volatility = selectedPair === "BTC/USD" ? 100 : selectedPair === "ETH/USD" ? 50 : 0.001
        const change = (Math.random() - 0.5) * volatility
        const newPrice = Math.max(prev + change, 0.001)

        setPriceHistory((history) => {
          const newEntry = {
            time: Math.floor(Date.now() / 1000),
            value: newPrice,
          }
          const updatedHistory = [...history.slice(-59), newEntry]
          console.log("[v0] TradingView price updated:", newPrice, "History length:", updatedHistory.length)
          return updatedHistory
        })

        return newPrice
      })
    }, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [selectedPair])

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prevMarkets) => {
        return prevMarkets.map((market) => {
          if (!market.resolved && market.deadline <= Date.now() / 1000) {
            return {
              ...market,
              resolved: true,
              finalPrice: currentPrice.toString(),
              canClaim: true,
            }
          }
          return market
        })
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [currentPrice])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-6">Please connect your wallet to start trading</p>
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const placeTrade = async (direction: "yes" | "no", marketId?: string) => {
    const amount = Number.parseFloat(betAmount)
    const numericBalance = getBalanceAsNumber()

    if (!amount || amount <= 0) {
      alert("Please enter a valid bet amount")
      return
    }

    if (amount > numericBalance) {
      alert("Insufficient balance")
      return
    }

    if (!isConnected || !isReady) {
      alert("Please connect your wallet and ensure you're on BlockDAG network")
      return
    }

    try {
      let targetMarketId = marketId

      // If no market selected, create a new one
      if (!targetMarketId && showCreateMarket) {
        const timeframeMinutes = timeframe === "custom" ? Number.parseInt(customTimeframe) : Number.parseInt(timeframe)
        const question =
          newMarketQuestion ||
          `Will ${selectedPair} price go ${direction.toUpperCase()} from $${currentPrice.toFixed(selectedPair === "BDAG/USD" ? 4 : 2)} in ${timeframeMinutes} minute${timeframeMinutes !== 1 ? "s" : ""}?`

        console.log("[v0] Creating new market...")
        targetMarketId = await createMarket(question, "0.001", timeframeMinutes)
      }

      if (!targetMarketId) {
        alert("Please select a market or create a new one")
        return
      }

      console.log("[v0] Placing bet on market:", targetMarketId)
      const txHash = await placeBet(targetMarketId, direction === "yes", amount.toString())

      console.log("[v0] Bet placed successfully:", { marketId: targetMarketId, txHash })

      // Refresh market data
      await loadMarkets()
      updateBalance(numericBalance - amount)
      setBetAmount("")
      setNewMarketQuestion("")
      setShowCreateMarket(false)

      alert(`Bet placed successfully! Transaction: ${txHash}`)
    } catch (error: any) {
      console.error("[v0] Failed to place bet:", error)
      alert(`Failed to place bet: ${error.message}`)
    }
  }

  const handleClaimWinnings = async (marketId: string) => {
    try {
      console.log("[v0] Claiming winnings for market:", marketId)
      const txHash = await claimWinnings(marketId)

      // Refresh market data and balance
      await loadMarkets()
      // Balance will be updated by the contract

      alert(`Winnings claimed successfully! Transaction: ${txHash}`)
    } catch (error: any) {
      console.error("[v0] Failed to claim winnings:", error)
      alert(`Failed to claim winnings: ${error.message}`)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const priceChange = priceHistory.length > 1 ? currentPrice - priceHistory[priceHistory.length - 2].value : 0

  const numericBalance = getBalanceAsNumber()
  const betAmountNum = Number.parseFloat(betAmount)
  const isValidBet = betAmountNum > 0 && betAmountNum <= numericBalance && isConnected

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">RiskShare</span>
          </Link>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg border border-border">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-mono text-sm">{numericBalance.toFixed(3)} BDAG</span>
                <span className="text-xs text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
            <ThemeToggle /> {/* Insert the ThemeToggle component here */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Prediction Pools</h1>
          <p className="text-muted-foreground">Create or join markets to predict price movements and win BDAG</p>
           <div className="flex justify-end">
              <Button asChild>
                <Link href="https://v0-bdagtradingapp1-one.vercel.app/">Simple Trade</Link>
              </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <Select value={selectedPair} onValueChange={setSelectedPair}>
                        <SelectTrigger className="w-48 bg-input border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TRADING_PAIRS.map((pair) => (
                            <SelectItem key={pair.symbol} value={pair.symbol}>
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{pair.symbol}</span>
                                <span className="text-muted-foreground text-sm">({pair.name})</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium font-mono"
                          style={{
                            backgroundColor: priceChange >= 0 ? "#16a34a" : "#dc2626",
                            color: "#ffffff",
                            border: `1px solid ${priceChange >= 0 ? "#16a34a" : "#dc2626"}`,
                          }}
                        >
                          ${currentPrice.toFixed(selectedPair === "BDAG/USD" ? 4 : 2)}
                        </span>
                      </CardTitle>
                      <CardDescription className={priceChange >= 0 ? "text-primary" : "text-destructive"}>
                        {priceChange >= 0 ? "+" : ""}
                        {priceChange.toFixed(selectedPair === "BDAG/USD" ? 4 : 2)} (
                        {((priceChange / currentPrice) * 100).toFixed(2)}%)
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Live</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <TradingViewChart
                  data={priceHistory}
                  symbol={selectedPair}
                  height={300}
                  timeframe={timeframe}
                  customTimeframe={customTimeframe}
                />
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Available Markets</CardTitle>
                    <CardDescription>Select an existing market or create a new one</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowCreateMarket(!showCreateMarket)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Market
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {showCreateMarket && (
                  <div className="bg-muted/10 p-4 rounded-lg border border-border space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Market Question</label>
                      <Input
                        placeholder="Enter your prediction question..."
                        value={newMarketQuestion}
                        onChange={(e) => setNewMarketQuestion(e.target.value)}
                        className="bg-input border-border"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Timeframe</label>
                        <Select value={timeframe} onValueChange={setTimeframe}>
                          <SelectTrigger className="bg-input border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 minute</SelectItem>
                            <SelectItem value="60">1 hour</SelectItem>
                            <SelectItem value="custom">Custom</SelectItem>
                          </SelectContent>
                        </Select>
                        {timeframe === "custom" && (
                          <Input
                            type="number"
                            placeholder="Enter minutes (1-1440)"
                            value={customTimeframe}
                            onChange={(e) => setCustomTimeframe(e.target.value)}
                            className="bg-input border-border mt-2"
                            min="1"
                            max="1440"
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Bet Amount</label>
                        <Input
                          type="number"
                          placeholder="Enter bet amount"
                          value={betAmount}
                          onChange={(e) => setBetAmount(e.target.value)}
                          className="bg-input border-border"
                          step="0.001"
                          min="0"
                          max={numericBalance}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {loadingMarkets ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Loading markets...</p>
                  </div>
                ) : markets.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No markets available. Create the first one!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {markets.map((market) => (
                      <div
                        key={market.id}
                        className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                          selectedMarket === market.id
                            ? "border-primary bg-primary/5"
                            : "border-border bg-muted/10 hover:bg-muted/20"
                        }`}
                        onClick={() => setSelectedMarket(selectedMarket === market.id ? null : market.id)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-sm">{market.question}</h4>
                            <div className="flex items-center gap-2">
                              {market.resolved && (
                                <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">
                                  Resolved
                                </span>
                              )}
                              {market.canClaim && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleClaimWinnings(market.id)
                                  }}
                                >
                                  <Trophy className="w-3 h-3 mr-1" />
                                  Claim
                                </Button>
                              )}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Entry Price: ${Number(market.entryPrice).toFixed(4)}</span>
                            <span>Deadline: {new Date(Number(market.deadline) * 1000).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-green-600">
                              YES Pool: {Number(market.totalYesBets).toFixed(3)} BDAG
                            </span>
                            <span className="text-red-600">NO Pool: {Number(market.totalNoBets).toFixed(3)} BDAG</span>
                          </div>
                          {(Number(market.userYesBet) > 0 || Number(market.userNoBet) > 0) && (
                            <div className="flex justify-between text-xs text-blue-600">
                              <span>Your YES: {Number(market.userYesBet).toFixed(3)} BDAG</span>
                              <span>Your NO: {Number(market.userNoBet).toFixed(3)} BDAG</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {(selectedMarket || showCreateMarket) && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Place Your Bet</CardTitle>
                  <CardDescription>
                    {selectedMarket
                      ? `Betting on: ${markets.find((m) => m.id === selectedMarket)?.question}`
                      : "Creating new market and placing bet"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!showCreateMarket && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Bet Amount</label>
                      <Input
                        type="number"
                        placeholder="Enter bet amount"
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                        className="bg-input border-border"
                        step="0.001"
                        min="0"
                        max={numericBalance}
                      />
                      {Number.parseFloat(betAmount) > numericBalance && (
                        <p className="text-xs text-destructive">Insufficient balance</p>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      className="h-20 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col disabled:opacity-50"
                      onClick={() => placeTrade("yes", selectedMarket || undefined)}
                      disabled={
                        !betAmount ||
                        Number.parseFloat(betAmount) <= 0 ||
                        Number.parseFloat(betAmount) > numericBalance ||
                        contractLoading
                      }
                    >
                      <Check className="w-8 h-8 mb-2" />
                      <span className="text-lg font-bold">{contractLoading ? "Processing..." : "YES"}</span>
                      <span className="text-sm opacity-80">Bet YES</span>
                    </Button>
                    <Button
                      className="h-20 bg-destructive hover:bg-destructive/90 text-destructive-foreground flex flex-col disabled:opacity-50"
                      onClick={() => placeTrade("no", selectedMarket || undefined)}
                      disabled={
                        !betAmount ||
                        Number.parseFloat(betAmount) <= 0 ||
                        Number.parseFloat(betAmount) > numericBalance ||
                        contractLoading
                      }
                    >
                      <X className="w-8 h-8 mb-2" />
                      <span className="text-lg font-bold">{contractLoading ? "Processing..." : "NO"}</span>
                      <span className="text-sm opacity-80">Bet NO</span>
                    </Button>
                  </div>

                  {contractError && (
                    <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                      <p className="text-sm text-destructive">Contract Error: {contractError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Your Positions
                </CardTitle>
                <CardDescription>
                  {markets.filter((m) => Number(m.userYesBet) > 0 || Number(m.userNoBet) > 0).length} active positions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {markets.filter((m) => Number(m.userYesBet) > 0 || Number(m.userNoBet) > 0).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No active positions. Place your first bet!</p>
                ) : (
                  markets
                    .filter((m) => Number(m.userYesBet) > 0 || Number(m.userNoBet) > 0)
                    .slice(0, 5)
                    .map((market) => (
                      <div key={market.id} className="bg-muted/10 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{market.question}</span>
                          {market.resolved ? (
                            <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Resolved</span>
                          ) : (
                            <span className="text-xs bg-blue-500/20 text-blue-600 px-2 py-1 rounded">Active</span>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>YES: {Number(market.userYesBet).toFixed(3)} BDAG</span>
                          <span>NO: {Number(market.userNoBet).toFixed(3)} BDAG</span>
                        </div>
                        {market.canClaim && (
                          <Button size="sm" className="w-full" onClick={() => handleClaimWinnings(market.id)}>
                            <Trophy className="w-3 h-3 mr-1" />
                            Claim Winnings
                          </Button>
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Trade History
                </CardTitle>
                <CardDescription>{markets.filter((m) => m.resolved).length} completed trades</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {markets.filter((m) => m.resolved).length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No completed trades yet</p>
                ) : (
                  markets
                    .filter((m) => m.resolved)
                    .slice(0, 5)
                    .map((market) => (
                      <div key={market.id} className="bg-muted/10 p-3 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{market.question}</span>
                          <span className="text-xs bg-green-500/20 text-green-600 px-2 py-1 rounded">Resolved</span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Entry Price: ${Number(market.entryPrice).toFixed(4)}</span>
                          <span>Final Price: ${Number(market.finalPrice).toFixed(4)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">
                            YES Pool: {Number(market.totalYesBets).toFixed(3)} BDAG
                          </span>
                          <span className="text-red-600">NO Pool: {Number(market.totalNoBets).toFixed(3)} BDAG</span>
                        </div>
                        {(Number(market.userYesBet) > 0 || Number(market.userNoBet) > 0) && (
                          <div className="flex justify-between text-xs text-blue-600">
                            <span>Your YES: {Number(market.userYesBet).toFixed(3)} BDAG</span>
                            <span>Your NO: {Number(market.userNoBet).toFixed(3)} BDAG</span>
                          </div>
                        )}
                      </div>
                    ))
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Session Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Markets:</span>
                  <span className="font-mono">{markets.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Active Markets:</span>
                  <span className="font-mono">{markets.filter((m) => !m.resolved).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Resolved Markets:</span>
                  <span className="font-mono">{markets.filter((m) => m.resolved).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Win Rate:</span>
                  <span className="font-mono">
                    {(markets.filter(
                      (m) => m.resolved && Number(m.userYesBet) > 0 && Number(m.finalPrice) > Number(m.entryPrice),
                    ).length /
                      markets.filter((m) => m.resolved).length) *
                      100 || 0}
                    %
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
