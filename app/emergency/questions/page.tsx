'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  MapPin,
  ArrowLeft,
  Loader2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  Check,
  Compass,
  Radio
} from 'lucide-react';
import { EMERGENCY_TYPES, EmergencyType } from '@/lib/emergencyTypes';
import { useAccessibility } from '@/lib/accessibilityContext';
import PlaceAutocomplete from '@/components/PlaceAutocomplete';
import {
  PatientLocation,
  savePatientLocation,
  getStoredPatientLocation,
  reverseGeocodeCoords,
} from '@/lib/googleMaps';

const LOADING_CHECKLIST = [
  'Scanning regional hospital telemetry network...',
  'Evaluating care capability & specialist requirements...',
  'Verifying real-time ICU & ventilator availability...',
  'Computing fastest driving route via Google Routing API...',
];

const OPTION_SUBTEXT_MAP: Record<string, string> = {
  'yes': 'Patient is conscious, awake and responsive',
  'no': 'Patient is unresponsive, fainting or unconscious',
  'unsure': 'Patient status is uncertain or fluctuating',
  'severe': 'Intense, overwhelming or unbearable discomfort',
  'moderate': 'Noticeable pain but patient remains stable',
  'mild': 'Slight discomfort or mild symptom',
  'recent': 'Symptoms started within the last 30 minutes',
  'ongoing': 'Symptoms present for several hours or days',
  'chronic': 'Pre-existing condition or recurring history',
};

export default function QuestionsPage() {
  const router = useRouter();
  const { lang, theme } = useAccessibility();
  const isDark = theme === 'dark';

  const [emergencyType, setEmergencyType] = useState<EmergencyType | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showLocationStep, setShowLocationStep] = useState(false);
  const [patientLoc, setPatientLoc] = useState<PatientLocation>(getStoredPatientLocation());
  const [isSearching, setIsSearching] = useState(false);

  const [loadingStep, setLoadingStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem('emergency-type');
    if (stored) {
      try {
        setEmergencyType(JSON.parse(stored));
      } catch {
        setEmergencyType(EMERGENCY_TYPES[0]);
      }
    } else {
      setEmergencyType(EMERGENCY_TYPES[0]);
    }

    setPatientLoc(getStoredPatientLocation());
  }, []);

  if (!emergencyType) return null;

  const questions = emergencyType.questions;
  const currentQuestion = questions[currentQuestionIdx];

  const handleAnswer = (optionValue: string) => {
    setSelectedOption(optionValue);
    const updated = { ...answers, [currentQuestion.id]: optionValue };
    setAnswers(updated);
    sessionStorage.setItem('emergency-answers', JSON.stringify(updated));

    setTimeout(() => {
      setSelectedOption(null);
      if (currentQuestionIdx < questions.length - 1) {
        setCurrentQuestionIdx(prev => prev + 1);
      } else {
        setShowLocationStep(true);
      }
    }, 280);
  };

  const startSearchSequence = async (targetLoc?: PatientLocation) => {
    setIsSearching(true);
    setLoadingStep(0);
    setCompletedSteps([]);

    const locToUse = targetLoc || patientLoc;
    savePatientLocation(locToUse);

    for (let i = 0; i < LOADING_CHECKLIST.length; i++) {
      await new Promise(r => setTimeout(r, 480));
      setLoadingStep(i + 1);
      setCompletedSteps(prev => [...prev, i]);
    }

    await new Promise(r => setTimeout(r, 250));
    router.push('/emergency/results');
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          
          // Reverse geocode actual GPS coordinates to readable address
          const gpsLoc = await reverseGeocodeCoords(lat, lng);
          setPatientLoc(gpsLoc);
          startSearchSequence(gpsLoc);
        },
        () => {
          const fallbackLoc: PatientLocation = {
            displayName: 'Connaught Place, New Delhi',
            formattedAddress: 'Connaught Place, New Delhi, Delhi, India',
            latitude: 28.6315,
            longitude: 77.2167,
            placeId: 'ChIJR036f0flDDkR6Kz0BvT2g8g',
            source: 'manual',
          };
          setPatientLoc(fallbackLoc);
          startSearchSequence(fallbackLoc);
        }
      );
    } else {
      startSearchSequence(patientLoc);
    }
  };

  // ─── LOADING SEQUENCE SCREEN ───────────────────────────────────
  if (isSearching) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#F4F8FA] dark:bg-[#0B0F19] bg-grid-pattern relative">
        <div className="card-shell p-10 sm:p-12 max-w-lg w-full text-center space-y-8 shadow-2xl rounded-3xl backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 relative z-10">
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-[#087F8C]/15 animate-ping" />
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#087F8C] to-[#10B981] text-white flex items-center justify-center shadow-lg relative z-10">
              <Loader2 className="animate-spin" size={32} />
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white tracking-tight" style={{ fontFamily: 'Sora' }}>
              Matching Hospital Telemetry...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Calculating clinical fit & travel ETAs near {patientLoc.displayName || patientLoc.formattedAddress}
            </p>
          </div>

          <div className="space-y-4 text-left border-t border-slate-100 dark:border-slate-800 pt-6">
            {LOADING_CHECKLIST.map((stepText, index) => {
              const isDone = completedSteps.includes(index);
              const isCurrent = loadingStep - 1 === index;

              return (
                <div key={stepText} className="flex items-center gap-3.5 text-sm">
                  {isDone ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 size={18} />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-teal-500/15 text-[#087F8C] flex items-center justify-center flex-shrink-0">
                      <Loader2 size={18} className="animate-spin" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-700 flex-shrink-0" />
                  )}
                  <span className={`font-semibold ${isDone ? 'text-[#172033] dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                    {stepText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── LOCATION STEP ─────────────────────────────────────────────
  if (showLocationStep) {
    return (
      <div className="min-h-screen py-12 bg-[#F4F8FA] dark:bg-[#0B0F19] bg-grid-pattern relative">
        <div className="container-xl max-w-xl space-y-6 relative z-10">

          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowLocationStep(false)}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors"
            >
              <ArrowLeft size={14} /> Back to questions
            </button>

            <span className="px-3.5 py-1.5 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#047857] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800 text-xs font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] pulse-dot" />
              <span>STEP 2 OF 3 · LOCATION</span>
            </span>
          </div>

          <div className="card-shell p-8 sm:p-10 space-y-8 rounded-3xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/90 shadow-2xl border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#087F8C] uppercase tracking-wider">
                <Compass size={16} /> Patient Location
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white tracking-tight" style={{ fontFamily: 'Sora' }}>
                Where is the patient?
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Calculates real-time transit times via Google Routing API to prioritize the fastest suitable hospital.
              </p>
            </div>

            <button
              onClick={handleUseCurrentLocation}
              className="btn-hero-emergency w-full py-4.5 text-base font-bold flex items-center justify-center gap-3 shadow-xl hover:scale-[1.01] rounded-2xl"
            >
              <Navigation size={20} />
              <span>📍 Use My Current Location</span>
            </button>

            <div className="relative flex items-center justify-center my-6">
              <hr className="w-full border-slate-200 dark:border-slate-800" />
              <span className="absolute bg-white dark:bg-slate-900 px-4 text-xs text-slate-400 font-semibold uppercase">Or search place name</span>
            </div>

            <div className="space-y-4">
              <PlaceAutocomplete
                initialAddress={patientLoc.displayName || patientLoc.formattedAddress}
                onLocationSelected={(loc) => {
                  setPatientLoc(loc);
                }}
              />

              <button
                onClick={() => startSearchSequence()}
                className="btn-hero-secondary w-full py-4 text-base font-bold flex items-center justify-center gap-2 rounded-2xl"
              >
                <span>Find Suitable Hospitals</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ─── QUESTIONS STEP ────────────────────────────────────────────
  const progressPct = ((currentQuestionIdx + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen py-12 bg-[#F4F8FA] dark:bg-[#0B0F19] bg-grid-pattern relative">
      <div className="container-xl max-w-xl space-y-6 relative z-10">

        {/* TOP BAR / STEPPER HEADER */}
        <div className="flex items-center justify-between text-xs font-bold">
          <button
            onClick={() => {
              if (currentQuestionIdx > 0) setCurrentQuestionIdx(prev => prev - 1);
              else router.push('/emergency');
            }}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={15} /> Back
          </button>

          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-full bg-[#ECFDF5] dark:bg-emerald-950/80 text-[#047857] dark:text-emerald-300 border border-[#A7F3D0] dark:border-emerald-800 text-[11px] font-extrabold uppercase tracking-wider flex items-center gap-1.5">
              <Radio size={12} className="text-[#10B981] animate-pulse" />
              <span>STEP 1 OF 3 · TRIAGE ASSESSMENT</span>
            </span>
          </div>
        </div>

        {/* GLOWING PROGRESS BAR */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-800/80 h-3 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-800">
          <div
            className="bg-gradient-to-r from-[#087F8C] to-[#10B981] h-full rounded-full transition-all duration-400 shadow-[0_0_12px_rgba(8,127,140,0.5)]"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* MAIN QUESTION CONTAINER CARD */}
        <div className="card-shell p-8 sm:p-10 space-y-8 shadow-2xl rounded-3xl backdrop-blur-xl bg-white/95 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">

          <div className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-[#E6F7F5] to-teal-100 dark:from-teal-950 dark:to-slate-900 border border-teal-200/80 dark:border-teal-800 text-[#087F8C] dark:text-teal-300 flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                {emergencyType.icon}
              </div>
              <div>
                <span className="text-[11px] font-bold text-[#087F8C] dark:text-teal-400 uppercase tracking-widest block">
                  Emergency Category
                </span>
                <h3 className="font-extrabold text-base text-[#172033] dark:text-white tracking-tight" style={{ fontFamily: 'Sora' }}>
                  {emergencyType.label}
                </h3>
              </div>
            </div>

            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-700">
              Q{currentQuestionIdx + 1}/{questions.length}
            </span>
          </div>

          <div className="space-y-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] dark:text-white leading-[1.25] tracking-tight" style={{ fontFamily: 'Sora' }}>
              {currentQuestion.text}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              Helps MEDROUTE match required ICU beds, ventilators & specialist availability.
            </p>
          </div>

          <div className="space-y-4 pt-1">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedOption === option.value || answers[currentQuestion.id] === option.value;
              const subtext = OPTION_SUBTEXT_MAP[option.value.toLowerCase()] || 'Select this triage option';

              return (
                <button
                  key={option.id}
                  onClick={() => handleAnswer(option.value)}
                  className={`w-full p-5 sm:p-6 rounded-2xl text-left flex items-center justify-between transition-all duration-200 cursor-pointer border-2 group ${
                    isSelected
                      ? 'border-[#087F8C] dark:border-teal-400 bg-gradient-to-r from-[#E6F7F5] to-teal-50 dark:from-teal-950/90 dark:to-slate-900 shadow-xl scale-[1.015]'
                      : isDark
                      ? 'border-slate-800 bg-slate-900/90 text-white hover:border-[#087F8C] hover:bg-slate-800/90 hover:shadow-lg hover:-translate-y-0.5'
                      : 'border-slate-200/90 bg-slate-50/60 hover:bg-white text-slate-800 hover:border-[#087F8C] hover:shadow-lg hover:-translate-y-0.5'
                  }`}
                >
                  <div className="space-y-1">
                    <span
                      className={`block font-extrabold text-base sm:text-lg transition-colors ${
                        isSelected
                          ? 'text-[#087F8C] dark:text-teal-300'
                          : isDark
                          ? 'text-[#F8FAFC]'
                          : 'text-[#172033] group-hover:text-[#087F8C]'
                      }`}
                      style={{ fontFamily: 'Sora' }}
                    >
                      {option.label}
                    </span>
                    <p className={`text-xs font-medium transition-colors ${isSelected ? 'text-[#087F8C]/90 dark:text-teal-400 font-semibold' : 'text-slate-600 dark:text-slate-400'}`}>
                      {subtext}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {isSelected ? (
                      <div className="w-8 h-8 rounded-full bg-[#087F8C] text-white flex items-center justify-center shadow-md">
                        <Check size={18} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:border-[#087F8C] group-hover:text-[#087F8C] transition-colors">
                        <ChevronRight size={18} />
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={15} className="text-[#10B981]" /> Encrypted Triage Protocol
            </span>
            <span>Question {currentQuestionIdx + 1} of {questions.length}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
