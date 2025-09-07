"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Wifi, WifiOff } from "lucide-react"
import { useWallet } from "@/contexts/wallet-context"

const NETWORKS = {
  1: { name: "Ethereum", color: "bg-blue-500" },
  11155111: { name: "Sepolia", color: "bg-purple-500" },
  137: { name: "Polygon", color: "bg-purple-600" },
  80001: { name: "Mumbai", color: "bg-orange-500" },
}

export function NetworkSwitcher() {
  const { chainId, switchNetwork, isConnected } = useWallet()
  const [isSwitching, setIsSwitching] = useState(false)

  const currentNetwork = chainId ? NETWORKS[chainId as keyof typeof NETWORKS] : null
  const isUnsupported = chainId && !currentNetwork

  const handleNetworkSwitch = async (targetChainId: number) => {
    setIsSwitching(true)
    try {
      await switchNetwork(targetChainId)
    } catch (error) {
      console.error("Failed to switch network:", error)
    } finally {
      setIsSwitching(false)
    }
  }

  if (!isConnected) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          {isUnsupported ? <WifiOff className="w-4 h-4 text-destructive" /> : <Wifi className="w-4 h-4" />}
          {currentNetwork ? (
            <Badge variant="secondary" className={`${currentNetwork.color} text-white`}>
              {currentNetwork.name}
            </Badge>
          ) : (
            <Badge variant="destructive">Unsupported</Badge>
          )}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(NETWORKS).map(([id, network]) => (
          <DropdownMenuItem
            key={id}
            onClick={() => handleNetworkSwitch(Number(id))}
            disabled={isSwitching || chainId === Number(id)}
            className="gap-2"
          >
            <div className={`w-3 h-3 rounded-full ${network.color}`} />
            {network.name}
            {chainId === Number(id) && <Badge variant="secondary">Current</Badge>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
