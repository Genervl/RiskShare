"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

interface WalletContextType {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: number | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
  connectWallet: (walletType: string) => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  updateBalance: (newBalance: number) => void
  getBalanceAsNumber: () => number
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum Mainnet", rpcUrl: "https://mainnet.infura.io/v3/" },
  11155111: { name: "Sepolia Testnet", rpcUrl: "https://sepolia.infura.io/v3/" },
  137: { name: "Polygon Mainnet", rpcUrl: "https://polygon-rpc.com/" },
  80001: { name: "Polygon Mumbai", rpcUrl: "https://rpc-mumbai.maticvigil.com/" },
  1043: {
    name: "Primordial BlockDAG Testnet",
    rpcUrl: "https://rpc.primordial.bdagscan.com",
    blockExplorer: "https://primordial.bdagscan.com/",
    nativeCurrency: {
      name: "BDAG",
      symbol: "BDAG",
      decimals: 18,
    },
  },
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState("0.0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  useEffect(() => {
    checkConnection()
    setupEventListeners()
  }, [])

  const checkConnection = async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        console.log("[v0] Checking existing wallet connection...")
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          console.log("[v0] Found connected wallet address:", address)

          let balanceValue = "0.0"
          try {
            const balance = await provider.getBalance(address)
            balanceValue = ethers.formatEther(balance)
            console.log("[v0] Wallet balance fetched successfully:", balanceValue, "BDAG")
          } catch (balanceError) {
            console.error("[v0] Failed to fetch balance:", balanceError)
            console.log("[v0] Using default balance of 0.0")
          }

          const network = await provider.getNetwork()
          console.log("[v0] Connected to network:", network.name, "Chain ID:", Number(network.chainId))

          setIsConnected(true)
          setAddress(address)
          setBalance(balanceValue)
          setChainId(Number(network.chainId))
          setProvider(provider)
          setSigner(signer)
        }
      } catch (error) {
        console.error("[v0] Error checking wallet connection:", error)
      }
    }
  }

  const setupEventListeners = () => {
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnectWallet()
    } else {
      console.log("[v0] Account changed to:", accounts[0])
      setAddress(accounts[0])
      fetchBalanceForAddress(accounts[0])
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(Number.parseInt(chainId, 16))
    window.location.reload() // Reload to ensure clean state
  }

  const handleDisconnect = () => {
    disconnectWallet()
  }

  const fetchBalanceForAddress = async (walletAddress: string) => {
    if (provider) {
      try {
        console.log("[v0] Fetching balance for address:", walletAddress)
        const balance = await provider.getBalance(walletAddress)
        const formattedBalance = ethers.formatEther(balance)
        console.log("[v0] Balance updated:", formattedBalance, "BDAG")
        setBalance(formattedBalance)
      } catch (error) {
        console.error("[v0] Error updating balance:", error)
        console.log("[v0] Setting balance to 0.0 due to error")
        setBalance("0.0")
      }
    }
  }

  const connectWallet = async (walletType: string) => {
    try {
      console.log("[v0] Attempting to connect wallet:", walletType)
      let ethereum = null

      switch (walletType) {
        case "MetaMask":
          if (typeof window !== "undefined" && window.ethereum?.isMetaMask) {
            ethereum = window.ethereum
          } else if (typeof window !== "undefined" && window.ethereum?._metamask) {
            ethereum = window.ethereum
          } else {
            throw new Error("MetaMask not installed or not detected")
          }
          break

        case "Coinbase Wallet":
          if (typeof window !== "undefined" && window.ethereum?.isCoinbaseWallet) {
            ethereum = window.ethereum
          } else if (typeof window !== "undefined" && window.ethereum?.selectedProvider?.isCoinbaseWallet) {
            ethereum = window.ethereum
          } else {
            throw new Error("Coinbase Wallet not installed or not detected")
          }
          break

        case "Trust Wallet":
          if (typeof window !== "undefined" && window.ethereum?.isTrust) {
            ethereum = window.ethereum
          } else {
            throw new Error("Trust Wallet not installed or not detected")
          }
          break

        case "Brave Wallet":
          if (typeof window !== "undefined" && window.ethereum?.isBraveWallet) {
            ethereum = window.ethereum
          } else {
            throw new Error("Brave Wallet not installed or not detected")
          }
          break

        case "Rabby Wallet":
          if (typeof window !== "undefined" && window.ethereum?.isRabby) {
            ethereum = window.ethereum
          } else {
            throw new Error("Rabby Wallet not installed or not detected")
          }
          break

        case "WalletConnect":
          // For now, fallback to injected provider
          // In production, you'd implement WalletConnect v2
          if (typeof window !== "undefined" && window.ethereum) {
            ethereum = window.ethereum
          } else {
            throw new Error("No wallet found for WalletConnect")
          }
          break

        default:
          throw new Error("Unsupported wallet type")
      }

      if (!ethereum) {
        throw new Error("Wallet not found")
      }

      // Request account access
      await ethereum.request({ method: "eth_requestAccounts" })

      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      console.log("[v0] Wallet connected, address:", address)

      let balanceValue = "0.0"
      try {
        const balance = await provider.getBalance(address)
        balanceValue = ethers.formatEther(balance)
        console.log("[v0] Initial balance fetched:", balanceValue, "BDAG")
      } catch (balanceError) {
        console.error("[v0] Failed to fetch initial balance:", balanceError)
        console.log("[v0] This might be due to network connectivity issues with BlockDAG RPC")
      }

      const network = await provider.getNetwork()
      console.log("[v0] Connected to network:", network.name, "Chain ID:", Number(network.chainId))

      setIsConnected(true)
      setAddress(address)
      setBalance(balanceValue)
      setChainId(Number(network.chainId))
      setProvider(provider)
      setSigner(signer)

      console.log("[v0] Wallet connection completed successfully")
    } catch (error: any) {
      console.error("[v0] Failed to connect wallet:", error)
      throw new Error(error.message || "Failed to connect wallet")
    }
  }

  const disconnectWallet = () => {
    setIsConnected(false)
    setAddress(null)
    setBalance("0.0")
    setChainId(null)
    setProvider(null)
    setSigner(null)
  }

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) {
      throw new Error("No wallet found")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      // If network doesn't exist, add it
      if (error.code === 4902) {
        const networkConfig = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]
        if (networkConfig) {
          const addNetworkParams: any = {
            chainId: `0x${targetChainId.toString(16)}`,
            chainName: networkConfig.name,
            rpcUrls: [networkConfig.rpcUrl],
          }

          // Add additional parameters for BlockDAG network
          if (targetChainId === 1043) {
            addNetworkParams.blockExplorerUrls = [networkConfig.blockExplorer]
            addNetworkParams.nativeCurrency = networkConfig.nativeCurrency
          }

          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [addNetworkParams],
          })
        }
      } else {
        throw error
      }
    }
  }

  const updateBalanceFromNumber = (newBalance: number) => {
    setBalance(newBalance.toFixed(18)) // Keep high precision like ethers
  }

  const getBalanceAsNumber = () => {
    return Number.parseFloat(balance)
  }

  return (
    <WalletContext.Provider
      value={{
        isConnected,
        address,
        balance,
        chainId,
        provider,
        signer,
        connectWallet,
        disconnectWallet,
        switchNetwork,
        updateBalance: updateBalanceFromNumber,
        getBalanceAsNumber,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider")
  }
  return context
}

declare global {
  interface Window {
    ethereum?: any
  }
}
