"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, ArrowDown, Zap, Shield, TrendingUp, Clock, Users, Target } from "lucide-react"
import { WalletConnectModal } from "@/components/wallet-connect-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { useWallet } from "@/contexts/wallet-context"
import { useState } from "react"
import Link from "next/link"

export default function LandingPage() {
  const [showWalletModal, setShowWalletModal] = useState(false)
  const { isConnected, address, disconnectWallet } = useWallet()

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">RiskShare</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-muted-foreground">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <Button variant="outline" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                onClick={() => setShowWalletModal(true)}
              >
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <Badge className="mb-4 bg-primary text-primary-foreground border-primary">Built on BlockDAG Network</Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            Gamified Crypto Options
            <span className="text-primary block">Made Simple</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto text-pretty">
            Predict price movements. Fast execution, controlled risk, and instant settlements. No margin calls, just
            pure trading excitement.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/trade">Start Trading Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Trading Preview */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Live Trading Interface</CardTitle>
                <CardDescription>Experience the thrill of binary options trading</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Mock Chart */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">BTC/USD</h3>
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: "#16a34a",
                          color: "#ffffff",
                        }}
                      >
                        $67,234.56
                      </span>
                    </div>
                    <div className="h-48 bg-muted/20 rounded-lg flex items-center justify-center">
                      <div className="text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                        <p>Real-time Chart</p>
                      </div>
                    </div>
                  </div>

                  {/* Trading Controls */}
                  <div className="space-y-4">
                    <div className="text-center">
                      <h3 className="font-semibold mb-2">Will BTC go up, Yes or No?</h3>
                      <p className="text-sm text-muted-foreground">Expires in 5 minutes</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button className="h-16 bg-primary hover:bg-primary/90 text-primary-foreground flex flex-col">
                        <ArrowUp className="w-6 h-6 mb-1" />
                        <span>Yes</span>
                        <span className="text-xs opacity-80">2.1x payout</span>
                      </Button>
                      <Button className="h-16 bg-destructive hover:bg-destructive/90 text-destructive-foreground flex flex-col">
                        <ArrowDown className="w-6 h-6 mb-1" />
                        <span>No</span>
                        <span className="text-xs opacity-80">1.8x payout</span>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Set Amount</label>
                      <div className="flex">
                        <input
                          type="number"
                          placeholder="0.01"
                          className="flex-1 px-3 py-2 bg-input border border-border rounded-l-md text-foreground"
                        />
                        <div className="px-3 py-2 bg-muted text-muted-foreground border border-l-0 border-border rounded-r-md">
                          BDAG
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose RiskShare?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built for the next generation of traders who want speed, simplicity, and excitement
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <Zap className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Lightning Fast</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Trades execute instantly with gas-free settlements. No waiting, just pure speed.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Shield className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Controlled Risk</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  No margin calls or liquidations. Your risk is always limited to your set amount.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Clock className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Short Timeframes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  From seconds to hours. Choose your timeframe and get instant results.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Target className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Simple Mechanics</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Just predict Yes or No. No complex strategies needed - pure intuition.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <Users className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Gamified Experience</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Leaderboards, achievements, and social features make trading addictively fun.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <TrendingUp className="w-8 h-8 text-primary mb-2" />
                <CardTitle>Halal-compliant </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Not gambling, no interest, no 100% risk</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to start trading</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Choose Asset</h3>
              <p className="text-muted-foreground">Select from BTC, BDAG, and other popular cryptocurrencies</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Predict Direction</h3>
              <p className="text-muted-foreground">
                Will the price go Up (YES) or Under (NO)? Place your trade and timeframe
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Collect Winnings</h3>
              <p className="text-muted-foreground">Win instantly when your prediction is correct. Payouts up to 10x</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Trading?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the future of gamified crypto trading. Fast, fun, and profitable.
          </p>
          {isConnected ? (
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/trade">Launch App</Link>
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setShowWalletModal(true)}
            >
              Connect Wallet to Start
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">RiskShare</span>
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 RiskShare. Built on BlockDAG Network.
          </div>
        </div>
      </footer>

      <WalletConnectModal open={showWalletModal} onOpenChange={setShowWalletModal} />
    </div>
  )
}
