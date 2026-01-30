import { GlowingCard } from "@/components/nexus/GlowingCard";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Activity, Cpu, Database, Network } from "lucide-react";
import { motion } from "framer-motion";

const data = [
  { name: '00:00', memory: 4000, cpu: 2400, amt: 2400 },
  { name: '04:00', memory: 3000, cpu: 1398, amt: 2210 },
  { name: '08:00', memory: 2000, cpu: 9800, amt: 2290 },
  { name: '12:00', memory: 2780, cpu: 3908, amt: 2000 },
  { name: '16:00', memory: 1890, cpu: 4800, amt: 2181 },
  { name: '20:00', memory: 2390, cpu: 3800, amt: 2500 },
  { name: '23:59', memory: 3490, cpu: 4300, amt: 2100 },
];

const trafficData = [
  { name: 'Mon', mobile: 40, desktop: 80 },
  { name: 'Tue', mobile: 30, desktop: 120 },
  { name: 'Wed', mobile: 20, desktop: 150 },
  { name: 'Thu', mobile: 27, desktop: 110 },
  { name: 'Fri', mobile: 18, desktop: 90 },
  { name: 'Sat', mobile: 23, desktop: 160 },
  { name: 'Sun', mobile: 34, desktop: 130 },
];

const Analytics = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <Activity className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-2xl font-orbitron font-bold">SYSTEM METRICS</h1>
          <p className="text-sm text-muted-foreground">Real-time performance aggregation</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Requests"
          value="1.2M"
          trend="+12%"
          icon={<Network className="w-4 h-4 text-blue-400" />}
        />
        <MetricCard
          title="Avg Latency"
          value="42ms"
          trend="-5%"
          icon={<Activity className="w-4 h-4 text-green-400" />}
          good={true}
        />
        <MetricCard
          title="Memory Load"
          value="64%"
          trend="+2%"
          icon={<Database className="w-4 h-4 text-purple-400" />}
        />
        <MetricCard
          title="Neural Ops"
          value="892/s"
          trend="+24%"
          icon={<Cpu className="w-4 h-4 text-orange-400" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlowingCard className="h-[400px]">
          <h3 className="font-orbitron mb-6 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            CPU vs Memory Usage (24h)
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} />
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <Tooltip
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#8884d8" fillOpacity={1} fill="url(#colorCpu)" />
              <Area type="monotone" dataKey="memory" stroke="#82ca9d" fillOpacity={1} fill="url(#colorMem)" />
            </AreaChart>
          </ResponsiveContainer>
        </GlowingCard>

        <GlowingCard className="h-[400px]">
          <h3 className="font-orbitron mb-6 flex items-center gap-2">
            <Network className="w-4 h-4 text-blue-400" />
            Network Traffic Volume
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trafficData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
              />
              <Bar dataKey="desktop" stackId="a" fill="#3b82f6" />
              <Bar dataKey="mobile" stackId="a" fill="#ef4444" />
            </BarChart>
          </ResponsiveContainer>
        </GlowingCard>
      </div>
    </div>
  );
}

const MetricCard = ({ title, value, trend, icon, good }: any) => (
  <GlowingCard>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <span className="text-xs text-muted-foreground flex items-center gap-2">
          {icon} {title}
        </span>
        <div className="text-2xl font-bold font-orbitron">{value}</div>
      </div>
      <div className={`text-xs px-2 py-1 rounded bg-muted/20 ${good || trend.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
        {trend}
      </div>
    </div>
  </GlowingCard>
);

export default Analytics;
