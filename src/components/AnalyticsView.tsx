import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Clock,
  ShieldCheck,
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { DashboardMetrics } from '../types';
import { formatINR, formatPercent } from '../utils/formatters';

interface AnalyticsViewProps {
  metrics: DashboardMetrics | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics }) => {
  if (!metrics) {
    return (
      <div className="p-12 text-center text-[#E5E5E5]/40 font-serif italic text-lg">
        Loading analytics visualizations...
      </div>
    );
  }

  const outcomeDistribution = [
    { name: 'Recovered (Verified)', value: metrics.revenue_recovered, color: '#C5A059' },
    {
      name: 'Unrecovered / Terminated',
      value: Math.max(0, metrics.revenue_at_risk - metrics.revenue_recovered - metrics.expected_recovery_value * 0.4),
      color: '#8A2A2B'
    },
    {
      name: 'Active In Pipeline',
      value: Math.round(metrics.expected_recovery_value * 0.4),
      color: '#444444'
    }
  ];

  return (
    <div className="space-y-6">
      {/* View Title */}
      <div className="pb-4 border-b border-[#2A2A2A]">
        <div className="flex items-center space-x-2 text-[#C5A059] text-[9px] font-bold uppercase tracking-[0.3em] mb-1">
          <BarChart3 className="h-3.5 w-3.5" />
          <span>Financial Recovery Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif italic text-white tracking-tight">
          Revenue Recovery Analytics & Attribution Ledger
        </h1>
        <p className="text-xs text-[#E5E5E5]/60 mt-1 font-light max-w-2xl">
          Mathematical breakdown of recovered liquidity, baseline outperformance, and channel unit economics.
        </p>
      </div>

      {/* Analytics KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141414] border border-[#2A2A2A] p-5">
          <div className="text-[9px] uppercase tracking-[0.25em] text-[#E5E5E5]/50 font-medium">Verified Settlement</div>
          <div className="text-2xl font-serif text-[#C5A059] mt-2">{formatINR(metrics.revenue_recovered)}</div>
          <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Reconciled via gateway ledger</div>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] p-5">
          <div className="text-[9px] uppercase tracking-[0.25em] text-[#E5E5E5]/50 font-medium">Incremental vs Baseline</div>
          <div className="text-2xl font-serif text-[#00FF66] mt-2">
            +{formatINR(metrics.baseline_comparison.incremental_revenue)}
          </div>
          <div className="text-[10px] font-mono text-[#00FF66] font-medium mt-1">
            +{metrics.baseline_comparison.improvement_pct}% lift above naive retry
          </div>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] p-5">
          <div className="text-[9px] uppercase tracking-[0.25em] text-[#E5E5E5]/50 font-medium">Average Recovery Velocity</div>
          <div className="text-2xl font-serif text-white mt-2">{metrics.avg_recovery_time_hours} Hours</div>
          <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">From initial failure to settlement</div>
        </div>

        <div className="bg-[#141414] border border-[#2A2A2A] p-5">
          <div className="text-[9px] uppercase tracking-[0.25em] text-[#E5E5E5]/50 font-medium">Unsolicited Retries Avoided</div>
          <div className="text-2xl font-serif text-[#E5E5E5] mt-2">{metrics.baseline_comparison.actions_avoided}</div>
          <div className="text-[10px] font-mono text-[#E5E5E5]/40 mt-1">Customer goodwill preserved</div>
        </div>
      </div>

      {/* Primary Trend Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recovery Trend Area Chart */}
        <div className="lg:col-span-2 bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-serif italic text-white mb-1">Cumulative Recovery Trajectory</h2>
          <p className="text-xs text-[#E5E5E5]/50 font-light mb-5">Historical progression of recovered revenue vs at-risk inflow</p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.trends}>
                <defs>
                  <linearGradient id="anRecovered" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C5A059" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C5A059" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#E5E5E5' }}
                  formatter={(val: any) => [formatINR(Number(val)), '']}
                />
                <Legend wrapperStyle={{ fontSize: '10px', color: '#888888', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
                <Area type="monotone" dataKey="revenue_at_risk" stroke="#333333" fill="#222222" fillOpacity={0.4} name="Revenue At Risk" />
                <Area type="monotone" dataKey="revenue_recovered" stroke="#C5A059" strokeWidth={2} fill="url(#anRecovered)" name="Revenue Recovered" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Outcome Breakdown Donut Chart */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-serif italic text-white mb-1">Capital Settlement Ratio</h2>
            <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">Proportion of intercepted revenue recovered</p>

            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={outcomeDistribution}
                    innerRadius={52}
                    outerRadius={76}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="#141414"
                    strokeWidth={2}
                  >
                    {outcomeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#E5E5E5' }}
                    formatter={(val: any) => [formatINR(Number(val)), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2.5 text-xs mt-3 pt-3 border-t border-[#2A2A2A]">
              {outcomeDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-none" style={{ backgroundColor: item.color }} />
                    <span className="text-[#E5E5E5]/70 text-[11px] font-light">{item.name}</span>
                  </div>
                  <span className="font-mono text-xs text-white">{formatINR(item.value, true)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dives: Customer Segment & Failure Reasons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segment Distribution */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-serif italic text-white mb-1">Recovery by Customer Segment</h2>
          <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">Enterprise tier captures largest absolute value</p>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.by_customer_segment}>
                <XAxis dataKey="segment" stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" />
                <YAxis stroke="#444444" fontSize={10} fontFamily="JetBrains Mono, monospace" tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#141414', borderColor: '#2A2A2A', borderRadius: '0px', fontSize: '11px', fontFamily: 'JetBrains Mono, monospace', color: '#E5E5E5' }}
                  formatter={(val: any) => [formatINR(Number(val)), 'Recovered']}
                />
                <Bar dataKey="recovered" fill="#C5A059" name="Recovered" />
                <Bar dataKey="at_risk" fill="#2A2A2A" name="At Risk" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Failure Reason Recovery Rates */}
        <div className="bg-[#141414] border border-[#2A2A2A] p-5 sm:p-6 shadow-sm">
          <h2 className="text-lg font-serif italic text-white mb-1">Recovery Success Rate by Error Type</h2>
          <p className="text-xs text-[#E5E5E5]/50 font-light mb-4">Bank downtime and timeouts recover at highest efficiency</p>

          <div className="space-y-3 mt-2">
            {metrics.by_failure_reason.slice(0, 6).map((r) => (
              <div key={r.reason} className="text-xs">
                <div className="flex justify-between text-[#E5E5E5]/80 mb-1 font-mono text-[11px]">
                  <span className="font-serif italic text-white text-xs">{r.reason.replace(/_/g, ' ')}</span>
                  <div className="space-x-3">
                    <span className="text-[#E5E5E5]/40">{formatINR(r.recovered, true)} / {formatINR(r.at_risk, true)}</span>
                    <span className="font-bold text-[#C5A059]">{r.rate}%</span>
                  </div>
                </div>
                <div className="w-full bg-[#1A1A1A] h-1.5 overflow-hidden border border-[#2A2A2A]">
                  <div
                    className="h-full bg-[#C5A059] transition-all"
                    style={{ width: `${Math.max(4, r.rate)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
