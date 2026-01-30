import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  DollarSign,
  BarChart2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Waves,
} from "lucide-react";
import { GlowingCard } from "@/components/nexus/GlowingCard";
import { CircularGauge } from "@/components/nexus/CircularGauge";
import { StatusBadge } from "@/components/nexus/StatusBadge";
import { Button } from "@/components/ui/button";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useWalletBalances } from "@/hooks/useWalletBalances";
import { useFearGreed } from "@/hooks/useFearGreed";

const timeframes = ["15m", "1H", "4H", "1D", "1W"];

const coins = [
  { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', icon: '₿', color: 'warning' },
  { id: 'ethereum', symbol: 'ETH', name: 'Ethereum', icon: 'Ξ', color: 'secondary' },
  { id: 'solana', symbol: 'SOL', name: 'Solana', icon: '◎', color: 'primary' },
];



const TradingFloor = () => {
  const [activeTimeframe, setActiveTimeframe] = useState("1H");
  const [activeCoin, setActiveCoin] = useState(coins[0]);
  const [showCoinSelector, setShowCoinSelector] = useState(false);

  const [whaleMovements, setWhaleMovements] = useState<any[]>([]);

  // Live price data
  const { prices, loading: pricesLoading } = useCryptoPrices(60000);
  const { balances, loading: balancesLoading } = useWalletBalances(prices, 120000);
  const { data: fearGreed, loading: fearGreedLoading } = useFearGreed(300000);

  // Fetch whale movements
  useEffect(() => {
    const fetchWhales = async () => {
      try {
        const res = await fetch('http://localhost:8090/whale/radar');
        const data = await res.json();
        if (data.movements) setWhaleMovements(data.movements);
      } catch (e) {
        console.error("Failed to fetch whale radar", e);
      }
    };
    fetchWhales();
    const interval = setInterval(fetchWhales, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get current coin's price
  const currentPrice = (prices || {})[activeCoin.id as keyof typeof prices]?.usd || 0;
  const priceChange = (prices || {})[activeCoin.id as keyof typeof prices]?.usd_24h_change || 0;
  const isPositive = priceChange > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-orbitron font-bold">
            <span className="text-foreground">Trading </span>
            <span className="neon-text-secondary">Floor</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Market Analysis & Signals</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status="online" label="MARKETS LIVE" />
          <div className="text-right">
            <div className="font-orbitron text-lg">${currentPrice.toLocaleString()}</div>
            <div className={`text-xs flex items-center gap-1 ${isPositive ? "text-primary" : "text-destructive"}`}>
              {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {isPositive ? "+" : ""}{priceChange}%
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Chart Header */}
          <GlowingCard glowColor="secondary" className="!p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    className="flex items-center gap-2 hover:bg-muted/50 rounded-lg p-1 transition-colors"
                    onClick={() => setShowCoinSelector(!showCoinSelector)}
                  >
                    <div className={`w-8 h-8 rounded-full bg-${activeCoin.color} flex items-center justify-center text-${activeCoin.color}-foreground font-bold text-sm`}>
                      {activeCoin.icon}
                    </div>
                    <div className="text-left">
                      <div className="font-orbitron text-sm">{activeCoin.symbol}/USDT</div>
                      <div className="text-xs text-muted-foreground">{activeCoin.name}</div>
                    </div>
                  </button>

                  {/* Coin Dropdown */}
                  {showCoinSelector && (
                    <div className="absolute top-full mt-2 left-0 z-50 w-48 glass-panel border border-primary/20 rounded-lg shadow-xl">
                      {coins.map((coin) => (
                        <button
                          key={coin.id}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left ${activeCoin.id === coin.id ? 'bg-muted/30' : ''}`}
                          onClick={() => { setActiveCoin(coin); setShowCoinSelector(false); }}
                        >
                          <span className="text-lg">{coin.icon}</span>
                          <div>
                            <div className="font-orbitron text-sm">{coin.symbol}</div>
                            <div className="text-xs text-muted-foreground">{coin.name}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-1">
                  {['15m', '1H', '4H', '1D'].map((tf) => (
                    <button
                      key={tf}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${activeTimeframe === tf
                        ? "bg-secondary/20 text-secondary"
                        : "text-muted-foreground hover:text-foreground"
                        }`}
                      onClick={() => setActiveTimeframe(tf)}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="h-[500px] bg-background/50 rounded-lg relative overflow-hidden border border-white/5 mt-4">
              <div className="absolute inset-0" id="tradingview_widget_container" />
            </div>
          </GlowingCard>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-4">
            <motion.button
              className="glass-panel p-4 text-center border border-primary/30 hover:bg-primary/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingUp className="w-6 h-6 text-primary mx-auto mb-2" />
              <span className="font-orbitron text-sm text-primary">BUY DIP (Sim)</span>
            </motion.button>
            <motion.button
              className="glass-panel p-4 text-center border border-secondary/30 hover:bg-secondary/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DollarSign className="w-6 h-6 text-secondary mx-auto mb-2" />
              <span className="font-orbitron text-sm text-secondary">TAKE PROFIT (Sim)</span>
            </motion.button>
            <motion.button
              className="glass-panel p-4 text-center border border-destructive/30 hover:bg-destructive/10 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <TrendingDown className="w-6 h-6 text-destructive mx-auto mb-2" />
              <span className="font-orbitron text-sm text-destructive">PANIC SELL (Sim)</span>
            </motion.button>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4">
          {/* Fear & Greed */}
          <GlowingCard>
            <h3 className="font-orbitron text-sm text-muted-foreground mb-4 text-center">Market Sentiment</h3>
            <div className="flex justify-center">
              <CircularGauge
                value={fearGreed?.value ?? 50}
                max={100}
                label="Fear/Greed"
                color={fearGreed?.value && fearGreed.value < 40 ? "warning" : fearGreed?.value && fearGreed.value > 60 ? "primary" : "secondary"}
                size={100}
                strokeWidth={8}
              />
            </div>
            <div className="text-center mt-2">
              <span className={`text-xs font-orbitron ${fearGreed?.value && fearGreed.value < 40 ? "text-warning" : fearGreed?.value && fearGreed.value > 60 ? "text-primary" : "text-secondary"}`}>
                {fearGreedLoading ? 'LOADING...' : (fearGreed?.classification?.toUpperCase() || 'NEUTRAL')}
              </span>
            </div>
          </GlowingCard>

          {/* Whale Radar */}
          <GlowingCard glowColor="secondary">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-orbitron text-sm flex items-center gap-2">
                <Waves className="w-4 h-4 text-secondary" />
                Whale Radar
              </h3>
              <StatusBadge status="processing" label="LIVE" size="sm" />
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {whaleMovements.map((whale) => (
                <motion.div
                  key={whale.id}
                  className="p-2 rounded bg-muted/30 text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono ${whale.type === "in" ? "text-primary" : "text-destructive"}`}>
                      {whale.type === "in" ? "→ IN" : "← OUT"}
                    </span>
                    <span className="text-muted-foreground">{whale.time}</span>
                  </div>
                  <div className="font-orbitron text-foreground">{whale.amount}</div>
                  <div className="text-muted-foreground truncate">
                    {whale.from} → {whale.to}
                  </div>
                </motion.div>
              ))}
            </div>
          </GlowingCard>

          {/* Portfolio */}
          <GlowingCard>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-orbitron text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-primary" />
                Portfolio
              </h3>
            </div>
            <div className="text-center">
              <div className="text-2xl font-orbitron text-primary">
                {balancesLoading ? '--' : `$${(balances?.totalUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              </div>
              <div className="text-xs text-muted-foreground mt-2 space-y-1">
                <div>SOL: {balances?.sol?.balance?.toFixed(2) || '0'}</div>
                <div>ETH: {balances?.eth?.balance?.toFixed(4) || '0'}</div>
                <div>BTC: {balances?.btc?.balance?.toFixed(6) || '0'}</div>
              </div>
            </div>
          </GlowingCard>
        </div>
      </div>
      <ScriptInjection activeCoin={activeCoin.symbol} />
    </div >
  );
};


const ScriptInjection = ({ activeCoin }: { activeCoin: string }) => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      if (window.TradingView) {
        // @ts-ignore
        new window.TradingView.widget({
          "autosize": true,
          "symbol": `BINANCE:${activeCoin}USDT`,
          "interval": "D",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "allow_symbol_change": true,
          "container_id": "tradingview_widget_container"
        });
      }
    };
    document.body.appendChild(script);
    return () => {
      if (typeof script !== 'undefined') {
        document.body.removeChild(script);
      }
    };
  }, [activeCoin]);

  return null;
};

export default TradingFloor;
