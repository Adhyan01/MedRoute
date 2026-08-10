// MEDROUTE — Google Maps, Places Autocomplete & Routing Helper

export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface PatientLocation {
  displayName: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  source: 'manual' | 'gps';
}

export interface RouteResult {
  distanceKm: number;
  durationMins: number;
  source: 'google' | 'haversine_fallback';
}

export interface PlaceSuggestion {
  description: string;
  placeId: string;
  mainText: string;
  secondaryText: string;
}

export const DEFAULT_PATIENT_LOCATION: PatientLocation = {
  displayName: 'Connaught Place, New Delhi',
  formattedAddress: 'Connaught Place, New Delhi, Delhi, India',
  latitude: 28.6315,
  longitude: 77.2167,
  placeId: 'ChIJR036f0flDDkR6Kz0BvT2g8g',
  source: 'manual',
};

// Center of Delhi NCR Demo Region
const DELHI_NCR_CENTER = { lat: 28.6139, lng: 77.2090 };
const MAX_DEMO_NETWORK_RADIUS_KM = 65;

const GOOGLE_MAPS_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

// Built-in location database for instant autocomplete & geocoding resolution
const LOCATION_DATABASE: Record<string, PatientLocation> = {
  'connaught place': { displayName: 'Connaught Place', formattedAddress: 'Connaught Place, New Delhi, Delhi, India', latitude: 28.6315, longitude: 77.2167, placeId: 'ChIJR036f0flDDkR6Kz0BvT2g8g', source: 'manual' },
  'sector 18 noida': { displayName: 'Sector 18 Noida', formattedAddress: 'Sector 18, Noida, Uttar Pradesh, India', latitude: 28.5708, longitude: 77.3261, placeId: 'ChIJ4z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'cyber city': { displayName: 'Cyber City', formattedAddress: 'Cyber City, Gurugram, Haryana, India', latitude: 28.4950, longitude: 77.0890, placeId: 'ChIJx_Z_8if9DDkR6Kz0BvT2g8g', source: 'manual' },
  'indirapuram': { displayName: 'Indirapuram', formattedAddress: 'Indirapuram, Ghaziabad, Uttar Pradesh, India', latitude: 28.6410, longitude: 77.3712, placeId: 'ChIJ9z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'sector 16 faridabad': { displayName: 'Sector 16 Faridabad', formattedAddress: 'Sector 16, Faridabad, Haryana, India', latitude: 28.4089, longitude: 77.3178, placeId: 'ChIJ8z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'saket': { displayName: 'Saket', formattedAddress: 'Saket District Centre, New Delhi, Delhi, India', latitude: 28.5244, longitude: 77.2188, placeId: 'ChIJ7z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'rohini': { displayName: 'Rohini', formattedAddress: 'Sector 7, Rohini, New Delhi, Delhi, India', latitude: 28.7041, longitude: 77.1025, placeId: 'ChIJ6z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'janakpuri': { displayName: 'Janakpuri', formattedAddress: 'Janakpuri District Centre, New Delhi, Delhi, India', latitude: 28.6219, longitude: 77.0878, placeId: 'ChIJ5z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'preet vihar': { displayName: 'Preet Vihar', formattedAddress: 'Preet Vihar, East Delhi, Delhi, India', latitude: 28.6369, longitude: 77.2789, placeId: 'ChIJ4z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'mg road': { displayName: 'MG Road', formattedAddress: 'MG Road, Gurugram, Haryana, India', latitude: 28.4800, longitude: 77.0800, placeId: 'ChIJ3z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'mumbai': { displayName: 'Mumbai', formattedAddress: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, placeId: 'ChIJwe1EZjDG5zsRaYkAhAFE_n8', source: 'manual' },
  'bangalore': { displayName: 'Bengaluru', formattedAddress: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, placeId: 'ChIJbU60yXAWrjsRAkEw9ACcsZs', source: 'manual' },
  'bengaluru': { displayName: 'Bengaluru', formattedAddress: 'Bengaluru, Karnataka, India', latitude: 12.9716, longitude: 77.5946, placeId: 'ChIJbU60yXAWrjsRAkEw9ACcsZs', source: 'manual' },
  'koramangala': { displayName: 'Koramangala', formattedAddress: 'Koramangala, Bengaluru, Karnataka, India', latitude: 12.9352, longitude: 77.6245, placeId: 'ChIJ2cQn27wVrjsR8v_hQd0G4eE', source: 'manual' },
  'noida': { displayName: 'Noida', formattedAddress: 'Noida, Uttar Pradesh, India', latitude: 28.5708, longitude: 77.3261, placeId: 'ChIJ4z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'gurugram': { displayName: 'Gurugram', formattedAddress: 'Gurugram, Haryana, India', latitude: 28.4950, longitude: 77.0890, placeId: 'ChIJx_Z_8if9DDkR6Kz0BvT2g8g', source: 'manual' },
  'gurgaon': { displayName: 'Gurugram', formattedAddress: 'Gurugram, Haryana, India', latitude: 28.4950, longitude: 77.0890, placeId: 'ChIJx_Z_8if9DDkR6Kz0BvT2g8g', source: 'manual' },
  'ghaziabad': { displayName: 'Ghaziabad', formattedAddress: 'Ghaziabad, Uttar Pradesh, India', latitude: 28.6410, longitude: 77.3712, placeId: 'ChIJ9z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'faridabad': { displayName: 'Faridabad', formattedAddress: 'Faridabad, Haryana, India', latitude: 28.4089, longitude: 77.3178, placeId: 'ChIJ8z1E54H3DDkR6Kz0BvT2g8g', source: 'manual' },
  'delhi': { displayName: 'New Delhi', formattedAddress: 'New Delhi, Delhi, India', latitude: 28.6139, longitude: 77.2090, placeId: 'ChIJL_Z_8if9DDkR6Kz0BvT2g8g', source: 'manual' },
};

// ─── CANONICAL LOCATION STATE UTILS ───────────────────────────────
export function getStoredPatientLocation(): PatientLocation {
  if (typeof window === 'undefined') return DEFAULT_PATIENT_LOCATION;
  try {
    const raw = sessionStorage.getItem('patient-location');
    if (!raw) return DEFAULT_PATIENT_LOCATION;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.latitude === 'number' && typeof parsed.longitude === 'number') {
      return {
        displayName: parsed.displayName || parsed.formattedAddress?.split(',')[0] || 'Selected Location',
        formattedAddress: parsed.formattedAddress || parsed.address || 'Selected Location',
        latitude: parsed.latitude,
        longitude: parsed.longitude,
        placeId: parsed.placeId || 'manual-place',
        source: parsed.source === 'gps' ? 'gps' : 'manual',
      };
    }
  } catch (e) {
    console.warn('Error reading patient location:', e);
  }
  return DEFAULT_PATIENT_LOCATION;
}

export function savePatientLocation(location: PatientLocation): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem('patient-location', JSON.stringify(location));
    window.dispatchEvent(new CustomEvent('patient-location-updated', { detail: location }));
  } catch (e) {
    console.warn('Error saving patient location:', e);
  }
}

// ─── NETWORK BOUNDS CHECK (DELHI NCR DEMO REGION) ────────────────
export function isLocationOutsideNetwork(loc: PatientLocation): boolean {
  const { distanceKm } = haversineDistance(loc.latitude, loc.longitude, DELHI_NCR_CENTER.lat, DELHI_NCR_CENTER.lng);
  return distanceKm > MAX_DEMO_NETWORK_RADIUS_KM;
}

// ─── HAVERSINE DISTANCE CALCULATOR ───────────────────────────────
export function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): { distanceKm: number; durationMins: number } {
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;
  // Emergency driving speed estimate (~35 km/h average with sirens/emergency priority)
  const durationMins = Math.max(2, Math.round((distanceKm / 35) * 60));

  return { distanceKm, durationMins };
}

// ─── GOOGLE ROUTES / DISTANCE MATRIX ──────────────────────────────
export async function calculateRoute(
  origin: MapCoordinates,
  destination: MapCoordinates
): Promise<RouteResult> {
  const fallback = haversineDistance(origin.lat, origin.lng, destination.lat, destination.lng);

  if (!GOOGLE_MAPS_KEY || GOOGLE_MAPS_KEY.includes('demo')) {
    return { ...fallback, source: 'haversine_fallback' };
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destination.lat},${destination.lng}&key=${GOOGLE_MAPS_KEY}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Google Distance Matrix API HTTP ${response.status}`);
    const data = await response.json();

    if (data.status === 'OK' && data.rows?.[0]?.elements?.[0]?.status === 'OK') {
      const element = data.rows[0].elements[0];
      const distanceKm = Math.round((element.distance.value / 1000) * 10) / 10;
      const durationMins = Math.round(element.duration.value / 60);
      return { distanceKm, durationMins, source: 'google' };
    }
  } catch (err) {
    console.warn('Google Maps API route calculation fallback:', err);
  }

  return { ...fallback, source: 'haversine_fallback' };
}

// ─── GOOGLE MAPS JS SDK SCRIPT LOADER ─────────────────────────────
let isScriptLoading = false;
let isScriptLoaded = false;

export function loadGoogleMapsScript(callback: () => void): void {
  if (typeof window === 'undefined') return;
  if ((window as any).google?.maps?.places) {
    callback();
    return;
  }

  if (isScriptLoaded) {
    callback();
    return;
  }

  const existingScript = document.getElementById('google-maps-js-sdk');
  if (existingScript) {
    existingScript.addEventListener('load', () => {
      isScriptLoaded = true;
      callback();
    });
    return;
  }

  if (isScriptLoading) return;
  isScriptLoading = true;

  const script = document.createElement('script');
  script.id = 'google-maps-js-sdk';
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
  script.async = true;
  script.defer = true;
  script.onload = () => {
    isScriptLoaded = true;
    isScriptLoading = false;
    callback();
  };
  script.onerror = () => {
    isScriptLoading = false;
  };
  document.head.appendChild(script);
}

// ─── GOOGLE PLACES AUTOCOMPLETE SUGGESTIONS API ───────────────────
export async function fetchPlaceSuggestions(query: string): Promise<PlaceSuggestion[]> {
  if (!query || query.trim().length < 2) return [];

  const lower = query.toLowerCase();

  // 1. Try Google Maps JavaScript AutocompleteService if window.google is loaded
  if (typeof window !== 'undefined' && (window as any).google?.maps?.places?.AutocompleteService) {
    try {
      const service = new (window as any).google.maps.places.AutocompleteService();
      const predictions = await new Promise<any[]>((resolve) => {
        service.getPlacePredictions({ input: query }, (res: any[], status: any) => {
          if (status === 'OK' && res) resolve(res);
          else resolve([]);
        });
      });

      if (predictions.length > 0) {
        return predictions.slice(0, 5).map(p => ({
          description: p.description,
          placeId: p.place_id,
          mainText: p.structured_formatting?.main_text || p.description.split(',')[0],
          secondaryText: p.structured_formatting?.secondary_text || p.description.split(',').slice(1).join(',').trim(),
        }));
      }
    } catch (e) {
      console.warn('Google Places AutocompleteService error:', e);
    }
  }

  // 2. Try Google Geocoding API if key is set
  if (GOOGLE_MAPS_KEY && !GOOGLE_MAPS_KEY.includes('demo')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${GOOGLE_MAPS_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.length > 0) {
          return data.results.slice(0, 5).map((r: any) => ({
            description: r.formatted_address,
            placeId: r.place_id,
            mainText: r.address_components?.[0]?.long_name || r.formatted_address.split(',')[0],
            secondaryText: r.formatted_address.split(',').slice(1).join(',').trim(),
          }));
        }
      }
    } catch (e) {
      console.warn('Google Geocoding API fallback:', e);
    }
  }

  // 3. Fallback dictionary (sorted longest keys first to prevent partial false matches)
  const sortedKeys = Object.keys(LOCATION_DATABASE).sort((a, b) => b.length - a.length);
  const matches: PlaceSuggestion[] = [];

  for (const k of sortedKeys) {
    if (k.includes(lower) || lower.includes(k)) {
      const item = LOCATION_DATABASE[k];
      if (!matches.some(m => m.placeId === item.placeId)) {
        matches.push({
          description: item.formattedAddress,
          placeId: item.placeId,
          mainText: item.displayName,
          secondaryText: item.formattedAddress.split(',').slice(1).join(',').trim(),
        });
      }
    }
  }

  if (matches.length > 0) return matches;

  return [
    {
      description: `${query.trim()}, India`,
      placeId: `place-${Date.now()}`,
      mainText: query.trim(),
      secondaryText: 'India',
    },
  ];
}

// ─── RESOLVE PLACE TO CANONICAL PATIENT LOCATION ──────────────────
export async function geocodePlaceSuggestion(suggestion: PlaceSuggestion): Promise<PatientLocation> {
  // 1. Check exact dictionary match by placeId or description first
  const lower = suggestion.description.toLowerCase();
  const sortedKeys = Object.keys(LOCATION_DATABASE).sort((a, b) => b.length - a.length);

  for (const k of sortedKeys) {
    const item = LOCATION_DATABASE[k];
    if (suggestion.placeId === item.placeId || lower.includes(k)) {
      return { ...item, placeId: suggestion.placeId || item.placeId };
    }
  }

  // 2. Try Google Maps JS Geocoder if SDK is loaded in browser
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const result = await new Promise<PatientLocation | null>((resolve) => {
        geocoder.geocode({ address: suggestion.description }, (results: any[], status: string) => {
          if (status === 'OK' && results && results[0]) {
            const first = results[0];
            const lat = first.geometry.location.lat();
            const lng = first.geometry.location.lng();
            const name = suggestion.mainText || first.address_components?.[0]?.long_name || first.formatted_address.split(',')[0];
            resolve({
              displayName: name,
              formattedAddress: first.formatted_address || suggestion.description,
              latitude: lat,
              longitude: lng,
              placeId: first.place_id || suggestion.placeId,
              source: 'manual',
            });
          } else {
            resolve(null);
          }
        });
      });

      if (result) return result;
    } catch (e) {
      console.warn('Google Maps JS Geocoder fallback:', e);
    }
  }

  // 3. Try Google Geocoding REST API
  if (GOOGLE_MAPS_KEY && !GOOGLE_MAPS_KEY.includes('demo')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(suggestion.description)}&key=${GOOGLE_MAPS_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.[0]?.geometry?.location) {
          const loc = data.results[0].geometry.location;
          return {
            displayName: suggestion.mainText || suggestion.description.split(',')[0],
            formattedAddress: data.results[0].formatted_address || suggestion.description,
            latitude: loc.lat,
            longitude: loc.lng,
            placeId: data.results[0].place_id || suggestion.placeId,
            source: 'manual',
          };
        }
      }
    } catch (e) {
      console.warn('Geocode place REST API failed:', e);
    }
  }

  return {
    displayName: suggestion.mainText || suggestion.description.split(',')[0],
    formattedAddress: suggestion.description,
    latitude: 28.6315,
    longitude: 77.2167,
    placeId: suggestion.placeId || 'fallback-id',
    source: 'manual',
  };
}

// ─── REVERSE GEOCODE GPS LAT/LNG TO HUMAN-READABLE PLACE NAME ──────
export async function reverseGeocodeCoords(lat: number, lng: number): Promise<PatientLocation> {
  // 1. Try Google Maps JS Geocoder if loaded
  if (typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder) {
    try {
      const geocoder = new (window as any).google.maps.Geocoder();
      const res = await new Promise<PatientLocation | null>((resolve) => {
        geocoder.geocode({ location: { lat, lng } }, (results: any[], status: string) => {
          if (status === 'OK' && results && results[0]) {
            const first = results[0];
            const name = first.address_components?.[0]?.long_name || first.formatted_address.split(',')[0];
            resolve({
              displayName: name,
              formattedAddress: first.formatted_address,
              latitude: lat,
              longitude: lng,
              placeId: first.place_id || `gps-${Date.now()}`,
              source: 'gps',
            });
          } else {
            resolve(null);
          }
        });
      });
      if (res) return res;
    } catch (e) {
      console.warn('Reverse geocode JS error:', e);
    }
  }

  // 2. Try REST API
  if (GOOGLE_MAPS_KEY && !GOOGLE_MAPS_KEY.includes('demo')) {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_KEY}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'OK' && data.results?.[0]) {
          const first = data.results[0];
          return {
            displayName: first.address_components?.[0]?.long_name || first.formatted_address.split(',')[0],
            formattedAddress: first.formatted_address,
            latitude: lat,
            longitude: lng,
            placeId: first.place_id || `gps-${Date.now()}`,
            source: 'gps',
          };
        }
      }
    } catch (e) {
      console.warn('Reverse geocode REST error:', e);
    }
  }

  // Default fallback for current GPS location
  return {
    displayName: 'Current GPS Location',
    formattedAddress: 'Current GPS Location',
    latitude: lat,
    longitude: lng,
    placeId: `gps-${Date.now()}`,
    source: 'gps',
  };
}
