'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Heart,
  Wind,
  Car,
  Brain,
  Droplet,
  Flame,
  Baby,
  AlertCircle,
  Mic,
  MicOff,
  CheckCircle2,
  ArrowRight,
  Shield,
  Search
} from 'lucide-react';
import { EMERGENCY_TYPES, EmergencyType, classifyVoiceInput } from '@/lib/emergencyTypes';
import { useAccessibility } from '@/lib/accessibilityContext';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'chest-pain': Heart,
  breathing: Wind,
  accident: Car,
  stroke: Brain,
  bleeding: Droplet,
  burn: Flame,
  child: Baby,
  other: AlertCircle,
  unsure: Search,
};

export default function EmergencySelectionPage() {
  const router = useRouter();
  const { lang, theme } = useAccessibility();
  const isDark = theme === 'dark';

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceDetected, setVoiceDetected] = useState<EmergencyType | null>(null);

  const handleSelect = (item: EmergencyType) => {
    setSelectedId(item.id);
    sessionStorage.setItem('emergency-type', JSON.stringify(item));
    setTimeout(() => {
      router.push('/emergency/questions');
    }, 250);
  };

  const startVoiceInput = () => {
    /* eslint-disable @typescript-eslint/no-explicit-any */
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please select an emergency category below.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
    recognition.interimResults = false;

    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      const match = classifyVoiceInput(text);
      if (match) {
        setVoiceDetected(match);
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className="min-h-screen py-10 bg-[#F4F8FA] dark:bg-[#0B0F19]">
      <div className="container-xl max-w-5xl space-y-8">

        {/* Safety Disclaimer Banner */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300 text-xs font-semibold flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-amber-600 flex-shrink-0" />
            <span>If someone is in immediate danger or cardiac arrest, contact emergency services (112) immediately.</span>
          </div>
          <a href="tel:112" className="text-[#DC2626] font-bold underline flex-shrink-0">
            Call 112
          </a>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto space-y-2">
          <p className="text-xs font-bold text-[#087F8C] uppercase tracking-wider">STEP 1 OF 3</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
            What is happening?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Choose the option that best describes the emergency situation.
          </p>
        </div>

        {/* VOICE INPUT WIDGET */}
        <div className="card-shell p-6 max-w-2xl mx-auto border border-teal-200/80 dark:border-teal-900/60 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={startVoiceInput}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C] hover:bg-teal-100'
              }`}
              title="Click to dictate emergency"
            >
              {isListening ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <div className="flex-1 text-center sm:text-left">
              <p className="font-bold text-sm text-[#172033] dark:text-white" style={{ fontFamily: 'Sora' }}>
                {isListening ? 'Listening...' : 'Voice Dictation Assistance'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {transcript ? `"${transcript}"` : 'Click microphone to describe what is happening'}
              </p>
            </div>

            {voiceDetected && (
              <button
                onClick={() => handleSelect(voiceDetected)}
                className="btn-hero-emergency text-xs !h-9 !px-4"
              >
                <span>Confirm {voiceDetected.label.split('/')[0]}</span>
                <ArrowRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* CATEGORY GRID */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {EMERGENCY_TYPES.map((item) => {
            const isSelected = selectedId === item.id;
            const IconComponent = ICON_MAP[item.id] || AlertCircle;

            return (
              <div
                key={item.id}
                onClick={() => handleSelect(item)}
                className={`card-shell p-6 card-hover cursor-pointer relative transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-2 border-[#087F8C] bg-[#E6F7F5] dark:bg-teal-950/70 shadow-md scale-[1.01]'
                    : 'hover:border-[#087F8C]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        isSelected ? 'bg-[#087F8C] text-white' : 'bg-[#E6F7F5] dark:bg-teal-950 text-[#087F8C]'
                      }`}
                    >
                      <IconComponent size={24} />
                    </div>
                    {isSelected && <CheckCircle2 className="text-[#087F8C] dark:text-teal-400" size={22} />}
                  </div>

                  <h3 className="font-bold text-base text-[#172033] dark:text-white mb-1" style={{ fontFamily: 'Sora' }}>
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-[#087F8C] font-semibold">
                  <span>Select Option</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Back Link */}
        <div className="text-center pt-4">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400">
            ← Cancel and Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
