'use client';

import { useState, useEffect } from 'react';
import { useMedRouteStore } from '@/lib/store';
import { BedStatus } from '@/lib/hospitals';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Bell,
  LayoutDashboard,
  BedDouble,
  Siren,
  FileText,
  Boxes,
  Users,
  BarChart3,
  Check,
  RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const ICU_CHARTS_DATA = [
  { time: '10:00', icu: 65, emergency: 40 },
  { time: '11:00', icu: 70, emergency: 48 },
  { time: '12:00', icu: 78, emergency: 55 },
  { time: '13:00', icu: 82, emergency: 62 },
  { time: '14:00', icu: 88, emergency: 58 },
  { time: '15:00', icu: 91, emergency: 42 },
];

export default function HospitalDashboardPage() {
  const hospitals = useMedRouteStore(s => s.hospitals);
  const incomingEmergencies = useMedRouteStore(s => s.incomingEmergencies);
  const acceptEmergency = useMedRouteStore(s => s.acceptEmergency);
  const declineEmergency = useMedRouteStore(s => s.declineEmergency);
  const updateBedStatus = useMedRouteStore(s => s.updateBedStatus);
  const tickSimulation = useMedRouteStore(s => s.tickSimulation);

  const citycare = hospitals.find(h => h.id === 'citycare') || hospitals[0];
  const [selectedBedId, setSelectedBedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');

  useEffect(() => {
    const timer = setInterval(() => {
      tickSimulation();
    }, 2500);
    return () => clearInterval(timer);
  }, [tickSimulation]);

  const activeIncoming = incomingEmergencies.find(e => e.status === 'incoming');

  return (
    <div className="min-h-screen flex bg-[#F6F9FB]">

      {/* LEFT SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#172033] text-white p-6 border-r border-slate-800 flex-shrink-0">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#087F8C] flex items-center justify-center font-bold text-white">
            <Activity size={18} />
          </div>
          <span className="font-extrabold text-lg tracking-tight" style={{ fontFamily: 'Sora' }}>
            CityCare <span className="text-[#087F8C]">OPS</span>
          </span>
        </div>

        <nav className="space-y-1.5 flex-1 text-xs font-semibold">
          {[
            { label: 'Overview', icon: LayoutDashboard },
            { label: 'Beds', icon: BedDouble },
            { label: 'Emergency', icon: Siren },
            { label: 'Requests', icon: FileText },
            { label: 'Resources', icon: Boxes },
            { label: 'Specialists', icon: Users },
            { label: 'Reports', icon: BarChart3 },
          ].map(({ label, icon: Icon }) => (
            <button
              key={label}
              onClick={() => setActiveTab(label)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl transition-colors text-left ${
                activeTab === label
                  ? 'bg-[#087F8C] text-white font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-300">Node ID: HOSP-ND-0104</p>
          <p>FHIR API Endpoint Active</p>
          <p className="text-emerald-400 font-semibold pt-1">● HL7 Telemetry Active</p>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 min-w-0 pb-12">
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>
                CityCare Hospital Operations
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#16A34A] border border-emerald-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#16A34A] pulse-dot" />
                SYSTEM SYNCHRONIZED
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Central Zone Dispatch · Real-time Telemetry Sync Active
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              HL7/FHIR v4.0.1
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* INCOMING EMERGENCY ALERT BANNER */}
          {activeIncoming ? (
            <div className="incoming-alert p-6 md:p-8 shadow-lg animate-pulse">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[#DC2626] font-extrabold text-xs uppercase tracking-widest">
                    <Bell className="animate-bounce" size={18} />
                    🚨 CRITICAL PATIENT INCOMING
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>
                    {activeIncoming.emergencyType.toUpperCase()} EMERGENCY DISPATCH
                  </h2>
                  <p className="text-xs text-slate-700">
                    Assigned Bed: <span className="font-bold text-[#2563EB] font-mono text-sm">{activeIncoming.reservedBedId}</span> ·
                    Required: ICU Bed, Trauma Surgeon, CT Scanner, Blood Bank
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center px-4 py-3 bg-white rounded-xl border border-red-200 shadow-sm">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">PATIENT ETA</p>
                    <p className="text-3xl font-extrabold text-[#DC2626] font-mono">{activeIncoming.eta} MIN</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => acceptEmergency(activeIncoming.id)}
                      className="btn-hero-emergency bg-[#16A34A] hover:bg-[#15803D] text-white font-bold text-xs !h-11 px-5"
                    >
                      <CheckCircle2 size={16} /> ACCEPT & RESERVE
                    </button>
                    <button
                      onClick={() => declineEmergency(activeIncoming.id)}
                      className="btn-hero-secondary border-red-300 text-red-700 hover:bg-red-50 font-bold text-xs !h-11 px-5"
                    >
                      <XCircle size={16} /> DECLINE
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-5 bg-white flex items-center justify-between border-l-4 border-l-[#087F8C]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#087F8C] flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-[#172033]" style={{ fontFamily: 'Sora' }}>
                    Monitoring Emergency Intake Channels
                  </h3>
                  <p className="text-xs text-slate-500">Real-time network telemetry active. Standby mode.</p>
                </div>
              </div>
              <span className="text-xs font-mono bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-semibold">
                Standby Mode
              </span>
            </div>
          )}

          {/* MAIN METRICS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="card p-6">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Total Bed Capacity</p>
              <p className="text-3xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>{citycare.totalBeds}</p>
              <p className="text-xs text-[#16A34A] font-semibold mt-2">🛏 {citycare.availableBeds} beds available</p>
            </div>

            <div className="card p-6">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">ICU Availability</p>
              <p className="text-3xl font-extrabold text-[#087F8C]" style={{ fontFamily: 'Sora' }}>
                {citycare.icu.available} / {citycare.icu.total}
              </p>
              <p className="text-xs text-[#2563EB] font-semibold mt-2">🔵 {citycare.icu.reserved} reserved</p>
            </div>

            <div className="card p-6">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Emergency ED Load</p>
              <p className="text-3xl font-extrabold text-[#D97706]" style={{ fontFamily: 'Sora' }}>{citycare.emergencyLoad}%</p>
              <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-[#D97706] h-full rounded-full" style={{ width: `${citycare.emergencyLoad}%` }} />
              </div>
            </div>

            <div className="card p-6">
              <p className="text-xs text-slate-500 font-bold uppercase mb-1">Ventilators</p>
              <p className="text-3xl font-extrabold text-[#2563EB]" style={{ fontFamily: 'Sora' }}>
                {citycare.ventilators.available} / {citycare.ventilators.total}
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-2">Ready for deployment</p>
            </div>
          </div>

          {/* ICU BED GRID */}
          <div className="card p-6 md:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-[#172033]" style={{ fontFamily: 'Sora' }}>
                  ICU Bed Operations & Status Grid
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Click any bed square to toggle status or manage reservation.</p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bed-available inline-block" /> Available ({citycare.icu.available})</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bed-occupied inline-block" /> Occupied ({citycare.icu.beds.filter(b => b.status === 'occupied').length})</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bed-reserved inline-block" /> Reserved ({citycare.icu.reserved})</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bed-preparing inline-block" /> Preparing ({citycare.icu.preparing})</span>
              </div>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
              {citycare.icu.beds.map(bed => (
                <div
                  key={bed.id}
                  onClick={() => setSelectedBedId(selectedBedId === bed.id ? null : bed.id)}
                  className={`bed-${bed.status} rounded-xl p-3 text-center cursor-pointer transition-all hover:scale-105 relative shadow-sm`}
                >
                  <p className="text-xs font-mono font-bold">{bed.id}</p>
                  <p className="text-[10px] font-semibold capitalize mt-1 truncate">{bed.status}</p>

                  {selectedBedId === bed.id && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-30 card p-3 shadow-xl text-left w-48 bg-white border border-slate-200">
                      <p className="font-bold text-xs text-[#172033] mb-2 border-b pb-1">Manage {bed.id}</p>
                      <div className="space-y-1 text-xs">
                        {(['available', 'occupied', 'reserved', 'preparing'] as BedStatus[]).map((st) => (
                          <button
                            key={st}
                            onClick={(e) => {
                              e.stopPropagation();
                              updateBedStatus(citycare.id, bed.id, st);
                              setSelectedBedId(null);
                            }}
                            className={`w-full text-left px-2 py-1 rounded font-medium hover:bg-slate-100 capitalize ${
                              bed.status === st ? 'text-[#087F8C] font-bold bg-teal-50' : 'text-slate-700'
                            }`}
                          >
                            Mark as {st}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* CAPACITY CHARTS */}
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#172033] mb-4" style={{ fontFamily: 'Sora' }}>
                ICU Utilization Trend (Last 6 Hours)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ICU_CHARTS_DATA}>
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Area type="monotone" dataKey="icu" stroke="#087F8C" fill="#087F8C" fillOpacity={0.15} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-[#172033] mb-4" style={{ fontFamily: 'Sora' }}>
                Emergency Department Load History
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={ICU_CHARTS_DATA}>
                    <XAxis dataKey="time" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="emergency" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
