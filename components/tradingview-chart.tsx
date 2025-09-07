"use client"

import { useEffect, useRef, useState } from "react"
import { createChart, ColorType, type IChartApi, type ISeriesApi, type LineData } from "lightweight-charts"

interface TradingViewChartProps {
  data: Array<{ time: number; value: number }>
  symbol: string
  height?: number
  timeframe: string
  customTimeframe?: string
}

export function TradingViewChart({ data, symbol, height = 300, timeframe, customTimeframe }: TradingViewChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isChartInitialized, setIsChartInitialized] = useState(false)

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#888",
      },
      grid: {
        vertLines: { color: "rgba(42, 46, 57, 0.5)" },
        horzLines: { color: "rgba(42, 46, 57, 0.5)" },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
      },
      timeScale: {
        borderColor: "rgba(197, 203, 206, 0.8)",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
    })

    const lineSeries = chart.addLineSeries({
      color: "#00ff88",
      lineWidth: 2,
      crosshairMarkerVisible: true,
      crosshairMarkerRadius: 6,
      crosshairMarkerBorderColor: "#00ff88",
      crosshairMarkerBackgroundColor: "#00ff88",
    })

    chartRef.current = chart
    seriesRef.current = lineSeries

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        })
      }
    }

    window.addEventListener("resize", handleResize)
    setIsChartInitialized(true)

    return () => {
      window.removeEventListener("resize", handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
      }
    }
  }, [height])

  useEffect(() => {
    if (!seriesRef.current || !data.length) return

    const formattedData: LineData[] = data.map((item) => ({
      time: item.time as any,
      value: item.value,
    }))

    seriesRef.current.setData(formattedData)

    if (chartRef.current) {
      chartRef.current.timeScale().fitContent()
    }

    if (isChartInitialized && formattedData.length > 0) {
      setIsLoading(false)
    }

    console.log("[v0] TradingView chart updated with", formattedData.length, "data points")
  }, [data, isChartInitialized])

  const getChartTitle = () => {
    if (timeframe === "custom") {
      return `${symbol} - Last ${customTimeframe || "?"} minute${customTimeframe !== "1" ? "s" : ""}`
    } else if (timeframe === "60") {
      return `${symbol} - Last 1 hour`
    } else {
      return `${symbol} - Last ${timeframe} minute${timeframe !== "1" ? "s" : ""}`
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center bg-muted/5 rounded-lg border border-border" style={{ height }}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Loading {symbol} chart...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full bg-muted/5 rounded-lg border border-border p-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-foreground">{getChartTitle()}</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  )
}
