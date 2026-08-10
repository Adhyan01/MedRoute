'use client';

import { useState, useEffect } from 'react';
import { useMedRouteStore, getNetworkStats } from '@/lib/store';
import { AlertTriangle, Activity, ArrowRight, ShieldCheck, Server, Hospital as HospitalIcon, Zap, HeartPulse } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

const FORECAST_DATA = [
  { time: 'Now', icu: 72 },
  { time: '+1 hour', icu: 78 },
  { time: '+2 hours', icu: 89 },
  { time: '+3 hours', icu: 94 },
];

export default function NetworkDashboardPage() {
  const hospitals = useMedRouteStore(s => s.hospitals);
  const stats = getNetworkStats(hospitals);
  const [syncSecs, setSyncSecs] = useState(8);

  useEffect(() => {
    const timer = setInterval(() => {
      setSyncSecs(s => s >= 15 ? 2 : s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen pb-12" style={{ background: '#F6F9FB' }}>
      {/* Header Bar */}
      <div style={{ background: '#172033', color: 'white' }} className="py-8 border-b border-slate-800">
        <div className="container-xl flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-white" style={{ fontFamily: 'Sora' }}>
                MEDROUTE NETWORK
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 pulse-dot" />
                LIVE HEALTHCARE CAPACITY
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Citywide Telemetry & Predictive Hospital Capacity Coordination Command
            </p>
          </div>

          <div className="text-right text-xs font-mono text-slate-400">
            <p>Network Synchronization: <span className="text-emerald-400 font-bold">{syncSecs}s ago</span></p>
            <p className="mt-1 text-slate-400">247 Connected Facilities</p>
          </div>
        </div>
      </div>

      <div className="container-xl py-8 space-y-8">
        {/* METRICS (4 CARDS) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          <div className="card p-6 border-l-4 border-l-[#087F8C]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Hospitals Online</p>
            <p className="text-4xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>247</p>
            <p className="text-xs text-[#16A34A] font-semibold mt-2">🟢 100% Telemetry Online</p>
          </div>

          <div className="card p-6 border-l-4 border-l-[#2563EB]">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Beds Available</p>
            <p className="text-4xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>
              {(stats.availableBeds + 1700).toLocaleString()}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-2">Across 8 Regional Zones</p>
          </div>

          <div className="card p-6 border-l-4 border-l-emerald-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">ICU Availability</p>
            <p className="text-4xl font-extrabold text-[#16A34A]" style={{ fontFamily: 'Sora' }}>
              {stats.icuBeds + 90}
            </p>
            <p className="text-xs text-[#16A34A] font-semibold mt-2">Verified Open Capacity</p>
          </div>

          <div className="card p-6 border-l-4 border-l-amber-500">
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Ventilators</p>
            <p className="text-4xl font-extrabold text-[#D97706]" style={{ fontFamily: 'Sora' }}>
              {stats.ventilators + 18}
            </p>
            <p className="text-xs text-slate-500 font-semibold mt-2">Deployable Immediately</p>
          </div>
        </div>

        {/* NETWORK CAPACITY WARNING CARD */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-amber-200/80 rounded-xl text-amber-900 flex-shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-900 tracking-wider uppercase">
                  ⚠️ ICU CAPACITY PREDICTIVE WARNING
                </span>
                <h3 className="text-xl font-extrabold text-amber-950 mt-0.5" style={{ fontFamily: 'Sora' }}>
                  Central Zone predicted to exceed 90% utilization in <span className="text-[#DC2626] font-mono">2h 17m</span>
                </h3>
                <p className="text-xs text-amber-900 mt-1">
                  Recommended action: 8 compatible ICU beds are currently available within 15 km in East Zone.
                </p>
              </div>
            </div>

            <Link
              href="/transfer"
              className="btn-primary bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs !h-11 px-6 whitespace-nowrap"
            >
              View Redistribution Options →
            </Link>
          </div>
        </div>

        {/* CAPACITY FORECAST CHART & REGISTRY */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Capacity Forecast Line Chart */}
          <div className="card p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#172033]" style={{ fontFamily: 'Sora' }}>
                ICU Utilization Forecast (Central Zone)
              </h3>
              <p className="text-xs text-slate-500">Predictive timeline based on hospital admission velocity.</p>
            </div>

            <div className="h-64 w-full mb-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={FORECAST_DATA}>
                  <XAxis dataKey="time" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip />
                  <Area type="monotone" dataKey="icu" stroke="#D97706" fill="#FDE68A" fillOpacity={0.5} strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900 font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="text-[#DC2626] flex-shrink-0" />
              <span>⚠️ Capacity Risk: Central Zone may reach critical ICU capacity within 2 hours.</span>
            </div>
          </div>

          {/* Regional Health Nodes Summary */}
          <div className="card p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#172033] mb-1" style={{ fontFamily: 'Sora' }}>
                Regional Telemetry Overview
              </h3>
              <p className="text-xs text-slate-500 mb-4">Real-time status of connected healthcare nodes.</p>

              <div className="space-y-3">
                {hospitals.slice(0, 4).map(h => (
                  <div key={h.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <p className="font-bold text-sm text-[#172033]" style={{ fontFamily: 'Sora' }}>{h.name}</p>
                      <p className="text-xs text-slate-500">{h.icu.available} ICU beds open · {h.emergencyLoad}% load</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      h.status === 'available' ? 'badge-available' : h.status === 'limited' ? 'badge-limited' : 'badge-critical'
                    }`}>
                      {h.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/emergency/results" className="mt-6 text-center text-xs font-bold text-[#087F8C] hover:underline block pt-3 border-t border-slate-100">
              View All 247 Connected Facilities →
            </Link>
          </div>
        </div>

        {/* HOSPITAL STATUS REGISTRY TABLE */}
        <div className="card p-6 md:p-8 overflow-hidden">
          <h2 className="text-xl font-bold text-[#172033] mb-4" style={{ fontFamily: 'Sora' }}>
            Connected Network Hospital Registry
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4">Hospital Name</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">ICU Capacity</th>
                  <th className="py-3 px-4">ED Load</th>
                  <th className="py-3 px-4">Ventilators</th>
                  <th className="py-3 px-4">Reliability</th>
                  <th className="py-3 px-4 text-right">Last Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {hospitals.map(h => (
                  <tr key={h.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#172033]">{h.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.status === 'available' ? 'badge-available' : h.status === 'limited' ? 'badge-limited' : 'badge-critical'
                      }`}>
                        {h.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">{h.icu.available} / {h.icu.total}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{h.emergencyLoad}%</td>
                    <td className="py-3.5 px-4 font-mono text-slate-700">{h.ventilators.available}</td>
                    <td className="py-3.5 px-4 font-bold text-[#16A34A]">{h.reliabilityScore}%</td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500">{h.lastSyncSeconds}s ago</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
