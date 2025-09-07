"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  Trophy,
  Target,
  ArrowUp,
  ArrowDown,
  Crown,
  Medal,
  Star,
  Flame,
  BarChart3,
  Wallet,
} from "lucide-react"
import Link from "next/link"
import { useWallet } from "@/contexts/wallet-context"

interface TradeHistory {
  id: string
  asset: string
  direction: "over" | "under"
  amount: number
  payout: number
  result: "won" | "lost"
  timestamp: Date
  duration: number
}

interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlocked: boolean
  progress: number
  maxProgress: number
}

interface LeaderboardEntry {
  rank: number
  address: string
  winRate: number
  totalTrades: number
  profit: number
}

export default function DashboardPage() {
  const { isConnected, address, balance, disconnectWallet } = useWallet()
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [userLevel, setUserLevel] = useState(1)
  const [userXP, setUserXP] = useState(150)
  const [winStreak, setWinStreak] = useState(3)

  // Mock data initialization
  useEffect(() => {
    // Generate mock trade history
    const mockTrades: TradeHistory[] = [
      {
        id: "1",
        asset: "BTC/USD",
        direction: "over",
        amount: 0.1,
        payout: 0.21,
        result: "won",
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        duration: 5,
      },
      {
        id: "2",
        asset: "BDAG/USD",
        direction: "under",
        amount: 0.05,
        payout: 0,
        result: "lost",
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        duration: 15,
      },
      {
        id: "3",
        asset: "BTC/USD",
        direction: "over",
        amount: 0.2,
        payout: 0.42,
        result: "won",
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        duration: 10,
      },
      {
        id: "4",
        asset: "SOL/USD",
        direction: "under",
        amount: 0.15,
        payout: 0.27,
        result: "won",
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        duration: 5,
      },
    ]
    setTradeHistory(mockTrades)

    // Generate mock achievements
    const mockAchievements: Achievement[] = [
      {
        id: "1",
        title: "First Trade",
        description: "Complete your first prediction",
        icon: "🎯",
        unlocked: true,
        progress: 1,
        maxProgress: 1,
      },
      {
        id: "2",
        title: "Hot Streak",
        description: "Win 5 trades in a row",
        icon: "🔥",
        unlocked: false,
        progress: 3,
        maxProgress: 5,
      },
      {
        id: "3",
        title: "High Roller",
        description: "Place a bet of 1 BDAG or more",
        icon: "💎",
        unlocked: false,
        progress: 0,
        maxProgress: 1,
      },
      {
        id: "4",
        title: "Speed Trader",
        description: "Complete 10 trades in 1 minute timeframe",
        icon: "⚡",
        unlocked: false,
        progress: 2,
        maxProgress: 10,
      },
    ]
    setAchievements(mockAchievements)

    // Generate mock leaderboard
    const mockLeaderboard: LeaderboardEntry[] = [
      { rank: 1, address: "0x1234...5678", winRate: 78.5, totalTrades: 156, profit: 12.45 },
      { rank: 2, address: "0x9876...4321", winRate: 76.2, totalTrades: 203, profit: 11.23 },
      { rank: 3, address: "0x5555...9999", winRate: 74.8, totalTrades: 89, profit: 8.67 },
      { rank: 4, address: address || "0xabcd...efgh", winRate: 72.1, totalTrades: 45, profit: 5.34 },
      { rank: 5, address: "0x1111...2222", winRate: 69.3, totalTrades: 178, profit: 4.89 },
    ]
    setLeaderboard(mockLeaderboard)
  }, [address])

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Wallet Not Connected</h2>
          <p className="text-muted-foreground mb-6">Please connect your wallet to view your dashboard</p>
          <Button asChild>
            <Link href="/">Go Back Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalTrades = tradeHistory.length
  const wonTrades = tradeHistory.filter((t) => t.result === "won").length
  const winRate = totalTrades > 0 ? (wonTrades / totalTrades) * 100 : 0
  const totalProfit = tradeHistory.reduce(
    (sum, trade) => sum + (trade.result === "won" ? trade.payout - trade.amount : -trade.amount),
    0,
  )
  const nextLevelXP = userLevel * 200

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">RiskShare</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/trade" className="text-muted-foreground hover:text-foreground transition-colors">
              Trade
            </Link>
            <Link href="/dashboard" className="text-foreground font-medium">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-card px-3 py-2 rounded-lg border border-border">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="font-mono text-sm">{balance.toFixed(3)} BDAG</span>
                <span className="text-xs text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* User Profile Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <Crown className="w-8 h-8 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Trader Dashboard</h1>
                <p className="text-muted-foreground">
                  {address?.slice(0, 8)}...{address?.slice(-6)}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Star className="w-5 h-5 text-primary" />
                <span className="text-lg font-bold">Level {userLevel}</span>
              </div>
              <div className="w-32">
                <Progress value={(userXP / nextLevelXP) * 100} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {userXP}/{nextLevelXP} XP
                </p>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                    <p className="text-xl font-bold text-primary">{winRate.toFixed(1)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-secondary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Total Trades</p>
                    <p className="text-xl font-bold">{totalTrades}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Profit/Loss</p>
                    <p className={`text-xl font-bold ${totalProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                      {totalProfit >= 0 ? "+" : ""}
                      {totalProfit.toFixed(3)} BDAG
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Flame className="w-5 h-5 text-accent" />
                  <div>
                    <p className="text-sm text-muted-foreground">Win Streak</p>
                    <p className="text-xl font-bold text-accent">{winStreak}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Trade History</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Performance Chart */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Performance Overview</CardTitle>
                  <CardDescription>Your trading performance over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-muted/10 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Performance Chart</p>
                      <p className="text-sm text-muted-foreground">Coming Soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Your latest trades and achievements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {tradeHistory.slice(0, 3).map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-3 bg-muted/10 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {trade.direction === "over" ? (
                          <ArrowUp className="w-4 h-4 text-primary" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{trade.asset}</p>
                          <p className="text-xs text-muted-foreground">{trade.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: trade.result === "won" ? "#16a34a" : "#dc2626",
                            color: "#ffffff",
                          }}
                        >
                          {trade.result === "won" ? "+" : "-"}
                          {trade.amount.toFixed(3)} BDAG
                        </span>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/trade">Start Trading</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>Complete record of all your trades</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {tradeHistory.map((trade) => (
                    <div key={trade.id} className="flex items-center justify-between p-4 bg-muted/10 rounded-lg">
                      <div className="flex items-center space-x-4">
                        {trade.direction === "over" ? (
                          <ArrowUp className="w-5 h-5 text-primary" />
                        ) : (
                          <ArrowDown className="w-5 h-5 text-destructive" />
                        )}
                        <div>
                          <p className="font-medium">{trade.asset}</p>
                          <p className="text-sm text-muted-foreground">
                            {trade.timestamp.toLocaleString()} • {trade.duration}m duration
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Bet: {trade.amount.toFixed(3)} BDAG</p>
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                          style={{
                            backgroundColor: trade.result === "won" ? "#16a34a" : "#dc2626",
                            color: "#ffffff",
                          }}
                        >
                          {trade.result === "won"
                            ? `Won +${(trade.payout - trade.amount).toFixed(3)} BDAG`
                            : `Lost -${trade.amount.toFixed(3)} BDAG`}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`bg-card border-border ${achievement.unlocked ? "ring-2 ring-primary/20" : ""}`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className={`text-3xl ${achievement.unlocked ? "" : "grayscale opacity-50"}`}>
                        {achievement.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{achievement.title}</h3>
                          {achievement.unlocked && <Medal className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{achievement.description}</p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                          <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  <span>Global Leaderboard</span>
                </CardTitle>
                <CardDescription>Top traders on RiskShare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.rank}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        entry.address === address ? "bg-primary/10 border border-primary/20" : "bg-muted/10"
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            entry.rank === 1
                              ? "bg-yellow-500 text-black"
                              : entry.rank === 2
                                ? "bg-gray-400 text-black"
                                : entry.rank === 3
                                  ? "bg-amber-600 text-white"
                                  : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-medium">
                            {entry.address === address
                              ? "You"
                              : `${entry.address.slice(0, 8)}...${entry.address.slice(-4)}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {entry.totalTrades} trades • {entry.winRate.toFixed(1)}% win rate
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">+{entry.profit.toFixed(2)} BDAG</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
