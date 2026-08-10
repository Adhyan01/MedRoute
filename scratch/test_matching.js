// Test script for location-aware hospital matching pipeline
const { matchHospitals } = require('../lib/matchingEngine');

const LOCATIONS = [
  { name: 'Connaught Place, New Delhi', latitude: 28.6315, longitude: 77.2167, source: 'MANUAL' },
  { name: 'Sector 18, Noida', latitude: 28.5708, longitude: 77.3261, source: 'MANUAL' },
  { name: 'Cyber City, Gurugram', latitude: 28.4950, longitude: 77.0890, source: 'MANUAL' },
  { name: 'Indirapuram, Ghaziabad', latitude: 28.6410, longitude: 77.3712, source: 'MANUAL' },
  { name: 'Sector 16, Faridabad', latitude: 28.4089, longitude: 77.3178, source: 'MANUAL' },
];

console.log('=== MEDROUTE LOCATION-AWARE MATCHING VERIFICATION ===\n');

LOCATIONS.forEach(loc => {
  console.log(`📍 TEST LOCATION: ${loc.name} (${loc.latitude}, ${loc.longitude})`);
  const ranked = matchHospitals('accident', loc);
  console.log('   TOP 3 RANKED HOSPITALS:');
  ranked.slice(0, 3).forEach((r, idx) => {
    console.log(`   #${idx + 1} ${r.hospital.name} — ${r.hospital.distanceKm} km away — ${r.hospital.etaMin} min ETA — Match Score: ${r.score}%`);
  });
  console.log('--------------------------------------------------');
});
