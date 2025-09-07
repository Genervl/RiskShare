"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useContract } from "@/hooks/use-contract"
import { useWallet } from "@/contexts/wallet-context"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"

interface Market {
  id: string
  question: string
  entryPrice: string
  deadline: number
  yesPool: string
  noPool: string
  resolved: boolean
  outcome: boolean
  finalPrice: string
}

export default function MarketsPage() {
  const { getAllMarkets, isReady } = useContract()
  const { isConnected } = useWallet()
  const [markets, setMarkets] = useState<Market[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (isReady) {
      loadMarkets()
    }
  }, [isReady])

  const loadMarkets = async () => {
    try {
      setLoading(true)
      const result = await getAllMarkets(page * 10, 10)
      setMarkets(result.markets)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Failed to load markets:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    try {
      const nextPage = page + 1
      const result = await getAllMarkets(nextPage * 10, 10)
      setMarkets((prev) => [...prev, ...result.markets])
      setPage(nextPage)
      setHasMore(result.hasMore)
    } catch (error) {
      console.error("Failed to load more markets:", error)
    }
  }

  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Connect Wallet</h1>
          <p className="text-muted-foreground">Please connect your wallet to view markets.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Prediction Markets</h1>
          <p className="text-muted-foreground">Browse and participate in active markets</p>
        </div>
        <Link href="/trade">
          <Button>Create Market</Button>
        </Link>
      </div>

      {loading && markets.length === 0 ? (
        <div className="text-center py-8">
          <p>Loading markets...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {markets.map((market) => (
            <Card key={market.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg line-clamp-2">{market.question}</CardTitle>
                  <Badge variant={market.resolved ? "secondary" : "default"}>
                    {market.resolved ? "Resolved" : "Active"}
                  </Badge>
                </div>
                <CardDescription>Entry Price: {market.entryPrice} BDAG</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Yes Pool: {Number.parseFloat(market.yesPool).toFixed(2)} BDAG</span>
                    <span>No Pool: {Number.parseFloat(market.noPool).toFixed(2)} BDAG</span>
                  </div>

                  {market.resolved ? (
                    <div className="text-sm">
                      <Badge variant={market.outcome ? "default" : "destructive"}>
                        Outcome: {market.outcome ? "YES" : "NO"}
                      </Badge>
                      <p className="mt-1">Final Price: {market.finalPrice} BDAG</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Ends {formatDistanceToNow(new Date(market.deadline * 1000), { addSuffix: true })}
                    </p>
                  )}

                  <Link href={`/trade?market=${market.id}`}>
                    <Button className="w-full bg-transparent" variant="outline">
                      {market.resolved ? "View Results" : "Place Bet"}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasMore && (
        <div className="text-center mt-8">
          <Button onClick={loadMore} variant="outline">
            Load More Markets
          </Button>
        </div>
      )}

      {markets.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No markets found. Be the first to create one!</p>
        </div>
      )}
    </div>
  )
}
