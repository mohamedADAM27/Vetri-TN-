/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie } from "recharts";
import { TrendingUp, FolderClosed, Activity, Clock, ShieldCheck, AlertTriangle } from "lucide-react";
import { CategoryDistribution, DailyTrend, DistrictStats } from "../types";

interface GovernorChartsProps {
  summary: {
    total: number;
    resolved: number;
    pending: number;
    inProgress: number;
    criticalCount: number;
  };
  categoryDistribution: CategoryDistribution[];
  dailyTrends: DailyTrend[];
  districtStats: DistrictStats[];
}

export default function GovernorCharts({
  summary,
  categoryDistribution,
  dailyTrends,
  districtStats
}: GovernorChartsProps) {

  // Custom tooltips with maroon themed background
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1f1917] border border-[#B38F00] p-3 rounded-lg shadow-xl text-xs text-stone-100 font-sans z-50">
          <p className="font-semibold text-amber-300 border-b border-stone-800 pb-1 mb-1">{label}</p>
          {payload.map((pld: any) => (
            <p key={pld.name} className="flex justify-between items-center gap-4 py-0.5">
              <span className="opacity-80">{pld.name}:</span>
              <span className="font-mono font-bold" style={{ color: pld.color || pld.fill }}>{pld.value}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0.08 ? (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-mono font-bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <div id="governor-analytics-panel" className="space-y-6">
      
      {/* 4-Column Stat Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Filed */}
        <div className="bg-white border border-[#eae0d5] p-4 rounded-xl shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-1.5 translate-y-1.5 opacity-5">
            <Activity className="w-24 h-24 text-[#800020]" />
          </div>
          <div className="flex items-center justify-between text-[#800020] mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Reports Logged</span>
            <Activity className="w-4 h-4" />
          </div>
          <p className="text-3xl font-sans font-bold text-stone-900">{summary.total}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
            <span className="font-medium text-[#800020]">100% Verified</span>
            <span>citizen geo-submissions</span>
          </div>
        </div>

        {/* Pending Triage */}
        <div className="bg-white border border-[#eae0d5] p-4 rounded-xl shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-1.5 translate-y-1.5 opacity-5">
            <Clock className="w-24 h-24 text-[#B38F00]" />
          </div>
          <div className="flex items-center justify-between text-[#B38F00] mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4" />
          </div>
          <p className="text-3xl font-sans font-bold text-stone-900">{summary.pending}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
            <span className="px-1 py-0.2 rounded bg-amber-50 text-[#B38F00] font-medium border border-amber-200">Awaiting Dispatch</span>
          </div>
        </div>

        {/* Resolving SLA Progress */}
        <div className="bg-white border border-[#eae0d5] p-4 rounded-xl shadow-xs relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-1.5 translate-y-1.5 opacity-5">
            <ShieldCheck className="w-24 h-24 text-emerald-600" />
          </div>
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Resolved SLA</span>
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-3xl font-sans font-bold text-stone-900">{summary.resolved}</p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
            <span className="text-emerald-700 font-medium">
              {summary.total > 0 ? ((summary.resolved / summary.total) * 100).toFixed(0) : 0}% success rate
            </span>
            <span>across wards</span>
          </div>
        </div>

        {/* High Threat Warnings */}
        <div className="bg-white border border-[#eae0d5] p-4 rounded-xl shadow-xs relative overflow-hidden">
          <div className="absolute right-1 bottom-1 translate-x-1.5 translate-y-1.5 opacity-10">
            <AlertTriangle className={`w-20 h-20 ${summary.criticalCount > 0 ? "text-red-500 animate-pulse" : "text-stone-300"}`} />
          </div>
          <div className="flex items-center justify-between text-red-600 mb-2">
            <span className="text-xs font-mono font-medium uppercase tracking-wider">Active Critical</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <p className={`text-3xl font-sans font-bold ${summary.criticalCount > 0 ? "text-red-700" : "text-stone-900"}`}>
            {summary.criticalCount}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
            <span className={`font-semibold ${summary.criticalCount > 0 ? "text-red-600" : "text-stone-400"}`}>
              {summary.criticalCount > 0 ? "Priority AI Dispatch Sent" : "No urgent threats on hold"}
            </span>
          </div>
        </div>

      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Reported vs Resolved Trend Area Chart */}
        <div id="analytics-daily-trends" className="bg-white border border-[#eae0d5] lg:col-span-8 p-5 rounded-xl shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#f4f1ea] mb-4">
            <div>
              <div className="flex items-center gap-1 text-xs font-mono font-medium text-[#800020] uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Operational Velocity Log</span>
              </div>
              <h4 className="text-sm font-sans font-bold text-stone-800 mt-1">7-Day Complaint Ingress & Clearance</h4>
            </div>
          </div>

          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReported" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#800020" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#800020" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0eae1" />
                <XAxis dataKey="date" stroke="#a09485" fontSize={11} tickLine={false} />
                <YAxis stroke="#a09485" fontSize={11} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconSize={10} verticalAlign="top" height={36} wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }} />
                <Area name="Reported Complaints" type="monotone" dataKey="reported" stroke="#800020" strokeWidth={2} fillOpacity={1} fill="url(#colorReported)" />
                <Area name="Resolved Complaints" type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Component */}
        <div id="analytics-categories" className="bg-white border border-[#eae0d5] lg:col-span-4 p-5 rounded-xl shadow-xs flex flex-col justify-between">
          <div className="pb-3 border-b border-[#f4f1ea] mb-3">
            <div className="flex items-center gap-1 text-xs font-mono font-medium text-[#B38F00] uppercase tracking-wider">
              <FolderClosed className="w-3.5 h-3.5" />
              <span>Categorized Shares</span>
            </div>
            <h4 className="text-sm font-sans font-bold text-stone-800 mt-1">Issue Categories Share</h4>
          </div>

          <div className="h-[180px] w-full relative flex items-center justify-center">
            {categoryDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CustomTooltip />} />
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-xs text-stone-400 font-mono">No data logged</div>
            )}
          </div>

          <div className="space-y-1.5 mt-3 max-h-[110px] overflow-y-auto pr-1">
            {categoryDistribution.map((entry, i) => (
              <div key={entry.name} className="flex items-center justify-between text-[11px] font-sans">
                <div className="flex items-center gap-2 max-w-[80%]">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="truncate text-stone-700 font-medium">{entry.name}</span>
                </div>
                <span className="font-mono font-bold text-stone-900">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Grid Comparison Board bar chart */}
      <div className="bg-white border border-[#eae0d5] p-5 rounded-xl shadow-xs">
        <h4 className="text-sm font-sans font-bold text-stone-800 pb-3 border-b border-[#f4f1ea] mb-4">
          Zonal Regional Grid - Issue Load Comparison
        </h4>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f1ea" />
              <XAxis dataKey="districtName" stroke="#a09485" fontSize={11} tickLine={false} />
              <YAxis stroke="#a09485" fontSize={11} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend iconSize={10} verticalAlign="top" height={30} wrapperStyle={{ fontSize: 11, fontFamily: 'sans-serif' }} />
              <Bar name="Total Registered" dataKey="totalIssues" fill="#800020" radius={[4, 4, 0, 0]}>
                {districtStats.map((entry, idx) => (
                  <Cell key={`cell-total-${idx}`} fill={idx % 2 === 0 ? "#800020" : "#a83232"} />
                ))}
              </Bar>
              <Bar name="Resolved Successful" dataKey="resolvedIssues" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
