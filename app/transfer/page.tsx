'use client';

import { useState, useMemo } from 'react';
import { useMedRouteStore } from '@/lib/store';
import {
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Shield,
  MapPin,
  Ambulance,
  SlidersHorizontal,
  ChevronRight,
  Activity,
  Award,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAccessibility } from '@/lib/accessibilityContext';
import { getStoredPatientLocation } from '@/lib/googleMaps';

export default function TransferPage() {
  const { theme } = useAccessibility();
  const isDark = theme === 'dark';
  const hospitals = useMedRouteStore(s => s.hospitals);

  const [reqIcu, setReqIcu] = useState(true);
  const [reqVent, setReqVent] = useState(true);
  const [reqNeuro, setReqNeuro] = useState(true);
  const [reqBlood, setReqBlood] = useState(true);
  const [reqTrauma, setReqTrauma] = useState(false);
  const [radius, setRadius] = useState(25);

  const patientLoc = useMemo(() => getStoredPatientLocation(), []);

  // Filter & rank transfer candidate hospitals dynamically based on requirements & search radius
  const filteredCandidates = useMemo(() => {
    return hospitals
      .filter(h => h.id !== 'citycare' && h.acceptingTransfers && h.distanceKm <= radius)
      .map(h => {
        let score = 100;
        const matched: string[] = [];
        const missing: string[] = [];

        if (reqIcu) {
          if (h.icu.available > 0) matched.push('ICU Bed');
          else { missing.push('ICU Bed'); score -= 30; }
        }
        if (reqVent) {
          if (h.ventilators.available > 0) matched.push('Ventilator');
          else { missing.push('Ventilator'); score -= 25; }
        }
        if (reqNeuro) {
          if (h.neurology) matched.push('Neurologist');
          else { missing.push('Neurologist'); score -= 20; }
        }
        if (reqBlood) {
          if (h.bloodBank) matched.push('Blood Bank');
          else { missing.push('Blood Bank'); score -= 15; }
        }
        if (reqTrauma) {
          if (h.trauma) matched.push('Trauma Center');
          else { missing.push('Trauma Center'); score -= 20; }
        }

        // Distance penalty
        score -= Math.min(20, Math.round(h.distanceKm * 0.8));
        const finalScore = Math.max(45, Math.min(99, score));

        return { hospital: h, score: finalScore, matched, missing };
      })
      .sort((a, b) => b.score - a.score);
  }, [hospitals, reqIcu, reqVent, reqNeuro, reqBlood, reqTrauma, radius]);

  const bestMatch = filteredCandidates[0];
  const otherCandidates = filteredCandidates.slice(1);

  return (
    <div className="min-h-screen py-10 bg-[#F4F8FA] dark:bg-[#0B0F19]">
      <div className="container-xl max-w-5xl space-y-8">

        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E6F7F5] dark:bg-teal-950/80 text-[#087F8C] dark:text-teal-300 border border-teal-200 dark:border-teal-800">
            <Ambulance size={16} /> INTER-FACILITY PATIENT TRANSFER PROTOCOL
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
            Find a hospital for patient transfer
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-2xl leading-relaxed">
            Coordinate inter-hospital transfers for patients requiring specialized critical care, surgery or unavailable ICU resources.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* LEFT COLUMN: Transfer Criteria Form */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card-shell p-6 rounded-3xl space-y-6">

              {/* Originating Node */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Originating Medical Facility
                </span>
                <p className="font-bold text-[#172033] dark:text-white text-lg" style={{ fontFamily: 'Sora' }}>
                  CityCare Hospital
                </p>
                <p className="text-xs text-[#087F8C] dark:text-teal-300 font-semibold mt-0.5 flex items-center gap-1">
                  📍 Central Zone Dispatch Node
                </p>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Required Capabilities Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                    Required Transfer Capabilities
                  </h3>
                  <SlidersHorizontal size={14} className="text-slate-400" />
                </div>

                <div className="space-y-2.5">
                  {[
                    { id: 'icu', label: 'ICU Bed Available', state: reqIcu, setter: setReqIcu },
                    { id: 'vent', label: 'Ventilator Support', state: reqVent, setter: setReqVent },
                    { id: 'neuro', label: 'Neurosurgeon / Neurology', state: reqNeuro, setter: setReqNeuro },
                    { id: 'blood', label: 'Blood Bank Capacity', state: reqBlood, setter: setReqBlood },
                    { id: 'trauma', label: 'Trauma Center / Surgery', state: reqTrauma, setter: setReqTrauma },
                  ].map(({ id, label, state, setter }) => (
                    <label
                      key={id}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                        state
                          ? 'border-[#087F8C] bg-[#E6F7F5] dark:bg-teal-950/70 text-[#087F8C] dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{label}</span>
                      <input
                        type="checkbox"
                        checked={state}
                        onChange={(e) => setter(e.target.checked)}
                        className="w-4 h-4 rounded text-[#087F8C] focus:ring-[#087F8C]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              <hr className="border-slate-100 dark:border-slate-800" />

              {/* Radius Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-slate-500">Maximum Search Radius</span>
                  <span className="text-[#087F8C] dark:text-teal-300 font-extrabold font-mono text-sm">{radius} km</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                  className="w-full accent-[#087F8C] cursor-pointer"
                />
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: Transfer Search Results */}
          <div className="lg:col-span-8 space-y-6">
            {bestMatch ? (
              <>
                {/* BEST TRANSFER MATCH CARD */}
                <div className="card-shell p-6 sm:p-8 rounded-3xl border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-br from-emerald-50/40 via-white to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900 shadow-xl">
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                    <div>
                      <span className="px-3.5 py-1 rounded-full text-xs font-extrabold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1.5 inline-flex mb-2">
                        <Award size={14} /> 🏆 BEST TRANSFER MATCH
                      </span>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                        {bestMatch.hospital.name}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        📍 {bestMatch.hospital.address} · {bestMatch.hospital.distanceKm} km away
                      </p>
                    </div>

                    <div className="text-right p-3 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 shadow-sm">
                      <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 block" style={{ fontFamily: 'Sora' }}>
                        {bestMatch.score}%
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Compatibility</p>
                    </div>
                  </div>

                  {/* MATCHED CAPABILITIES GRID */}
                  <div className="grid sm:grid-cols-2 gap-2 text-xs mb-6 font-semibold">
                    {bestMatch.matched.map(cap => (
                      <div key={cap} className="flex items-center gap-2 p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-900">
                        <CheckCircle2 size={15} className="text-[#10B981] flex-shrink-0" />
                        <span>{cap} Available</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 mb-6 text-xs">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold">Estimated Ambulance Transit Time:</span>
                    <span className="font-extrabold text-[#087F8C] font-mono text-sm">{bestMatch.hospital.etaMin} minutes (Emergency Priority)</span>
                  </div>

                  <Link
                    href={`/reservation/${bestMatch.hospital.id}`}
                    className="btn-hero-emergency w-full py-4 text-center font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl"
                  >
                    <span>Request Transfer & Reserve Bed</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>

                {/* ALTERNATIVE CANDIDATES */}
                {otherCandidates.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider pt-2">
                      Alternative Transfer Facilities Within {radius} km
                    </h3>

                    {otherCandidates.map(({ hospital: h, score }) => (
                      <div key={h.id} className="card-shell p-5 rounded-2xl flex items-center justify-between gap-4 card-hover">
                        <div className="space-y-1">
                          <h4 className="font-bold text-[#172033] dark:text-white text-base" style={{ fontFamily: 'Sora' }}>{h.name}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">📍 {h.distanceKm} km away · {h.etaMin} min ETA</p>
                          <div className="flex flex-wrap gap-2 text-xs text-[#10B981] font-semibold pt-1">
                            <span>✓ ICU ({h.icu.available} beds open)</span>
                            <span>✓ Accepts Transfers</span>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-sm font-extrabold text-[#087F8C] block mb-2" style={{ fontFamily: 'Sora' }}>
                            {score}% Match
                          </span>
                          <Link href={`/reservation/${h.id}`} className="btn-hero-secondary text-xs !py-2 !px-4">
                            Select Facility
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* EMPTY STATE */
              <div className="card-shell p-8 text-center space-y-4 rounded-3xl border border-amber-200 dark:border-amber-900">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h3 className="text-lg font-bold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                  No Transfer Facility Found Within {radius} km
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try expanding your search radius using the slider or adjusting required patient care capabilities.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
