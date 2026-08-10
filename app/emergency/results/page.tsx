'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  Clock,
  ArrowLeft,
  Navigation,
  ChevronRight,
  Shield,
  Award,
  MapPin,
  AlertCircle,
  RotateCcw,
  Compass,
  PhoneCall,
  Activity,
  HeartPulse,
  Info,
  ShieldAlert,
  Layers,
  Sparkles
} from 'lucide-react';
import { useMedRouteStore } from '@/lib/store';
import { matchHospitals, capabilityLabel, MatchResult } from '@/lib/matchingEngine';
import { EMERGENCY_TYPES, EmergencyTypeId } from '@/lib/emergencyTypes';
import { useAccessibility } from '@/lib/accessibilityContext';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import {
  PatientLocation,
  getStoredPatientLocation,
  savePatientLocation,
  isLocationOutsideNetwork,
  DEFAULT_PATIENT_LOCATION,
} from '@/lib/googleMaps';

// ─── DYNAMIC GEOGRAPHIC SVG NETWORK MAP (TOGGLEABLE) ────────────────
function DynamicResultsMap({
  results,
  patientLoc,
  selectedId,
  onSelect,
}: {
  results: MatchResult[];
  patientLoc: PatientLocation;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const { theme } = useAccessibility();
  const isDark = theme === 'dark';

  const allLats = [patientLoc.latitude, ...results.map(r => r.hospital.lat)];
  const allLngs = [patientLoc.longitude, ...results.map(r => r.hospital.lng)];

  const minLat = Math.min(...allLats) - 0.04;
  const maxLat = Math.max(...allLats) + 0.04;
  const minLng = Math.min(...allLngs) - 0.04;
  const maxLng = Math.max(...allLngs) + 0.04;

  const latRange = Math.max(0.05, maxLat - minLat);
  const lngRange = Math.max(0.05, maxLng - minLng);

  const toSvgCoords = (lat: number, lng: number) => {
    const x = Math.round(((lng - minLng) / lngRange) * 520 + 40);
    const y = Math.round((1 - (lat - minLat) / latRange) * 310 + 40);
    return { x, y };
  };

  const patientSvg = toSvgCoords(patientLoc.latitude, patientLoc.longitude);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden shadow-md border border-slate-200 dark:border-slate-800" style={{ paddingBottom: '68%' }}>
      <svg viewBox="0 0 600 390" className="absolute inset-0 w-full h-full" style={{ background: isDark ? '#0F172A' : '#F1F5F9' }}>
        {[80, 160, 240, 320, 400, 480, 560].map(x => (
          <line key={`v${x}`} x1={x} y1={0} x2={x} y2={390} stroke={isDark ? '#1E293B' : '#CBD5E1'} strokeWidth="1.5" strokeDasharray="4 4" />
        ))}
        {[65, 130, 195, 260, 325].map(y => (
          <line key={`h${y}`} x1={0} y1={y} x2={600} y2={y} stroke={isDark ? '#1E293B' : '#CBD5E1'} strokeWidth="1.5" strokeDasharray="4 4" />
        ))}

        {results.slice(0, 4).map((r, i) => {
          const hPos = toSvgCoords(r.hospital.lat, r.hospital.lng);
          const isBest = i === 0;
          return (
            <line
              key={`line-${r.hospital.id}`}
              x1={patientSvg.x}
              y1={patientSvg.y}
              x2={hPos.x}
              y2={hPos.y}
              stroke={isBest ? '#10B981' : isDark ? '#334155' : '#94A3B8'}
              strokeWidth={isBest ? '3' : '1.5'}
              strokeDasharray={isBest ? 'none' : '5 5'}
              opacity={isBest ? '0.9' : '0.6'}
            />
          );
        })}

        {/* PATIENT LOCATION PIN */}
        <g transform={`translate(${patientSvg.x}, ${patientSvg.y})`}>
          <circle cx="0" cy="0" r="22" fill="#087F8C" opacity="0.2">
            <animate attributeName="r" values="22;30;22" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M 0 -14 C -8 -14 -12 -8 -12 0 C -12 10 0 18 0 18 C 0 18 12 10 12 0 C 12 -8 8 -14 0 -14 Z" fill="#087F8C" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="-3" r="4" fill="white" />
          <text x="0" y="28" textAnchor="middle" fontSize="10" fill={isDark ? '#38BDF8' : '#0284C7'} fontWeight="800">
            📍 YOU
          </text>
        </g>

        {/* HOSPITAL PINS */}
        {results.slice(0, 6).map((r, i) => {
          const pos = toSvgCoords(r.hospital.lat, r.hospital.lng);
          const isSelected = selectedId === r.hospital.id;
          const isBest = i === 0;
          const color = r.matchLabel === 'unsuitable' ? '#EF4444' : r.matchLabel === 'limited' ? '#F59E0B' : '#10B981';

          return (
            <g key={r.hospital.id} className="hospital-marker cursor-pointer" onClick={() => onSelect(r.hospital.id)}>
              {isSelected && <circle cx={pos.x} cy={pos.y} r="22" fill={color} opacity="0.2" />}
              <circle cx={pos.x} cy={pos.y} r={isBest ? 16 : 13} fill="white" stroke={color} strokeWidth={isBest ? 3.5 : 2} />
              <circle cx={pos.x} cy={pos.y} r={isBest ? 9 : 6} fill={color} />
              {isBest && <text x={pos.x} y={pos.y - 20} textAnchor="middle" fontSize="12">🥇</text>}
              <text x={pos.x} y={pos.y + 24} textAnchor="middle" fontSize="9" fill={isDark ? '#E2E8F0' : '#1E293B'} fontWeight="700">
                {r.hospital.name.split(' ')[0]} ({r.hospital.etaMin}m)
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ─── BEST MATCH CARD ──────────────────────────────────────────────
function BestMatchCard({ result }: { result: MatchResult }) {
  const h = result.hospital;
  return (
    <div className="card-shell p-6 sm:p-8 mb-6 card-hover border-emerald-200 dark:border-emerald-900/60 rounded-3xl">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
              <Award size={14} /> #1 MATCH
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] flex items-center gap-1">
              <CheckCircle2 size={14} className="text-[#10B981]" /> CAPACITY VERIFIED
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>{h.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">📍 {h.address}</p>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 shadow-sm bg-white dark:bg-slate-900">
          <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 flex flex-col items-center justify-center text-center">
            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 leading-none" style={{ fontFamily: 'Sora' }}>
              {result.score}%
            </span>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Match</span>
          </div>
          <div className="text-right">
            <p className="text-2xl font-extrabold text-[#087F8C]" style={{ fontFamily: 'Sora' }}>{h.etaMin} min</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{h.distanceKm} km away</p>
          </div>
        </div>
      </div>

      <div className="p-4.5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 mb-6 space-y-2">
        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">WHY THIS HOSPITAL IS RANKED #1?</p>
        <div className="grid sm:grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> All required care capabilities available</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Specialist on duty & admission-ready</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Low emergency department load ({h.emergencyLoad}%)</div>
          <div className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-[#10B981]" /> Fastest suitable route ({h.etaMin} min)</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <h4 className="font-bold mb-2.5 text-xs text-slate-500 uppercase tracking-wider">Matched Capabilities</h4>
          <div className="space-y-2 text-xs">
            {result.matchedCapabilities.map(cap => (
              <div key={cap} className="flex items-center gap-2">
                <CheckCircle2 size={15} className="text-[#10B981] flex-shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{capabilityLabel(cap)} available</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-2.5 text-xs text-slate-500 uppercase tracking-wider">Current Capacity</h4>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600 dark:text-slate-400">ICU beds available</span>
              <span className="text-[#10B981] font-bold">{h.icu.available} Open Beds</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span className="text-slate-600 dark:text-slate-400">Ventilators</span>
              <span className="text-slate-800 dark:text-slate-200">{h.ventilators.available} Available</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2 border-t border-emerald-100 dark:border-slate-800">
        <Link href={`/reservation/${h.id}`} className="btn-hero-emergency flex-1 justify-center text-sm">
          <span>Request Admission</span>
          <ChevronRight size={16} />
        </Link>
        <a href={`https://maps.google.com/?q=${h.lat},${h.lng}`} target="_blank" rel="noopener noreferrer" className="btn-hero-secondary text-sm">
          <Navigation size={15} /> Directions
        </a>
        <Link href={`/hospital/${h.id}`} className="btn-hero-secondary text-sm">
          Details
        </Link>
      </div>
    </div>
  );
}

// ─── OTHER HOSPITAL CARD ──────────────────────────────────────────
function OtherHospitalCard({ result }: { result: MatchResult }) {
  const h = result.hospital;
  const isUnsuitable = result.matchLabel === 'unsuitable';

  return (
    <div className={`card-shell p-5 mb-4 card-hover rounded-2xl ${isUnsuitable ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>{h.name}</h3>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isUnsuitable ? 'badge-critical' : result.matchLabel === 'limited' ? 'badge-limited' : 'badge-available'
            }`}>
              {isUnsuitable ? '🔴 NOT SUITABLE' : result.matchLabel === 'limited' ? '🟡 LIMITED' : '🟢 GOOD MATCH'}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            <Clock size={12} className="inline mr-1" />{h.etaMin} min transit · {h.distanceKm} km away
          </p>
          <div className="flex flex-wrap gap-2 text-xs pt-1">
            {result.matchedCapabilities.slice(0, 3).map(cap => (
              <span key={cap} className="text-[#10B981] font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> {capabilityLabel(cap)}
              </span>
            ))}
          </div>
        </div>

        <div className="text-right">
          <span className="text-sm font-extrabold text-[#087F8C] block" style={{ fontFamily: 'Sora' }}>{result.score}% Score</span>
          <Link href={`/hospital/${h.id}`} className="text-xs font-bold text-slate-500 hover:text-[#087F8C] flex items-center gap-1 justify-end mt-1">
            View <ChevronRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN RESULTS PAGE ────────────────────────────────────────────
export default function ResultsPage() {
  const { lang } = useAccessibility();
  const hospitals = useMedRouteStore(s => s.hospitals);
  const initRealtime = useMedRouteStore(s => s.initRealtime);

  const [emergencyTypeId, setEmergencyTypeId] = useState<EmergencyTypeId>('accident');
  const [patientLoc, setPatientLoc] = useState<PatientLocation>(getStoredPatientLocation());
  const [results, setResults] = useState<MatchResult[]>([]);
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'instructions' | 'map'>('instructions');

  useEffect(() => {
    initRealtime();
  }, [initRealtime]);

  useEffect(() => {
    const stored = sessionStorage.getItem('emergency-type');
    if (stored) {
      try { setEmergencyTypeId(JSON.parse(stored).id as EmergencyTypeId); } catch {}
    }
    setPatientLoc(getStoredPatientLocation());
  }, []);

  useEffect(() => {
    function handleLocUpdate(e: any) {
      if (e.detail) {
        setPatientLoc(e.detail);
      }
    }
    window.addEventListener('patient-location-updated', handleLocUpdate);
    return () => window.removeEventListener('patient-location-updated', handleLocUpdate);
  }, []);

  // Recalculate hospital rankings dynamically whenever patientLoc, emergencyTypeId, or store hospitals change!
  useEffect(() => {
    if (isLocationOutsideNetwork(patientLoc)) {
      setResults([]);
      return;
    }

    const ranked = matchHospitals(emergencyTypeId, patientLoc, hospitals);
    setResults(ranked);
    if (ranked.length > 0) setSelectedHospitalId(ranked[0].hospital.id);
  }, [emergencyTypeId, patientLoc, hospitals]);

  const handleTryDelhiDemo = () => {
    savePatientLocation(DEFAULT_PATIENT_LOCATION);
    setPatientLoc(DEFAULT_PATIENT_LOCATION);
  };

  const emergencyType = EMERGENCY_TYPES.find(e => e.id === emergencyTypeId);
  const isOutside = isLocationOutsideNetwork(patientLoc);
  const best = results[0];
  const others = results.slice(1, 5);

  return (
    <div className="min-h-screen py-8 bg-[#F4F8FA] dark:bg-[#0B0F19]">
      <div className="container-xl space-y-6">

        {/* TOP PATIENT LOCATION BAR & CONTROLS */}
        <div className="card-shell p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-teal-200/80 dark:border-teal-900/60 bg-white/95 dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C] flex items-center justify-center flex-shrink-0">
              <Compass size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#087F8C] uppercase tracking-wider block">
                Active Patient Location
              </span>
              <p className="text-sm font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                📍 {patientLoc.displayName || patientLoc.formattedAddress}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="btn-hero-secondary text-xs !py-2.5 !px-4 flex items-center gap-1.5 flex-shrink-0"
          >
            <MapPin size={15} />
            <span>{showLocationPicker ? 'Close Location Input' : 'Change Location'}</span>
          </button>
        </div>

        {/* INLINE LOCATION AUTOCOMPLETE PICKER DROPDOWN */}
        {showLocationPicker && (
          <div className="card-shell p-6 rounded-2xl space-y-3 bg-white dark:bg-slate-900 border border-[#087F8C]/40 animate-fade-in">
            <p className="text-xs font-bold text-[#087F8C] uppercase">Select place suggestion:</p>
            <PlaceAutocomplete
              onLocationSelected={(newLoc) => {
                setPatientLoc(newLoc);
                savePatientLocation(newLoc);
                setShowLocationPicker(false);
              }}
            />
          </div>
        )}

        {/* Page Title Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <Link href="/emergency/questions" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 mb-1">
              <ArrowLeft size={14} /> Change triage options
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
              Hospitals that can help right now
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Ranked dynamically by clinical fit, real travel distance & available capacity
            </p>
          </div>

          {emergencyType && (
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C] dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-2">
              <span>{emergencyType.icon}</span>
              <span>{emergencyType.label}</span>
            </div>
          )}
        </div>

        {/* Results Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column: Results List */}
          <div className="lg:col-span-7 space-y-6">
            {isOutside ? (
              /* OUTSIDE DEMO NETWORK REGION */
              <div className="card-shell p-8 sm:p-10 text-center space-y-5 rounded-3xl border border-amber-300 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 shadow-lg">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
                  <AlertCircle size={36} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                    MEDROUTE NETWORK NOT AVAILABLE HERE
                  </h2>
                  <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                    We currently don't have verified MEDROUTE hospital capacity in <span className="font-bold text-[#172033] dark:text-white">{patientLoc.displayName || patientLoc.formattedAddress}</span>.
                  </p>
                </div>
                <div className="pt-2">
                  <button onClick={handleTryDelhiDemo} className="btn-hero-secondary text-xs px-6 py-3 font-bold">
                    📍 Try Delhi NCR Demo Network
                  </button>
                </div>
              </div>
            ) : best ? (
              <>
                <BestMatchCard result={best} />
                <h3 className="font-bold text-xs text-slate-500 uppercase tracking-wider pt-2">Alternative hospitals ranked by proximity</h3>
                {others.map(r => <OtherHospitalCard key={r.hospital.id} result={r} />)}
              </>
            ) : (
              /* EMPTY STATE WHEN NO HOSPITAL MATCHES */
              <div className="card-shell p-8 text-center space-y-4 rounded-3xl border border-red-200 dark:border-red-900">
                <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
                  <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                  NO SUITABLE HOSPITAL FOUND
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  We couldn't find a nearby hospital with all required clinical capabilities for this emergency near your current location.
                </p>
                <Link href="/emergency/questions" className="btn-hero-emergency inline-flex text-xs px-6 py-3">
                  <RotateCcw size={16} /> Re-try with broader search
                </Link>
              </div>
            )}
          </div>

          {/* Right Column: Replaced Image/Graphic with Emergency Response Protocol Message Card */}
          <div className="lg:col-span-5 hidden lg:block space-y-6">
            <div className="sticky top-20 space-y-6">
              
              {/* Tab Switcher for Right Panel */}
              <div className="flex items-center gap-2 p-1.5 bg-slate-200/60 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <button
                  onClick={() => setRightPanelTab('instructions')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    rightPanelTab === 'instructions'
                      ? 'bg-white dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <ShieldAlert size={15} /> Emergency Guidance
                </button>
                <button
                  onClick={() => setRightPanelTab('map')}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
                    rightPanelTab === 'map'
                      ? 'bg-white dark:bg-slate-800 text-[#087F8C] dark:text-teal-300 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <MapPin size={15} /> Network Map
                </button>
              </div>

              {rightPanelTab === 'instructions' ? (
                /* REPLACED MESSAGE & EMERGENCY RESPONSE PROTOCOL CARD */
                <div className="card-shell p-6 sm:p-7 rounded-3xl space-y-6 border-red-200/80 dark:border-red-900/50 bg-gradient-to-b from-red-50/30 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 shadow-xl">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center flex-shrink-0">
                        <HeartPulse size={22} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest block">
                          ● TELEMETRY PROTOCOL ACTIVE
                        </span>
                        <h3 className="font-extrabold text-sm text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                          Emergency Care Instructions
                        </h3>
                      </div>
                    </div>
                  </div>

                  {/* Guidance Bullet Points */}
                  <div className="space-y-4 text-xs">
                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                      <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-[#087F8C] dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
                        1
                      </div>
                      <div>
                        <p className="font-bold text-[#172033] dark:text-white">Keep Patient Calm & Still</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Do not move the patient unnecessarily. Keep them in a comfortable reclining position.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                      <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-[#087F8C] dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
                        2
                      </div>
                      <div>
                        <p className="font-bold text-[#172033] dark:text-white">Do Not Offer Food or Water</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Refrain from giving fluids or food in case emergency anesthesia or surgery is required.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 shadow-sm">
                      <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 text-[#087F8C] dark:text-teal-300 flex items-center justify-center flex-shrink-0 font-extrabold text-xs">
                        3
                      </div>
                      <div>
                        <p className="font-bold text-[#172033] dark:text-white">Prepare Identification & History</p>
                        <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">
                          Gather patient ID, government health cards, and list of ongoing medications for quick admission.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Status Checklist */}
                  <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/60 space-y-2 text-xs">
                    <p className="font-extrabold text-emerald-800 dark:text-emerald-300 uppercase text-[10px] tracking-wider">
                      Regional Telemetry Status
                    </p>
                    <div className="space-y-1.5 font-semibold text-emerald-900 dark:text-emerald-200 text-[11px]">
                      <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#10B981]" /> Regional ICU Capacity: Connected</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#10B981]" /> Driving Route ETA: Calculated via Google Maps</div>
                      <div className="flex items-center gap-2"><CheckCircle2 size={13} className="text-[#10B981]" /> Priority Bed Reservation: Armed</div>
                    </div>
                  </div>

                  {/* Call Emergency Services Button */}
                  <a
                    href="tel:112"
                    className="w-full py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
                  >
                    <PhoneCall size={16} className="animate-pulse" />
                    <span>Call National Emergency Helpline (112)</span>
                  </a>

                </div>
              ) : (
                /* MAP PANEL IF USER TOGGLES MAP TAB */
                <div className="card-shell p-4 rounded-3xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#087F8C] uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin size={14} /> Network Geographic Map
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Live Routing</span>
                  </div>
                  {!isOutside && (
                    <DynamicResultsMap
                      results={results}
                      patientLoc={patientLoc}
                      selectedId={selectedHospitalId}
                      onSelect={setSelectedHospitalId}
                    />
                  )}
                </div>
              )}

              {/* Protocol Footer Card */}
              <div className="card-shell p-5 space-y-2 rounded-3xl">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase">
                  <Shield size={16} /> Location-Aware Telemetry Protocol
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Travel ETAs and distances are dynamically re-calculated whenever patient coordinates update using Haversine & Google Routing APIs.
                </p>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
