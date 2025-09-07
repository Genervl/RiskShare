"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Wallet, Loader2, CheckCircle, AlertCircle, ExternalLink } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

interface WalletConnectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const detectWalletAvailability = () => {
  if (typeof window === "undefined") return {}

  const ethereum = window.ethereum
  if (!ethereum) return {}

  return {
    metamask: !!(ethereum.isMetaMask || ethereum._metamask),
    coinbase: !!(ethereum.isCoinbaseWallet || ethereum.selectedProvider?.isCoinbaseWallet),
    trust: !!ethereum.isTrust,
    brave: !!ethereum.isBraveWallet,
    rabby: !!ethereum.isRabby,
    injected: !!ethereum,
  }
}

export function WalletConnectModal({ open, onOpenChange }: WalletConnectModalProps) {
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const { connectWallet } = useWallet()

  const walletAvailability = detectWalletAvailability()

  const wallets = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Most popular Ethereum wallet",
      installed: walletAvailability.metamask,
      downloadUrl: "https://metamask.io/download/",
      priority: 1,
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Coinbase's self-custody wallet",
      installed: walletAvailability.coinbase,
      downloadUrl: "https://www.coinbase.com/wallet",
      priority: 2,
    },
    {
      name: "Trust Wallet",
      icon: "🛡️",
      description: "Multi-chain crypto wallet",
      installed: walletAvailability.trust,
      downloadUrl: "https://trustwallet.com/",
      priority: 3,
    },
    {
      name: "Brave Wallet",
      icon: "🦁",
      description: "Built into Brave browser",
      installed: walletAvailability.brave,
      downloadUrl: "https://brave.com/wallet/",
      priority: 4,
    },
    {
      name: "Rabby Wallet",
      icon: "🐰",
      description: "Multi-chain DeFi wallet",
      installed: walletAvailability.rabby,
      downloadUrl: "https://rabby.io/",
      priority: 5,
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect mobile wallets",
      installed: walletAvailability.injected,
      downloadUrl: "https://walletconnect.com/",
      priority: 6,
    },
  ]

  const sortedWallets = wallets.sort((a, b) => {
    if (a.installed && !b.installed) return -1
    if (!a.installed && b.installed) return 1
    return a.priority - b.priority
  })

  const handleConnect = async (walletType: string) => {
    console.log("[v0] Attempting to connect wallet:", walletType)

    const wallet = wallets.find((w) => w.name === walletType)
    console.log("[v0] Wallet found:", wallet)
    console.log("[v0] Window ethereum:", typeof window !== "undefined" ? !!window.ethereum : "undefined")

    if (!wallet?.installed) {
      const errorMsg = `${walletType} is not installed. Please install it first.`
      console.log("[v0] Wallet not installed:", errorMsg)
      setErrorMessage(errorMsg)
      setConnectionStatus("error")
      return
    }

    setIsConnecting(true)
    setConnectionStatus("connecting")
    setErrorMessage("")

    try {
      console.log("[v0] Calling connectWallet function...")
      await connectWallet(walletType)
      console.log("[v0] Wallet connected successfully")
      setConnectionStatus("success")
      setTimeout(() => {
        onOpenChange(false)
        setConnectionStatus("idle")
        setIsConnecting(false)
      }, 1500)
    } catch (error: any) {
      console.error("[v0] Wallet connection failed:", error)
      setConnectionStatus("error")
      setErrorMessage(error.message || "Failed to connect wallet")
      setIsConnecting(false)
    }
  }

  const resetModal = () => {
    setConnectionStatus("idle")
    setErrorMessage("")
    setIsConnecting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Connect Wallet
          </DialogTitle>
          <DialogDescription>Choose your preferred wallet to connect to RiskShare</DialogDescription>
        </DialogHeader>

        {connectionStatus === "connecting" && (
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Connecting to wallet...</p>
            <p className="text-xs text-muted-foreground mt-2">Check your wallet for connection request</p>
          </div>
        )}

        {connectionStatus === "success" && (
          <div className="flex flex-col items-center py-8">
            <CheckCircle className="w-8 h-8 text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Wallet connected successfully!</p>
          </div>
        )}

        {connectionStatus === "error" && (
          <div className="flex flex-col items-center py-8">
            <AlertCircle className="w-8 h-8 text-destructive mb-4" />
            <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={resetModal}>
              Try Again
            </Button>
          </div>
        )}

        {connectionStatus === "idle" && (
          <div className="space-y-3">
            {sortedWallets.map((wallet) => (
              <div key={wallet.name} className="relative">
                <Button
                  variant="outline"
                  className={`w-full justify-start h-auto p-4 transition-colors bg-transparent ${
                    wallet.installed ? "hover:bg-accent/50 border-primary/20" : "hover:bg-muted/30 opacity-75"
                  }`}
                  onClick={() => {
                    console.log("[v0] Button clicked for:", wallet.name)
                    handleConnect(wallet.name)
                  }}
                  disabled={isConnecting || !wallet.installed}
                >
                  <div className="flex items-center gap-3 w-full">
                    <span className="text-2xl">{wallet.icon}</span>
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{wallet.name}</span>
                        {wallet.installed ? (
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Install Required
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">{wallet.description}</div>
                    </div>
                    {!wallet.installed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 h-auto shrink-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          console.log("[v0] Opening download link for:", wallet.name)
                          window.open(wallet.downloadUrl, "_blank")
                        }}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground text-center mt-4">
          By connecting a wallet, you agree to our Terms of Service and Privacy Policy
        </div>
      </DialogContent>
    </Dialog>
  )
}
