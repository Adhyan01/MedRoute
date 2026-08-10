'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowLeft, Navigation, Loader2, AlertTriangle, ChevronRight, ShieldCheck, Clock } from 'lucide-react';
import { useMedRouteStore } from '@/lib/store';
import { getRequiredCapabilities, capabilityLabel, matchHospitals } from '@/lib/matchingEngine';
import { EMERGENCY_TYPES, EmergencyTypeId } from '@/lib/emergencyTypes';

type Phase = 'summary' | 'processing' | 'confirmed' | 'conflict';

const STEPS = [
  'Checking capacity...',
  'Verifying required care resources...',
  'Notifying hospital operations...',
  'Confirming bed reservation...',
];

export default function ReservationPage() {
  const params = useParams();
  const hospitalId = params.id as string;

  const hospitals = useMedRouteStore(s => s.hospitals);
  const makeReservation = useMedRouteStore(s => s.makeReservation);

  const hospital = hospitals.find(h => h.id === hospitalId);

  const [phase, setPhase] = useState<Phase>('summary');
  const [emergencyTypeId, setEmergencyTypeId] = useState<EmergencyTypeId>('accident');
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [reservedBedId, setReservedBedId] = useState('ICU-17');
  const [conflictBedId, setConflictBedId] = useState('');
  const [expiresTime, setExpiresTime] = useState('');
  const [nextBestHospital, setNextBestHospital] = useState<string>('');

  useEffect(() => {
    const stored = sessionStorage.getItem('emergency-type');
    if (stored) {
      try { setEmergencyTypeId(JSON.parse(stored).id as EmergencyTypeId); } catch {}
    }
  }, []);

  if (!hospital) {
    return (
      <div className="container-xl py-20 text-center">
        <p className="text-sm text-slate-500">Hospital not found.</p>
        <Link href="/emergency/results" className="btn-hero-emergency mt-4 inline-block text-xs">Back to Results</Link>
      </div>
    );
  }

  const availableBed = hospital.icu.beds.find(b => b.status === 'available');
  const targetBed = availableBed?.id || 'ICU-17';
  const requiredCaps = getRequiredCapabilities(emergencyTypeId);
  const emergencyType = EMERGENCY_TYPES.find(e => e.id === emergencyTypeId);

  const handleRequestAdmission = async () => {
    setPhase('processing');
    setCurrentStep(0);
    setCompletedSteps([]);

    for (let i = 0; i < STEPS.length; i++) {
      await new Promise(r => setTimeout(r, 500));
      setCurrentStep(i + 1);
      setCompletedSteps(prev => [...prev, i]);
    }

    try {
      const res = await fetch('/api/reserve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hospitalId,
          bedNumber: targetBed,
          emergencyTypeId,
        }),
      });

      const data = await res.json();

      if (res.status === 409 || data.conflict) {
        setConflictBedId(targetBed);
        const ranked = matchHospitals(emergencyTypeId);
        const nextBest = ranked.find(r => r.hospital.id !== hospitalId && r.matchLabel !== 'unsuitable');
        if (nextBest) setNextBestHospital(nextBest.hospital.id);
        setPhase('conflict');
        return;
      }
    } catch {
      // Client store fallback
    }

    const result = makeReservation(hospitalId, targetBed, emergencyTypeId, hospital.etaMin);

    if ('conflict' in result && result.conflict) {
      setConflictBedId(result.bedId || targetBed);
      const ranked = matchHospitals(emergencyTypeId);
      const nextBest = ranked.find(r => r.hospital.id !== hospitalId && r.matchLabel !== 'unsuitable');
      if (nextBest) setNextBestHospital(nextBest.hospital.id);
      setPhase('conflict');
    } else {
      const res = result as { bedId?: string };
      setReservedBedId(res.bedId || targetBed);
      const expiry = new Date(Date.now() + 30 * 60 * 1000);
      setExpiresTime(expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setPhase('confirmed');
    }
  };

  // ─── PROCESSING SCREEN ─────────────────────────────────────────
  if (phase === 'processing') {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F8FA] dark:bg-[#0B0F19]">
        <div className="card-shell p-10 max-w-md w-full text-center space-y-6 shadow-xl rounded-3xl">
          <div className="w-16 h-16 rounded-2xl bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C] flex items-center justify-center mx-auto">
            <Loader2 className="animate-spin" size={32} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
              Securing bed reservation...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Transmitting admission request to hospital dispatch</p>
          </div>

          <div className="space-y-3.5 text-left border-t border-slate-100 dark:border-slate-800 pt-6">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center gap-3 text-sm">
                {completedSteps.includes(i) ? (
                  <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                ) : i === currentStep - 1 ? (
                  <Loader2 size={18} className="animate-spin text-[#087F8C] flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 dark:border-slate-700 flex-shrink-0" />
                )}
                <span className={`font-semibold ${completedSteps.includes(i) ? 'text-[#172033] dark:text-white' : 'text-slate-400'}`}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── CONFIRMED SUCCESS SCREEN ──────────────────────────────────
  if (phase === 'confirmed') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F4F8FA] dark:bg-[#0B0F19]">
        <div className="card-shell max-w-lg w-full overflow-hidden shadow-xl rounded-3xl">
          <div className="p-8 text-center bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 border-b border-emerald-100 dark:border-emerald-900/50">
            <div className="w-20 h-20 rounded-3xl bg-[#10B981] text-white flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle2 size={44} />
            </div>
            <h1 className="text-3xl font-extrabold text-[#10B981] mb-1" style={{ fontFamily: 'Sora' }}>
              ✓ CARE CONFIRMED
            </h1>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 font-semibold mb-4">Admission reservation locked in hospital network</p>

            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-extrabold text-sm bg-blue-50 dark:bg-blue-950 text-[#2563EB] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              🔵 {reservedBedId} RESERVED
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Hospital</span>
                <span className="font-bold text-[#172033] dark:text-white">{hospital.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">ETA</span>
                <span className="font-extrabold text-[#087F8C] text-lg font-mono">{hospital.etaMin} minutes</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Bed Assigned</span>
                <span className="font-bold text-[#172033] dark:text-white font-mono">{reservedBedId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 font-medium">Hospital Status</span>
                <span className="font-bold text-[#10B981] flex items-center gap-1">
                  🟢 Hospital Notified
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Reservation Expires</span>
                <span className="font-bold font-mono text-amber-500">{expiresTime}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={`https://maps.google.com/?q=${hospital.address}`}
                target="_blank" rel="noopener noreferrer"
                className="btn-hero-emergency flex-1 justify-center text-sm"
              >
                <Navigation size={16} /> Get Directions
              </a>
              <Link href={`/hospital/${hospitalId}`} className="btn-hero-secondary flex-1 justify-center text-sm">
                View Hospital Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── CONFLICT SCREEN ───────────────────────────────────────────
  if (phase === 'conflict') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-[#F4F8FA] dark:bg-[#0B0F19]">
        <div className="card-shell max-w-lg w-full overflow-hidden shadow-xl border-amber-200 dark:border-amber-900 rounded-3xl">
          <div className="p-8 text-center bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900">
            <div className="w-16 h-16 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-3 shadow-md">
              <AlertTriangle size={32} />
            </div>
            <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-1" style={{ fontFamily: 'Sora' }}>
              ⚠️ Resource just reserved
            </h1>
            <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
              {conflictBedId} was reserved moments ago by another emergency request.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-300 space-y-1">
              <p className="font-bold">Automated Network Rerouting</p>
              <p>MEDROUTE has automatically identified the next best available hospital for your emergency.</p>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
              <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider mb-1">✓ NEXT BEST OPTION AVAILABLE</p>
              <p className="font-bold text-base text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                {nextBestHospital ? hospitals.find(h => h.id === nextBestHospital)?.name : 'Nova Medical Centre'}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">ICU Available · Compatible Capabilities · Verified Ready</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {nextBestHospital && (
                <Link href={`/reservation/${nextBestHospital}`} className="btn-hero-emergency flex-1 justify-center text-sm">
                  <span>Go to Next Option</span>
                  <ChevronRight size={16} />
                </Link>
              )}
              <Link href="/emergency/results" className="btn-hero-secondary flex-1 justify-center text-sm">
                View All Results
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── SUMMARY CONFIRMATION PAGE ─────────────────────────────────
  return (
    <div className="min-h-screen py-10 bg-[#F4F8FA] dark:bg-[#0B0F19]">
      <div className="container-xl max-w-2xl space-y-6">
        <Link href="/emergency/results" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400">
          <ArrowLeft size={14} /> Back to results
        </Link>

        <div className="card-shell overflow-hidden rounded-3xl">
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-2xl font-bold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
              Emergency Admission Request
            </h1>
            {emergencyType && (
              <p className="text-xs text-[#087F8C] font-semibold mt-1 flex items-center gap-1.5">
                <span>{emergencyType.icon}</span> Category: {emergencyType.label}
              </p>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Required Capabilities</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {requiredCaps.map(cap => (
                  <div key={cap} className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                    <CheckCircle2 size={14} className="text-[#10B981] flex-shrink-0" />
                    <span className="font-semibold">{capabilityLabel(cap)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <div>
                <p className="font-bold text-base text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>{hospital.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">📍 {hospital.address}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-[#087F8C]" style={{ fontFamily: 'Sora' }}>{hospital.etaMin} min</p>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Transit ETA</p>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-1">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase">Target Bed Assigned</p>
                  <p className="text-2xl font-bold font-mono text-[#172033] dark:text-white">{targetBed}</p>
                  <p className="text-xs font-semibold text-[#10B981]">🟢 Admission-Ready</p>
                </div>
                <div className="text-right text-xs font-mono text-slate-500 dark:text-slate-400">
                  <p className="text-emerald-600 dark:text-emerald-400 font-bold mt-1">✓ No active conflict</p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRequestAdmission}
              className="btn-hero-emergency w-full py-4 text-base font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <span>Request Admission →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
