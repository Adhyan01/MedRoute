// MEDROUTE — Hospital Data & Types (Geographically Distributed across NCR)

export type BedStatus = 'available' | 'occupied' | 'reserved' | 'preparing' | 'out-of-service';
export type HospitalStatus = 'available' | 'limited' | 'critical';

export interface Bed {
  id: string;
  status: BedStatus;
  patientId?: string;
}

export interface Specialist {
  role: string;
  name: string;
  availability: 'available' | 'on-call' | 'unavailable';
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  etaMin: number;
  status: HospitalStatus;
  totalBeds: number;
  availableBeds: number;
  icu: {
    total: number;
    available: number;
    reserved: number;
    preparing: number;
    occupied: number;
    beds: Bed[];
  };
  ventilators: { total: number; available: number };
  operatingTheatres: { total: number; available: number };
  emergencyLoad: number; // 0-100
  bloodBank: boolean;
  ct: boolean;
  mri: boolean;
  specialists: Specialist[];
  facilities: string[];
  reliabilityScore: number;
  lastSyncSeconds: number;
  confirmedRequests: number;
  successfulAdmissions: number;
  failedConfirmations: number;
  acceptingTransfers: boolean;
  emergencyDept: boolean;
  trauma: boolean;
  pediatrics: boolean;
  cardiology: boolean;
  neurology: boolean;
}

export const HOSPITALS: Hospital[] = [
  {
    id: 'citycare',
    name: 'CityCare Hospital',
    address: '14, Nehru Marg, Connaught Place, Central New Delhi',
    lat: 28.6315,
    lng: 77.2167,
    distanceKm: 2.1,
    etaMin: 5,
    status: 'available',
    totalBeds: 280,
    availableBeds: 42,
    icu: {
      total: 24,
      available: 4,
      reserved: 1,
      preparing: 1,
      occupied: 18,
      beds: Array.from({ length: 24 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 18 ? 'occupied' : i === 18 ? 'reserved' : i === 19 ? 'preparing' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 8, available: 3 },
    operatingTheatres: { total: 4, available: 2 },
    emergencyLoad: 42,
    bloodBank: true,
    ct: true,
    mri: true,
    specialists: [
      { role: 'Cardiologist', name: 'Dr. Priya Sharma', availability: 'available' },
      { role: 'Trauma Surgeon', name: 'Dr. Rohan Mehta', availability: 'available' },
      { role: 'Neurologist', name: 'Dr. Anita Bose', availability: 'on-call' },
      { role: 'Critical Care Physician', name: 'Dr. Vikram Singh', availability: 'available' },
    ],
    facilities: ['CT', 'MRI', 'BloodBank', 'OR', 'ICU', 'EmergencyDept', 'Trauma', 'Cardiology'],
    reliabilityScore: 98.7,
    lastSyncSeconds: 12,
    confirmedRequests: 1248,
    successfulAdmissions: 1232,
    failedConfirmations: 16,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: true,
    pediatrics: false,
    cardiology: true,
    neurology: true,
  },
  {
    id: 'nova',
    name: 'Nova Medical Centre',
    address: 'Sector 18 Expressway, Noida, Uttar Pradesh',
    lat: 28.5708,
    lng: 77.3261,
    distanceKm: 3.2,
    etaMin: 7,
    status: 'available',
    totalBeds: 220,
    availableBeds: 38,
    icu: {
      total: 18,
      available: 5,
      reserved: 0,
      preparing: 1,
      occupied: 12,
      beds: Array.from({ length: 18 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 12 ? 'occupied' : i === 12 ? 'preparing' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 6, available: 3 },
    operatingTheatres: { total: 3, available: 2 },
    emergencyLoad: 38,
    bloodBank: true,
    ct: true,
    mri: true,
    specialists: [
      { role: 'Neurologist', name: 'Dr. Suresh Kumar', availability: 'available' },
      { role: 'Neurosurgeon', name: 'Dr. Lalita Verma', availability: 'available' },
      { role: 'Trauma Surgeon', name: 'Dr. Arun Das', availability: 'available' },
    ],
    facilities: ['CT', 'MRI', 'BloodBank', 'OR', 'ICU', 'EmergencyDept', 'Neurology', 'Trauma'],
    reliabilityScore: 96.2,
    lastSyncSeconds: 28,
    confirmedRequests: 892,
    successfulAdmissions: 858,
    failedConfirmations: 34,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: true,
    pediatrics: false,
    cardiology: false,
    neurology: true,
  },
  {
    id: 'apex',
    name: 'Apex Care Hospital',
    address: 'Cyber City, MG Road, Gurugram, Haryana',
    lat: 28.4950,
    lng: 77.0890,
    distanceKm: 4.1,
    etaMin: 9,
    status: 'available',
    totalBeds: 240,
    availableBeds: 71,
    icu: {
      total: 20,
      available: 7,
      reserved: 1,
      preparing: 0,
      occupied: 12,
      beds: Array.from({ length: 20 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 12 ? 'occupied' : i === 12 ? 'reserved' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 7, available: 4 },
    operatingTheatres: { total: 4, available: 3 },
    emergencyLoad: 33,
    bloodBank: true,
    ct: true,
    mri: true,
    specialists: [
      { role: 'Cardiologist', name: 'Dr. Neeraj Agarwal', availability: 'available' },
      { role: 'Neurologist', name: 'Dr. Smita Pillai', availability: 'available' },
      { role: 'Critical Care Physician', name: 'Dr. Tarun Saxena', availability: 'available' },
    ],
    facilities: ['CT', 'MRI', 'BloodBank', 'OR', 'ICU', 'EmergencyDept', 'Cardiology', 'Neurology'],
    reliabilityScore: 95.8,
    lastSyncSeconds: 15,
    confirmedRequests: 980,
    successfulAdmissions: 942,
    failedConfirmations: 38,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: false,
    pediatrics: false,
    cardiology: true,
    neurology: true,
  },
  {
    id: 'greenfield',
    name: 'Greenfield Medical Centre',
    address: 'Indirapuram Main Road, Ghaziabad, Uttar Pradesh',
    lat: 28.6410,
    lng: 77.3712,
    distanceKm: 5.4,
    etaMin: 11,
    status: 'available',
    totalBeds: 180,
    availableBeds: 52,
    icu: {
      total: 10,
      available: 4,
      reserved: 0,
      preparing: 0,
      occupied: 6,
      beds: Array.from({ length: 10 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 6 ? 'occupied' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 3, available: 2 },
    operatingTheatres: { total: 2, available: 1 },
    emergencyLoad: 41,
    bloodBank: true,
    ct: true,
    mri: false,
    specialists: [
      { role: 'Paediatrician', name: 'Dr. Anjali Dubey', availability: 'available' },
      { role: 'Trauma Surgeon', name: 'Dr. Vivek Joshi', availability: 'available' },
    ],
    facilities: ['CT', 'OR', 'ICU', 'EmergencyDept', 'Pediatrics', 'Trauma'],
    reliabilityScore: 91.6,
    lastSyncSeconds: 52,
    confirmedRequests: 410,
    successfulAdmissions: 363,
    failedConfirmations: 47,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: true,
    pediatrics: true,
    cardiology: false,
    neurology: false,
  },
  {
    id: 'hope',
    name: 'Hope Hospital',
    address: 'Sector 16 Mathura Road, Faridabad, Haryana',
    lat: 28.4089,
    lng: 77.3178,
    distanceKm: 6.0,
    etaMin: 13,
    status: 'available',
    totalBeds: 150,
    availableBeds: 44,
    icu: {
      total: 8,
      available: 3,
      reserved: 0,
      preparing: 1,
      occupied: 4,
      beds: Array.from({ length: 8 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 4 ? 'occupied' : i === 4 ? 'preparing' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 3, available: 2 },
    operatingTheatres: { total: 2, available: 1 },
    emergencyLoad: 38,
    bloodBank: true,
    ct: true,
    mri: false,
    specialists: [
      { role: 'General Surgeon', name: 'Dr. Ramesh Yadav', availability: 'available' },
    ],
    facilities: ['BloodBank', 'CT', 'OR', 'ICU', 'EmergencyDept'],
    reliabilityScore: 89.2,
    lastSyncSeconds: 78,
    confirmedRequests: 290,
    successfulAdmissions: 253,
    failedConfirmations: 37,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: false,
    pediatrics: false,
    cardiology: false,
    neurology: false,
  },
  {
    id: 'metrocare',
    name: 'MetroCare Hospital',
    address: 'Sector 7, Rohini, North New Delhi',
    lat: 28.7041,
    lng: 77.1025,
    distanceKm: 8.1,
    etaMin: 16,
    status: 'limited',
    totalBeds: 350,
    availableBeds: 14,
    icu: {
      total: 30,
      available: 2,
      reserved: 2,
      preparing: 0,
      occupied: 26,
      beds: Array.from({ length: 30 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 26 ? 'occupied' : i < 28 ? 'reserved' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 10, available: 2 },
    operatingTheatres: { total: 5, available: 1 },
    emergencyLoad: 75,
    bloodBank: true,
    ct: true,
    mri: false,
    specialists: [
      { role: 'Trauma Surgeon', name: 'Dr. Deepak Rao', availability: 'available' },
      { role: 'Cardiologist', name: 'Dr. Sunita Jain', availability: 'on-call' },
    ],
    facilities: ['CT', 'BloodBank', 'ICU', 'EmergencyDept', 'Trauma'],
    reliabilityScore: 91.4,
    lastSyncSeconds: 45,
    confirmedRequests: 2100,
    successfulAdmissions: 1913,
    failedConfirmations: 187,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: true,
    pediatrics: false,
    cardiology: true,
    neurology: false,
  },
  {
    id: 'lifeline',
    name: 'Lifeline Multispeciality',
    address: 'Saket District Centre, South New Delhi',
    lat: 28.5244,
    lng: 77.2188,
    distanceKm: 7.5,
    etaMin: 15,
    status: 'available',
    totalBeds: 190,
    availableBeds: 55,
    icu: {
      total: 16,
      available: 5,
      reserved: 0,
      preparing: 2,
      occupied: 9,
      beds: Array.from({ length: 16 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 9 ? 'occupied' : i < 11 ? 'preparing' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 5, available: 3 },
    operatingTheatres: { total: 3, available: 2 },
    emergencyLoad: 35,
    bloodBank: true,
    ct: true,
    mri: true,
    specialists: [
      { role: 'Cardiologist', name: 'Dr. Rekha Nair', availability: 'available' },
      { role: 'Paediatrician', name: 'Dr. Mohan Gupta', availability: 'available' },
      { role: 'Critical Care Physician', name: 'Dr. Kavita Shah', availability: 'available' },
    ],
    facilities: ['CT', 'MRI', 'BloodBank', 'OR', 'ICU', 'EmergencyDept', 'Cardiology', 'Pediatrics'],
    reliabilityScore: 97.1,
    lastSyncSeconds: 8,
    confirmedRequests: 765,
    successfulAdmissions: 750,
    failedConfirmations: 15,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: false,
    pediatrics: true,
    cardiology: true,
    neurology: false,
  },
  {
    id: 'central-trauma',
    name: 'Central Trauma Institute',
    address: 'AIIMS Ring Road, Central New Delhi',
    lat: 28.5672,
    lng: 77.2100,
    distanceKm: 6.8,
    etaMin: 14,
    status: 'available',
    totalBeds: 120,
    availableBeds: 15,
    icu: {
      total: 20,
      available: 3,
      reserved: 1,
      preparing: 0,
      occupied: 16,
      beds: Array.from({ length: 20 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 16 ? 'occupied' : i === 16 ? 'reserved' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 12, available: 4 },
    operatingTheatres: { total: 6, available: 2 },
    emergencyLoad: 68,
    bloodBank: true,
    ct: true,
    mri: true,
    specialists: [
      { role: 'Trauma Surgeon', name: 'Dr. Ajay Rathore', availability: 'available' },
    ],
    facilities: ['CT', 'MRI', 'BloodBank', 'OR', 'ICU', 'EmergencyDept', 'Trauma'],
    reliabilityScore: 94.8,
    lastSyncSeconds: 6,
    confirmedRequests: 3200,
    successfulAdmissions: 3034,
    failedConfirmations: 166,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: true,
    pediatrics: false,
    cardiology: false,
    neurology: false,
  },
  {
    id: 'sunrise',
    name: 'Sunrise Medical Centre',
    address: 'Janakpuri District Centre, West New Delhi',
    lat: 28.6219,
    lng: 77.0878,
    distanceKm: 10.2,
    etaMin: 20,
    status: 'available',
    totalBeds: 160,
    availableBeds: 48,
    icu: {
      total: 12,
      available: 4,
      reserved: 0,
      preparing: 1,
      occupied: 7,
      beds: Array.from({ length: 12 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 7 ? 'occupied' : i === 7 ? 'preparing' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 4, available: 2 },
    operatingTheatres: { total: 2, available: 1 },
    emergencyLoad: 48,
    bloodBank: false,
    ct: true,
    mri: false,
    specialists: [
      { role: 'General Surgeon', name: 'Dr. Pallavi Sen', availability: 'available' },
      { role: 'Paediatrician', name: 'Dr. Rahul Kapoor', availability: 'on-call' },
    ],
    facilities: ['CT', 'OR', 'ICU', 'EmergencyDept', 'Pediatrics'],
    reliabilityScore: 93.5,
    lastSyncSeconds: 19,
    confirmedRequests: 542,
    successfulAdmissions: 507,
    failedConfirmations: 35,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: false,
    pediatrics: true,
    cardiology: false,
    neurology: false,
  },
  {
    id: 'unity',
    name: 'Unity Hospital',
    address: 'Preet Vihar Main Road, East New Delhi',
    lat: 28.6369,
    lng: 77.2789,
    distanceKm: 6.2,
    etaMin: 12,
    status: 'available',
    totalBeds: 200,
    availableBeds: 62,
    icu: {
      total: 14,
      available: 6,
      reserved: 0,
      preparing: 0,
      occupied: 8,
      beds: Array.from({ length: 14 }, (_, i) => ({
        id: `ICU-${String(i + 1).padStart(2, '0')}`,
        status: i < 8 ? 'occupied' : 'available',
      })) as Bed[],
    },
    ventilators: { total: 5, available: 3 },
    operatingTheatres: { total: 2, available: 2 },
    emergencyLoad: 29,
    bloodBank: true,
    ct: false,
    mri: false,
    specialists: [
      { role: 'General Physician', name: 'Dr. Swati Menon', availability: 'available' },
    ],
    facilities: ['BloodBank', 'OR', 'ICU', 'EmergencyDept'],
    reliabilityScore: 89.3,
    lastSyncSeconds: 34,
    confirmedRequests: 320,
    successfulAdmissions: 286,
    failedConfirmations: 34,
    acceptingTransfers: true,
    emergencyDept: true,
    trauma: false,
    pediatrics: false,
    cardiology: false,
    neurology: false,
  },
];

export function getHospitalById(id: string): Hospital | undefined {
  return HOSPITALS.find((h) => h.id === id);
}
