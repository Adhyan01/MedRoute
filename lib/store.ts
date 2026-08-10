'use client';
// MEDROUTE — Global Reservation & Hospital State Store (Zustand + Supabase Realtime)

import { create } from 'zustand';
import { HOSPITALS, Hospital, Bed, BedStatus } from './hospitals';
import { supabase } from './supabaseClient';

export interface Reservation {
  id: string;
  hospitalId: string;
  bedId: string;
  emergencyType: string;
  eta: number;
  createdAt: Date;
  expiresAt: Date;
  status: 'pending' | 'confirmed' | 'expired' | 'cancelled';
  patientRef: string;
}

export interface IncomingEmergency {
  id: string;
  emergencyType: string;
  eta: number;
  requiredCapabilities: string[];
  reservedBedId: string;
  status: 'incoming' | 'accepted' | 'declined';
}

interface MedRouteStore {
  hospitals: Hospital[];
  reservations: Reservation[];
  incomingEmergencies: IncomingEmergency[];
  isRealtimeConnected: boolean;

  // Realtime initialization
  initRealtime: () => void;

  // Reservation actions
  makeReservation: (hospitalId: string, bedId: string, emergencyType: string, eta: number) => Reservation | { conflict: true; bedId: string };
  cancelReservation: (reservationId: string) => void;
  acceptEmergency: (emergencyId: string) => void;
  declineEmergency: (emergencyId: string) => void;

  // Simulation
  tickSimulation: () => void;

  // Hospital dashboard
  updateBedStatus: (hospitalId: string, bedId: string, status: BedStatus) => void;
}

let patientCounter = 1000;

export const useMedRouteStore = create<MedRouteStore>((set, get) => ({
  hospitals: JSON.parse(JSON.stringify(HOSPITALS)), // deep clone for mutability
  reservations: [],
  incomingEmergencies: [],
  isRealtimeConnected: false,

  initRealtime: () => {
    if (get().isRealtimeConnected) return;

    try {
      // Subscribe to Supabase Realtime changes on 'beds' table
      const channel = supabase
        .channel('medroute_network_realtime')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'beds' },
          (payload: any) => {
            console.log('⚡ Realtime bed payload received:', payload);
            if (payload.new) {
              const newBed = payload.new;
              set(state => ({
                hospitals: state.hospitals.map(h => {
                  if (h.id !== newBed.hospital_id) return h;
                  return {
                    ...h,
                    icu: {
                      ...h.icu,
                      beds: h.icu.beds.map(b =>
                        b.id === newBed.bed_number
                          ? { ...b, status: newBed.status.toLowerCase() as BedStatus }
                          : b
                      ),
                    },
                  };
                }),
              }));
            }
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            set({ isRealtimeConnected: true });
          }
        });
    } catch (err) {
      console.warn('Realtime subscription fallback:', err);
    }
  },

  makeReservation: (hospitalId, bedId, emergencyType, eta) => {
    const state = get();
    const hospital = state.hospitals.find(h => h.id === hospitalId);
    if (!hospital) return { conflict: true, bedId };

    const bed = hospital.icu.beds.find(b => b.id === bedId);
    if (!bed || bed.status !== 'available') {
      return { conflict: true, bedId };
    }

    // Reserve the bed
    const now = new Date();
    const expires = new Date(now.getTime() + 30 * 60 * 1000); // 30 min
    const patientRef = `MR-${++patientCounter}`;

    const reservation: Reservation = {
      id: `res-${Date.now()}`,
      hospitalId,
      bedId,
      emergencyType,
      eta,
      createdAt: now,
      expiresAt: expires,
      status: 'confirmed',
      patientRef,
    };

    const incoming: IncomingEmergency = {
      id: `inc-${Date.now()}`,
      emergencyType,
      eta,
      requiredCapabilities: [],
      reservedBedId: bedId,
      status: 'incoming',
    };

    set(state => {
      const hospitals = state.hospitals.map(h => {
        if (h.id !== hospitalId) return h;
        return {
          ...h,
          icu: {
            ...h.icu,
            available: Math.max(0, h.icu.available - 1),
            reserved: h.icu.reserved + 1,
            beds: h.icu.beds.map(b =>
              b.id === bedId ? { ...b, status: 'reserved' as BedStatus } : b
            ),
          },
        };
      });
      return {
        hospitals,
        reservations: [...state.reservations, reservation],
        incomingEmergencies: [...state.incomingEmergencies, incoming],
      };
    });

    return reservation;
  },

  cancelReservation: (reservationId) => {
    const state = get();
    const res = state.reservations.find(r => r.id === reservationId);
    if (!res) return;

    set(state => {
      const hospitals = state.hospitals.map(h => {
        if (h.id !== res.hospitalId) return h;
        return {
          ...h,
          icu: {
            ...h.icu,
            available: h.icu.available + 1,
            reserved: Math.max(0, h.icu.reserved - 1),
            beds: h.icu.beds.map(b =>
              b.id === res.bedId ? { ...b, status: 'available' as BedStatus } : b
            ),
          },
        };
      });
      return {
        hospitals,
        reservations: state.reservations.map(r =>
          r.id === reservationId ? { ...r, status: 'cancelled' } : r
        ),
      };
    });
  },

  acceptEmergency: (emergencyId) => {
    set(state => ({
      incomingEmergencies: state.incomingEmergencies.map(e =>
        e.id === emergencyId ? { ...e, status: 'accepted' } : e
      ),
    }));
  },

  declineEmergency: (emergencyId) => {
    set(state => ({
      incomingEmergencies: state.incomingEmergencies.map(e =>
        e.id === emergencyId ? { ...e, status: 'declined' } : e
      ),
    }));
  },

  updateBedStatus: (hospitalId, bedId, status) => {
    set(state => ({
      hospitals: state.hospitals.map(h => {
        if (h.id !== hospitalId) return h;
        return {
          ...h,
          icu: {
            ...h.icu,
            beds: h.icu.beds.map(b =>
              b.id === bedId ? { ...b, status } : b
            ),
          },
        };
      }),
    }));
  },

  tickSimulation: () => {
    set(state => {
      const hospitals = state.hospitals.map(h => {
        const loadDelta = (Math.random() - 0.5) * 2;
        const newLoad = Math.max(20, Math.min(99, h.emergencyLoad + loadDelta));
        const newSync = Math.max(1, h.lastSyncSeconds + Math.floor(Math.random() * 2));

        return {
          ...h,
          emergencyLoad: Math.round(newLoad),
          lastSyncSeconds: newSync > 60 ? Math.floor(Math.random() * 15) + 2 : newSync,
        };
      });
      return { hospitals };
    });
  },
}));

// Derived helper to get network stats
export function getNetworkStats(hospitals: Hospital[]) {
  const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0);
  const availableBeds = hospitals.reduce((s, h) => s + h.availableBeds, 0);
  const icuBeds = hospitals.reduce((s, h) => s + h.icu.available, 0);
  const ventilators = hospitals.reduce((s, h) => s + h.ventilators.available, 0);
  const avgLoad = Math.round(hospitals.reduce((s, h) => s + h.emergencyLoad, 0) / (hospitals.length || 1));
  return { totalBeds, availableBeds, icuBeds, ventilators, avgLoad };
}
