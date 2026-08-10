'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Siren,
  Hospital as HospitalIcon,
  HeartPulse,
  MapPin,
  ChevronRight,
  Zap,
  Heart,
  Wind,
  Car,
  Brain,
  Droplet,
  Flame,
  Baby,
  MoreHorizontal,
  Mic,
  Lock,
  Timer,
  Sliders,
  ShieldCheck,
  Navigation
} from 'lucide-react';
import { HOSPITALS } from '@/lib/hospitals';
import { useMedRouteStore, getNetworkStats } from '@/lib/store';
import { useAccessibility } from '@/lib/accessibilityContext';
import { EMERGENCY_TYPES } from '@/lib/emergencyTypes';

// ─── Animated Counter ─────────────────────────────────────────────
function AnimatedCounter({ target, duration = 1600 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return <span>{value.toLocaleString()}</span>;
}

// ─── Original City Map Vector Graphic (Dark & Light Adaptive) ──────
function HeroMapGraphic() {
  const { theme } = useAccessibility();
  const isDark = theme === 'dark';

  const mapBg = isDark ? '#0F172A' : '#F8FAFC';
  const gridLine = isDark ? '#1E293B' : '#E2E8F0';
  const mainRoad = isDark ? '#334155' : '#CBD5E1';
  const riverColor = isDark ? '#1E3A8A' : '#D2E3FC';
  const labelColor = isDark ? '#64748B' : '#94A3B8';
  const parkFill = isDark ? '#064E3B' : '#E6F4EA';
  const parkText = isDark ? '#34D399' : '#137333';
  const cardBg = isDark ? 'bg-slate-900/95 border-slate-700/80 text-white' : 'bg-white/98 border-slate-200 text-[#172033]';

  return (
    <div className="relative w-full rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden" style={{ minHeight: '400px', background: mapBg }}>
      {/* City Vector Map Graphic Background */}
      <svg viewBox="0 0 700 440" className="w-full h-full min-h-[400px]" style={{ background: mapBg }}>
        {/* City center grid roads */}
        {[100, 200, 300, 400, 500, 600].map(x => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="440" stroke={gridLine} strokeWidth="2" strokeDasharray="6 6" />
        ))}
        {[80, 160, 240, 320, 400].map(y => (
          <line key={`h${y}`} x1="0" y1={y} x2="700" y2={y} stroke={gridLine} strokeWidth="2" strokeDasharray="6 6" />
        ))}

        {/* Diagonal road arteries */}
        <line x1="0" y1="380" x2="700" y2="100" stroke={mainRoad} strokeWidth="3" />
        <line x1="120" y1="0" x2="600" y2="440" stroke={mainRoad} strokeWidth="3" />

        {/* Parks */}
        <ellipse cx="580" cy="330" rx="65" ry="40" fill={parkFill} opacity="0.9" />
        <text x="580" y="334" textAnchor="middle" fontSize="11" fill={parkText} fontFamily="Inter" fontWeight="500">Central Park</text>

        {/* River */}
        <path d="M 0 290 Q 220 230 440 310 T 700 280" stroke={riverColor} strokeWidth="28" fill="none" opacity="0.8" />

        {/* Text labels on map */}
        <text x="520" y="140" textAnchor="middle" fontSize="12" fill={labelColor} fontFamily="Inter" fontWeight="600">Central Zone</text>
        <text x="460" y="55" textAnchor="middle" fontSize="12" fill={labelColor} fontFamily="Inter" fontWeight="600">Medical Corridor</text>

        {/* TOP LEFT GREEN PIN */}
        <g transform="translate(390, 140)">
          <circle cx="0" cy="0" r="22" fill="#10B981" opacity="0.2">
            <animate attributeName="r" values="22;30;22" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="14" fill="#10B981" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -5 0 H 5 M 0 -5 V 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* LEFT ORANGE PIN */}
        <g transform="translate(330, 240)">
          <circle cx="0" cy="0" r="20" fill="#F59E0B" opacity="0.2" />
          <circle cx="0" cy="0" r="13" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -4 0 H 4 M 0 -4 V 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* RIGHT RED PIN */}
        <g transform="translate(640, 270)">
          <circle cx="0" cy="0" r="20" fill="#EF4444" opacity="0.2" />
          <circle cx="0" cy="0" r="13" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
          <path d="M -4 0 H 4 M 0 -4 V 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* CENTER BOTTOM TEARDROP GREEN LOCATION PIN */}
        <g transform="translate(485, 340)">
          <circle cx="0" cy="0" r="28" fill="#10B981" opacity="0.15">
            <animate attributeName="r" values="28;38;28" dur="2s" repeatCount="indefinite" />
          </circle>
          <path d="M 0 -18 C -10 -18 -16 -10 -16 0 C -16 14 0 24 0 24 C 0 24 16 14 16 0 C 16 -10 10 -18 0 -18 Z" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="0" cy="-4" r="5" fill="white" />
        </g>
      </svg>

      {/* Floating Map Legend (Top Right) */}
      <div className={`absolute top-4 right-4 backdrop-blur-md rounded-2xl p-3 border shadow-md space-y-1.5 text-xs font-semibold ${isDark ? 'bg-slate-900/90 border-slate-700 text-slate-200' : 'bg-white/95 border-slate-200 text-slate-700'}`}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
          <span>High Load</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <span>Critical</span>
        </div>
      </div>

      {/* Floating Hospital Card */}
      <div className={`absolute top-10 left-6 sm:left-24 backdrop-blur-xl rounded-2xl p-5 border shadow-2xl w-[300px] space-y-3 ${cardBg}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0 ${isDark ? 'bg-teal-950/80 text-teal-400 border-teal-800' : 'bg-[#E6F7F5] text-[#087F8C] border-teal-200'}`}>
              <HospitalIcon size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm" style={{ fontFamily: 'Sora' }}>CityCare Hospital</h4>
              <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2.4 km away · 8 mins</p>
            </div>
          </div>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border flex-shrink-0 ${isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
            Best Match
          </span>
        </div>

        <div className={`space-y-2 text-xs pt-1 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>🛏 ICU Beds</span>
            <span className="font-bold text-[#10B981]">2 Available</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>🫁 Ventilators</span>
            <span className="font-bold text-[#10B981]">3 Available</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>⏲ Emergency Load</span>
            <span className="font-bold text-[#10B981]">42%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={isDark ? 'text-slate-400 font-medium' : 'text-slate-600 font-medium'}>⚙️ Trauma Team</span>
            <span className="font-bold text-[#10B981]">Available</span>
          </div>
        </div>

        <div className={`pt-2 border-t flex items-center justify-between text-[11px] ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <span className="text-[#10B981] font-bold flex items-center gap-1">
            <CheckCircle2 size={13} /> Real-time Capacity Verified
          </span>
        </div>
      </div>

    </div>
  );
}

// ─── Main Homepage ────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const { theme } = useAccessibility();
  const isDark = theme === 'dark';
  const hospitals = useMedRouteStore(s => s.hospitals);
  const stats = getNetworkStats(hospitals);

  const handleCategoryClick = (typeId: string) => {
    const typeObj = EMERGENCY_TYPES.find(t => t.id === typeId);
    if (typeObj) {
      sessionStorage.setItem('emergency-type', JSON.stringify(typeObj));
      router.push('/emergency/questions');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0B0F19] text-white' : 'bg-[#F4F8FA] text-[#172033]'}`}>

      {/* ── SECTION 1: HERO ── */}
      <section className="pt-8 pb-14">
        <div className="container-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">

            {/* Left Hero Column */}
            <div className="w-full lg:w-[50%] space-y-6">
              {/* Green Pill Badge */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border ${isDark ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800' : 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]'}`}>
                <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
                <span>NETWORK LIVE · 247 HOSPITALS ONLINE</span>
              </div>

              {/* Large Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08]" style={{ fontFamily: 'Sora, sans-serif' }}>
                The right hospital.<br />
                <span className="text-[#087F8C]">Right now.</span>
              </h1>

              {/* Subheading */}
              <p className={`text-base sm:text-lg max-w-lg leading-relaxed font-normal ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                MEDROUTE connects you to hospitals with the right specialists, facilities and verified capacity in real time.
              </p>

              {/* Two Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href="/emergency" className="btn-hero-emergency">
                  <Siren size={20} />
                  <span>Find Emergency Care</span>
                  <ArrowRight size={18} />
                </Link>

                <Link href="/emergency/results" className="btn-hero-secondary">
                  <HospitalIcon size={20} className="text-[#087F8C]" />
                  <span>Find a Hospital</span>
                </Link>
              </div>

              {/* Four Pill Badges */}
              <div className="pt-3 flex flex-wrap gap-2.5">
                <div className="hero-pill-badge">
                  <CheckCircle2 size={16} className="text-[#10B981]" />
                  <span>Capacity Verified</span>
                </div>
                <div className="hero-pill-badge">
                  <Lock size={15} className="text-[#087F8C]" />
                  <span>Secure & Private</span>
                </div>
                <div className="hero-pill-badge">
                  <Zap size={16} className="text-[#F59E0B]" />
                  <span>Fast Match</span>
                </div>
                <div className="hero-pill-badge">
                  <Timer size={16} className="text-[#2563EB]" />
                  <span>Under 90s</span>
                </div>
              </div>
            </div>

            {/* Right Hero Column: Restored Original Vector Map Graphic */}
            <div className="w-full lg:w-[48%]">
              <HeroMapGraphic />
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 2: "WHAT IS HAPPENING?" CATEGORY CARDS ── */}
      <section className="pb-10">
        <div className="container-xl">
          <div className="card-shell p-6 md:p-8 space-y-6">

            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-[#DC2626] uppercase tracking-wider mb-1">
                  🚨 What is happening?
                </div>
                <h2 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: 'Sora' }}>
                  Choose the option that best describes the emergency.
                </h2>
              </div>

              <Link
                href="/emergency"
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-bold transition-colors flex-shrink-0 self-start sm:self-auto ${
                  isDark ? 'bg-teal-950/80 border-teal-800 text-teal-300 hover:bg-teal-900' : 'bg-[#E6F7F5] border-teal-200 text-[#087F8C] hover:bg-teal-100'
                }`}
              >
                <Mic size={16} />
                <span>Not sure? Describe it</span>
              </Link>
            </div>

            {/* 8 Horizontal Emergency Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-2">
              {[
                { id: 'chest-pain', label: 'Chest Pain', desc: 'Heart problem or discomfort', icon: Heart, bg: isDark ? 'bg-red-950/40 border-red-900/50' : 'bg-[#FEF2F2]', iconColor: 'text-[#EF4444]' },
                { id: 'breathing', label: 'Breathing Problem', desc: 'Severe difficulty breathing', icon: Wind, bg: isDark ? 'bg-blue-950/40 border-blue-900/50' : 'bg-[#EFF6FF]', iconColor: 'text-[#2563EB]' },
                { id: 'accident', label: 'Accident / Injury', desc: 'Serious injury from accident', icon: Car, bg: isDark ? 'bg-emerald-950/40 border-emerald-900/50' : 'bg-[#ECFDF5]', iconColor: 'text-[#10B981]' },
                { id: 'stroke', label: 'Stroke', desc: 'Sudden weakness or confusion', icon: Brain, bg: isDark ? 'bg-purple-950/40 border-purple-900/50' : 'bg-[#F5F3FF]', iconColor: 'text-[#8B5CF6]' },
                { id: 'bleeding', label: 'Severe Bleeding', desc: 'Heavy or uncontrolled bleeding', icon: Droplet, bg: isDark ? 'bg-rose-950/40 border-rose-900/50' : 'bg-[#FFF1F2]', iconColor: 'text-[#E11D48]' },
                { id: 'burn', label: 'Burns', desc: 'Serious or major burns', icon: Flame, bg: isDark ? 'bg-orange-950/40 border-orange-900/50' : 'bg-[#FFF7ED]', iconColor: 'text-[#F97316]' },
                { id: 'child', label: 'Child Emergency', desc: 'Emergency involving a child', icon: Baby, bg: isDark ? 'bg-green-950/40 border-green-900/50' : 'bg-[#F0FDF4]', iconColor: 'text-[#059669]' },
                { id: 'other', label: 'Other Emergency', desc: 'Some other emergency', icon: MoreHorizontal, bg: isDark ? 'bg-teal-950/40 border-teal-900/50' : 'bg-[#E6F7F5]', iconColor: 'text-[#087F8C]' },
              ].map((cat) => {
                const IconComp = cat.icon;
                return (
                  <div
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`category-card ${cat.bg}`}
                  >
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-sm ${isDark ? 'bg-slate-900' : 'bg-white'} ${cat.iconColor} mb-3`}>
                      <IconComp size={22} />
                    </div>
                    <h3 className="font-bold text-xs mb-1" style={{ fontFamily: 'Sora' }}>{cat.label}</h3>
                    <p className={`text-[10px] leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{cat.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── SECTION 3: REAL-TIME NETWORK OVERVIEW BAR ── */}
      <section className="pb-16">
        <div className="container-xl">
          <div className="card-shell p-6 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

              {/* Title Column */}
              <div className="lg:w-1/4">
                <h3 className="font-extrabold text-base" style={{ fontFamily: 'Sora' }}>
                  Real-time Network Overview
                </h3>
                <p className={`text-xs font-medium mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Live data from connected hospitals</p>
              </div>

              {/* 4 Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 lg:w-2/4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-[#E6F7F5] text-[#087F8C]'}`}>
                    <HospitalIcon size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold" style={{ fontFamily: 'Sora' }}>
                      <AnimatedCounter target={247} />
                    </p>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Hospitals Online</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-emerald-950 text-emerald-400' : 'bg-[#ECFDF5] text-[#10B981]'}`}>
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold" style={{ fontFamily: 'Sora' }}>
                      <AnimatedCounter target={stats.availableBeds + 1700} />
                    </p>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Admission-Ready Beds</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-blue-950 text-blue-400' : 'bg-[#EFF6FF] text-[#2563EB]'}`}>
                    <Heart size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold" style={{ fontFamily: 'Sora' }}>
                      <AnimatedCounter target={stats.icuBeds + 90} />
                    </p>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>ICU Beds Available</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-[#E6F7F5] text-[#087F8C]'}`}>
                    <Zap size={20} />
                  </div>
                  <div>
                    <p className="text-xl font-extrabold" style={{ fontFamily: 'Sora' }}>
                      <AnimatedCounter target={stats.ventilators + 18} />
                    </p>
                    <p className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Ventilators Available</p>
                  </div>
                </div>
              </div>

              {/* Right Status Box */}
              <div className={`lg:w-1/4 text-left lg:text-right border-t lg:border-t-0 lg:border-l pt-4 lg:pt-0 lg:pl-6 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <p className="text-[11px] text-slate-400 font-semibold uppercase">Network Status</p>
                <p className="text-xs font-bold text-[#10B981] font-mono mt-0.5 flex items-center lg:justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
                  <span>Real-time Active</span>
                </p>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Telemetry Synchronization</p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: HOW IT WORKS ── */}
      <section id="how-it-works" className={`py-16 border-t ${isDark ? 'bg-[#0F172A] border-slate-800' : 'bg-white border-slate-200/80'}`}>
        <div className="container-xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <p className="text-xs font-bold text-[#087F8C] uppercase tracking-wider mb-1">AUTOMATED COORDINATION</p>
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Sora' }}>
              How MEDROUTE Works
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Connecting emergency requirements to verified hospital capacity in 4 simple steps.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: '01', title: 'Tell us what is happening', desc: 'Select emergency category or speak symptoms in natural voice dictation.' },
              { num: '02', title: 'MEDROUTE identifies care', desc: 'Rule engine calculates necessary ICU, surgeon, ventilator & facility needs.' },
              { num: '03', title: 'Match verified capacity', desc: 'Scans connected hospital database for open beds & real-time telemetry.' },
              { num: '04', title: 'Reserve & route', desc: 'Locks admission reservation and routes patient to hospital directly.' },
            ].map(({ num, title, desc }) => (
              <div key={num} className="card-shell p-6 transition-colors">
                <span className="text-3xl font-extrabold text-[#087F8C]" style={{ fontFamily: 'Sora' }}>{num}</span>
                <h3 className="font-bold text-base mt-2 mb-1" style={{ fontFamily: 'Sora' }}>{title}</h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 5: WHY MEDROUTE TRUST SECTION ── */}
      <section className={`py-16 border-t ${isDark ? 'bg-[#0B0F19] border-slate-800' : 'bg-[#F4F8FA] border-slate-200/80'}`}>
        <div className="container-xl">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold" style={{ fontFamily: 'Sora' }}>
              Why MEDROUTE?
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Designed for speed, accuracy, and trust in critical emergency situations.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-shell p-8 text-center space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-[#E6F7F5] text-[#087F8C]'}`}>
                <CheckCircle2 size={24} />
              </div>
              <h3 className="font-bold text-base" style={{ fontFamily: 'Sora' }}>VERIFIED CAPACITY</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Hospitals continuously update their available resources, ICU beds, and specialists in real-time.
              </p>
            </div>

            <div className="card-shell p-8 text-center space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-[#E6F7F5] text-[#087F8C]'}`}>
                <Sliders size={24} />
              </div>
              <h3 className="font-bold text-base" style={{ fontFamily: 'Sora' }}>SMART MATCHING</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                We consider clinical capability, resource availability, travel distance, and emergency load.
              </p>
            </div>

            <div className="card-shell p-8 text-center space-y-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${isDark ? 'bg-teal-950 text-teal-400' : 'bg-[#E6F7F5] text-[#087F8C]'}`}>
                <Activity size={24} />
              </div>
              <h3 className="font-bold text-base" style={{ fontFamily: 'Sora' }}>REAL-TIME COORDINATION</h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Admission requests and reservations update across the network instantly to prevent double-booking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={`border-t py-12 ${isDark ? 'bg-[#090D16] border-slate-800' : 'bg-white border-slate-200'}`}>
        <div className="container-xl flex flex-col md:flex-row items-start justify-between gap-8">
          <div className="space-y-2 max-w-sm">
            <span className="font-extrabold text-2xl text-[#087F8C]" style={{ fontFamily: 'Sora' }}>MEDROUTE</span>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>The right hospital. Right now.</p>
            <p className="text-[11px] text-slate-500 pt-2 leading-relaxed">
              Connecting emergencies to hospitals with the right care, resources and verified capacity — in real time.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 text-xs">
            <div>
              <p className="font-bold uppercase mb-3">Platform</p>
              <div className={`space-y-2 flex flex-col ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Link href="/emergency" className="hover:text-[#087F8C]">Find Care</Link>
                <Link href="/emergency/results" className="hover:text-[#087F8C]">Hospitals</Link>
                <Link href="/transfer" className="hover:text-[#087F8C]">Transfers</Link>
                <Link href="/#how-it-works" className="hover:text-[#087F8C]">How It Works</Link>
              </div>
            </div>

            <div>
              <p className="font-bold uppercase mb-3">Operations</p>
              <div className={`space-y-2 flex flex-col ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <Link href="/hospital-dashboard" className="hover:text-[#087F8C]">Hospital Login</Link>
                <Link href="/network-dashboard" className="hover:text-[#087F8C]">Network Telemetry</Link>
              </div>
            </div>
          </div>
        </div>

        <div className={`container-xl border-t mt-10 pt-6 flex justify-between text-[11px] text-slate-500 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <p>© 2026 MEDROUTE Inc. All rights reserved.</p>
          <p>Hackathon Demonstration Edition</p>
        </div>
      </footer>

    </div>
  );
}
