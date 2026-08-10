// MEDROUTE — Dynamic Location-Aware Hospital Matching Engine

import { Hospital, HOSPITALS } from './hospitals';
import { EmergencyTypeId } from './emergencyTypes';
import { PatientLocation, haversineDistance, DEFAULT_PATIENT_LOCATION } from './googleMaps';

export interface MatchResult {
  hospital: Hospital;
  score: number;
  matchedCapabilities: string[];
  missingCapabilities: string[];
  scoreBreakdown: {
    clinical: number;
    resources: number;
    travel: number;
    specialist: number;
    edLoad: number;
    reliability: number;
  };
  matchLabel: 'best' | 'good' | 'limited' | 'unsuitable';
  readyMessage: string;
}

const CAPABILITY_MAP: Record<EmergencyTypeId, string[]> = {
  'chest-pain': ['ICU', 'Cardiology', 'CT', 'EmergencyDept'],
  breathing: ['ICU', 'Ventilator', 'EmergencyDept'],
  accident: ['ICU', 'Trauma', 'CT', 'BloodBank', 'OR'],
  stroke: ['ICU', 'Neurology', 'CT', 'EmergencyDept'],
  bleeding: ['BloodBank', 'ICU', 'OR', 'EmergencyDept'],
  burn: ['ICU', 'OR', 'EmergencyDept'],
  child: ['Pediatrics', 'ICU', 'EmergencyDept'],
  other: ['EmergencyDept', 'ICU'],
  unsure: ['EmergencyDept'],
};

function hasCapability(hospital: Hospital, cap: string): boolean {
  switch (cap) {
    case 'ICU': return hospital.icu.available > 0;
    case 'Ventilator': return hospital.ventilators.available > 0;
    case 'CT': return hospital.ct;
    case 'MRI': return hospital.mri;
    case 'BloodBank': return hospital.bloodBank;
    case 'OR': return hospital.operatingTheatres.available > 0;
    case 'EmergencyDept': return hospital.emergencyDept;
    case 'Trauma': return hospital.trauma && hospital.specialists.some(s => s.role.toLowerCase().includes('trauma') && s.availability !== 'unavailable');
    case 'Cardiology': return hospital.cardiology && hospital.specialists.some(s => s.role.toLowerCase().includes('cardio') && s.availability !== 'unavailable');
    case 'Neurology': return hospital.neurology && hospital.specialists.some(s => (s.role.toLowerCase().includes('neuro') || s.role.toLowerCase().includes('neurolog')) && s.availability !== 'unavailable');
    case 'Pediatrics': return hospital.pediatrics && hospital.specialists.some(s => s.role.toLowerCase().includes('paediatr') && s.availability !== 'unavailable');
    default: return false;
  }
}

function clinicalScore(hospital: Hospital, required: string[]): { score: number; matched: string[]; missing: string[] } {
  const matched: string[] = [];
  const missing: string[] = [];
  required.forEach((cap) => {
    if (hasCapability(hospital, cap)) matched.push(cap);
    else missing.push(cap);
  });
  return { score: matched.length / required.length, matched, missing };
}

function resourceScore(hospital: Hospital): number {
  const icuScore = hospital.icu.available > 0 ? 1 : 0;
  const syncScore = hospital.lastSyncSeconds < 60 ? 1 : hospital.lastSyncSeconds < 300 ? 0.5 : 0;
  return (icuScore * 0.6 + syncScore * 0.4);
}

function travelScore(etaMin: number): number {
  if (etaMin <= 8) return 1;
  if (etaMin <= 15) return 0.85;
  if (etaMin <= 25) return 0.65;
  if (etaMin <= 35) return 0.4;
  if (etaMin <= 50) return 0.2;
  return 0.05;
}

function specialistScore(hospital: Hospital, required: string[]): number {
  const specialistCaps = required.filter(c => ['Trauma', 'Cardiology', 'Neurology', 'Pediatrics'].includes(c));
  if (specialistCaps.length === 0) return 1;
  let score = 0;
  specialistCaps.forEach(cap => {
    const keyword = cap === 'Trauma' ? 'trauma' : cap === 'Cardiology' ? 'cardio' : cap === 'Neurology' ? 'neuro' : 'paediatr';
    const spec = hospital.specialists.find(s => s.role.toLowerCase().includes(keyword));
    if (!spec) return;
    if (spec.availability === 'available') score += 1;
    else if (spec.availability === 'on-call') score += 0.6;
  });
  return score / specialistCaps.length;
}

function edLoadScore(load: number): number {
  if (load <= 50) return 1;
  if (load <= 70) return 0.7;
  if (load <= 85) return 0.3;
  return 0;
}

function reliabilityScore(score: number): number {
  return score / 100;
}

export function matchHospitals(
  emergencyType: EmergencyTypeId,
  patientLocation?: PatientLocation | null,
  storeHospitals?: Hospital[]
): MatchResult[] {
  const loc = patientLocation || DEFAULT_PATIENT_LOCATION;
  const hospitalList = storeHospitals || HOSPITALS;
  const required = CAPABILITY_MAP[emergencyType] || ['EmergencyDept'];

  const results: MatchResult[] = hospitalList.map((rawHospital) => {
    // Dynamically calculate actual distance & travel time from patient location
    const { distanceKm, durationMins } = haversineDistance(
      loc.latitude,
      loc.longitude,
      rawHospital.lat,
      rawHospital.lng
    );

    // Create dynamically updated hospital object with new distance & travel time
    const hospital: Hospital = {
      ...rawHospital,
      distanceKm,
      etaMin: durationMins,
    };

    const clinical = clinicalScore(hospital, required);
    const res = resourceScore(hospital);
    const travel = travelScore(durationMins);
    const specialist = specialistScore(hospital, required);
    const edLoad = edLoadScore(hospital.emergencyLoad);
    const reliability = reliabilityScore(hospital.reliabilityScore);

    // Hard penalty for missing critical required capabilities (prevent incapable hospital from outranking capable one)
    const missingPenalty = clinical.missing.length * 0.25;

    const totalScore = Math.max(
      0.05,
      clinical.score * 0.30 +
        res * 0.25 +
        travel * 0.20 +
        specialist * 0.10 +
        edLoad * 0.10 +
        reliability * 0.05 -
        missingPenalty
    );

    let matchLabel: MatchResult['matchLabel'];
    let readyMessage: string;

    if (totalScore >= 0.72 && clinical.missing.length === 0 && hospital.emergencyLoad < 80) {
      matchLabel = 'best';
      readyMessage = '🟢 Ready for this emergency';
    } else if (totalScore >= 0.50 && clinical.missing.length <= 1) {
      matchLabel = 'good';
      readyMessage = '🟢 Good match';
    } else if (totalScore >= 0.30 || clinical.missing.length <= 2) {
      matchLabel = 'limited';
      readyMessage = '🟡 Limited capacity';
    } else {
      matchLabel = 'unsuitable';
      readyMessage = '🔴 Not currently suitable';
    }

    if (hospital.emergencyLoad >= 95) {
      matchLabel = 'unsuitable';
      readyMessage = '🔴 Emergency department currently overloaded';
    }

    return {
      hospital,
      score: Math.round(totalScore * 100),
      matchedCapabilities: clinical.matched,
      missingCapabilities: clinical.missing,
      scoreBreakdown: {
        clinical: Math.round(clinical.score * 100),
        resources: Math.round(res * 100),
        travel: Math.round(travel * 100),
        specialist: Math.round(specialist * 100),
        edLoad: Math.round(edLoad * 100),
        reliability: Math.round(reliability * 100),
      },
      matchLabel,
      readyMessage,
    };
  });

  return results.sort((a, b) => b.score - a.score);
}

export function getRequiredCapabilities(emergencyType: EmergencyTypeId): string[] {
  return CAPABILITY_MAP[emergencyType] || ['EmergencyDept'];
}

export function capabilityLabel(cap: string): string {
  const map: Record<string, string> = {
    ICU: 'ICU bed',
    Ventilator: 'Ventilator',
    CT: 'CT scanner',
    MRI: 'MRI',
    BloodBank: 'Blood bank',
    OR: 'Operating theatre',
    EmergencyDept: 'Emergency department',
    Trauma: 'Trauma surgeon',
    Cardiology: 'Cardiologist',
    Neurology: 'Neurologist',
    Pediatrics: 'Paediatric care',
  };
  return map[cap] || cap;
}
