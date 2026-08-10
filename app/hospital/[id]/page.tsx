'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, XCircle, Clock, ChevronRight, Shield } from 'lucide-react';
import { useMedRouteStore } from '@/lib/store';
import { BedStatus } from '@/lib/hospitals';

function BedStatusBadge({ status }: { status: BedStatus }) {
  const map: Record<BedStatus, { label: string; className: string; dot: string }> = {
    available:      { label: 'AVAILABLE',      className: 'badge-available',     dot: '🟢' },
    occupied:       { label: 'OCCUPIED',        className: 'badge-critical',      dot: '🔴' },
    reserved:       { label: 'RESERVED',        className: 'badge-reserved',      dot: '🔵' },
    preparing:      { label: 'PREPARING',       className: 'badge-preparing',     dot: '🟡' },
    'out-of-service': { label: 'OUT OF SERVICE', className: 'bg-gray-100 text-gray-500 border border-gray-200', dot: '⚫' },
  };
  const { label, className, dot } = map[status];
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${className}`}>{dot} {label}</span>;
}

function UtilBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <div className="util-bar flex-1">
        <div className="util-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-xs font-mono font-semibold" style={{ color, minWidth: 36, fontFamily: 'JetBrains Mono', textAlign: 'right' }}>{pct}%</span>
    </div>
  );
}

export default function HospitalDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const hospitals = useMedRouteStore(s => s.hospitals);
  const hospital = hospitals.find(h => h.id === id);

  const [selectedBed, setSelectedBed] = useState<string | null>(null);

  if (!hospital) {
    return (
      <div className="container-xl py-20 text-center">
        <p style={{ color: '#5B6577' }}>Hospital not found.</p>
        <Link href="/emergency/results" className="btn-hero-emergency mt-4 inline-block px-6 py-3">Back</Link>
      </div>
    );
  }

  const statusMap: Record<string, { label: string; badge: string; bg: string }> = {
    available: { label: 'AVAILABLE', badge: 'badge-available', bg: '#DCFCE7' },
    limited:   { label: 'LIMITED',   badge: 'badge-limited',   bg: '#FEF3C7' },
    critical:  { label: 'CRITICAL',  badge: 'badge-critical',  bg: '#FEE2E2' },
  };
  const statusInfo = statusMap[hospital.status];

  const edColor = hospital.emergencyLoad < 60 ? '#16A34A' : hospital.emergencyLoad < 80 ? '#D97706' : '#DC2626';
  const icuOccupied = hospital.icu.total - hospital.icu.available - hospital.icu.reserved - hospital.icu.preparing;

  return (
    <div className="min-h-screen bg-[#F4F8FA] dark:bg-[#0B0F19]">
      {/* Breadcrumb + header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container-xl py-5">
          <nav className="breadcrumb mb-3 flex items-center gap-2 text-xs">
            <Link href="/" className="text-slate-500">Home</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <Link href="/emergency/results" className="text-slate-500">Hospitals</Link>
            <ChevronRight size={14} className="text-slate-400" />
            <span className="text-[#172033] dark:text-white font-bold">{hospital.name}</span>
          </nav>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                  {hospital.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusInfo.badge}`}>
                  {hospital.status === 'available' ? '🟢' : hospital.status === 'limited' ? '🟡' : '🔴'} {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">📍 {hospital.address}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                <span>📏 {hospital.distanceKm} km</span>
                <span><Clock size={13} className="inline mr-1" />{hospital.etaMin} min ETA</span>
                <span className="text-[#10B981] font-semibold">🟢 Real-time Capacity Verified</span>
              </div>
            </div>
            <Link href={`/reservation/${id}`} className="btn-hero-emergency px-6 py-3 flex items-center gap-2">
              Request Admission <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="container-xl py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Current Capacity */}
            <div className="card-shell p-6 rounded-3xl">
              <h2 className="text-lg font-bold mb-5 text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>Current Capacity</h2>
              <div className="space-y-5">
                {/* ICU */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-[#172033] dark:text-white">Intensive Care Unit (ICU)</span>
                    <span className="text-sm font-mono" style={{ fontFamily: 'JetBrains Mono' }}>
                      <span className="text-[#10B981] font-bold">{hospital.icu.available}</span>
                      <span className="text-slate-500"> / {hospital.icu.total} available</span>
                    </span>
                  </div>
                  <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <div className="bg-[#10B981]" style={{ width: `${(hospital.icu.available / hospital.icu.total) * 100}%` }} title="Available" />
                    <div className="bg-blue-400" style={{ width: `${(hospital.icu.reserved / hospital.icu.total) * 100}%` }} title="Reserved" />
                    <div className="bg-yellow-400" style={{ width: `${(hospital.icu.preparing / hospital.icu.total) * 100}%` }} title="Preparing" />
                    <div className="bg-red-500" style={{ width: `${(icuOccupied / hospital.icu.total) * 100}%` }} title="Occupied" />
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#10B981] inline-block" />Available: {hospital.icu.available}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400 inline-block" />Reserved: {hospital.icu.reserved}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-400 inline-block" />Preparing: {hospital.icu.preparing}</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Occupied: {icuOccupied}</span>
                  </div>
                </div>
                {/* General Ward */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-[#172033] dark:text-white">General Ward</span>
                    <span className="text-sm font-mono text-slate-500">
                      {hospital.availableBeds} / {hospital.totalBeds} available
                    </span>
                  </div>
                  <UtilBar value={hospital.totalBeds - hospital.availableBeds} max={hospital.totalBeds} color="#2563EB" />
                </div>
                {/* Emergency Dept */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-[#172033] dark:text-white">Emergency Department</span>
                    <span className="text-sm font-bold font-mono" style={{ color: edColor }}>{hospital.emergencyLoad}% utilization</span>
                  </div>
                  <UtilBar value={hospital.emergencyLoad} max={100} color={edColor} />
                </div>
              </div>
            </div>

            {/* ICU Bed Grid */}
            <div className="card-shell p-6 rounded-3xl">
              <h2 className="text-lg font-bold mb-4 text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>ICU Bed Status</h2>
              <div className="flex flex-wrap gap-2 mb-4 text-xs text-slate-500">
                {[{ dot: '🟢', label: 'Available' }, { dot: '🔴', label: 'Occupied' }, { dot: '🔵', label: 'Reserved' }, { dot: '🟡', label: 'Preparing' }].map(({ dot, label }) => (
                  <span key={label} className="flex items-center gap-1">{dot} {label}</span>
                ))}
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {hospital.icu.beds.map(bed => (
                  <div
                    key={bed.id}
                    onClick={() => setSelectedBed(selectedBed === bed.id ? null : bed.id)}
                    className={`bed-${bed.status} rounded-lg p-2 text-center cursor-pointer transition-all hover:scale-105 relative`}
                    title={`${bed.id}: ${bed.status}`}
                  >
                    <div className="text-xs font-bold font-mono" style={{ fontSize: '10px' }}>
                      {bed.id.replace('ICU-', '')}
                    </div>
                    {selectedBed === bed.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-20 tooltip shadow-xl" style={{ minWidth: 120 }}>
                        <p className="font-bold text-xs mb-1">{bed.id}</p>
                        <BedStatusBadge status={bed.status} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Specialists */}
            <div className="card-shell p-6 rounded-3xl">
              <h2 className="text-lg font-bold mb-4 text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>Specialists</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {hospital.specialists.map(spec => (
                  <div key={spec.role} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                    <div>
                      <p className="font-semibold text-sm text-[#172033] dark:text-white">{spec.role}</p>
                      <p className="text-xs text-slate-500">{spec.name}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${spec.availability === 'available' ? 'badge-available' : spec.availability === 'on-call' ? 'badge-limited' : 'badge-critical'}`}>
                      {spec.availability === 'available' ? '🟢 Available' : spec.availability === 'on-call' ? '🟡 On Call' : '🔴 Unavailable'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Side column */}
          <div className="space-y-6">
            {/* Resources */}
            <div className="card-shell p-6 rounded-3xl">
              <h2 className="text-lg font-bold mb-4 text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>Resources</h2>
              <div className="space-y-3">
                {[
                  { label: `Ventilators (${hospital.ventilators.available} of ${hospital.ventilators.total} available)`, available: hospital.ventilators.available > 0 },
                  { label: 'CT Scanner', available: hospital.ct },
                  { label: 'MRI', available: hospital.mri },
                  { label: 'Blood Bank', available: hospital.bloodBank },
                  { label: `Operating Theatre (${hospital.operatingTheatres.available} available)`, available: hospital.operatingTheatres.available > 0 },
                  { label: 'Emergency Department', available: hospital.emergencyDept },
                  { label: 'Trauma Capability', available: hospital.trauma },
                  { label: 'Paediatric Care', available: hospital.pediatrics },
                ].map(({ label, available }) => (
                  <div key={label} className="flex items-center gap-3 text-sm">
                    {available
                      ? <CheckCircle size={16} className="text-[#10B981] flex-shrink-0" />
                      : <XCircle size={16} className="text-red-500 flex-shrink-0" />}
                    <span className={available ? 'text-[#172033] dark:text-white font-medium' : 'text-slate-400 line-through'}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification */}
            <div className="card-shell p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-4">
                <Shield size={20} className="text-[#10B981]" />
                <h2 className="text-lg font-bold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>Verification</h2>
              </div>

              <div className="p-3.5 rounded-xl mb-4 text-center bg-[#ECFDF5] dark:bg-emerald-950/60 border border-[#A7F3D0]">
                <p className="font-bold text-[#047857] dark:text-emerald-300">🟢 Real-time Capacity Verified</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Reliability Score</span>
                  <span className="font-bold text-[#10B981]">{hospital.reliabilityScore}%</span>
                </div>
                <div className="util-bar">
                  <div className="util-bar-fill util-low" style={{ width: `${hospital.reliabilityScore}%` }} />
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Confirmed: {hospital.confirmedRequests.toLocaleString()}</span>
                  <span>Successful: {hospital.successfulAdmissions.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* CTA */}
            <Link href={`/reservation/${id}`} className="btn-hero-emergency w-full py-4 text-center block font-bold text-lg shadow-xl">
              Request Admission →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
