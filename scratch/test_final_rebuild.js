// MEDROUTE Final Location System Rebuild Test Suite
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = Math.round(R * c * 10) / 10;
  const durationMins = Math.max(2, Math.round((distanceKm / 35) * 60));
  return { distanceKm, durationMins };
}

const DELHI_NCR_CENTER = { lat: 28.6139, lng: 77.2090 };
const MAX_DEMO_NETWORK_RADIUS_KM = 65;

function isLocationOutsideNetwork(loc) {
  const { distanceKm } = haversineDistance(loc.latitude, loc.longitude, DELHI_NCR_CENTER.lat, DELHI_NCR_CENTER.lng);
  return distanceKm > MAX_DEMO_NETWORK_RADIUS_KM;
}

const HOSPITALS = [
  { name: 'CityCare Hospital', lat: 28.6315, lng: 77.2167 },
  { name: 'Nova Medical Centre', lat: 28.5708, lng: 77.3261 },
  { name: 'Apex Care Hospital', lat: 28.4950, lng: 77.0890 },
  { name: 'Greenfield Medical Centre', lat: 28.6410, lng: 77.3712 },
  { name: 'Hope Hospital', lat: 28.4089, lng: 77.3178 },
];

const TEST_MATRIX = [
  { displayName: 'Connaught Place', formattedAddress: 'Connaught Place, New Delhi, India', latitude: 28.6315, longitude: 77.2167, source: 'manual' },
  { displayName: 'Noida', formattedAddress: 'Noida, Uttar Pradesh, India', latitude: 28.5708, longitude: 77.3261, source: 'manual' },
  { displayName: 'Gurugram', formattedAddress: 'Gurugram, Haryana, India', latitude: 28.4950, longitude: 77.0890, source: 'manual' },
  { displayName: 'Ghaziabad', formattedAddress: 'Ghaziabad, Uttar Pradesh, India', latitude: 28.6410, longitude: 77.3712, source: 'manual' },
  { displayName: 'Faridabad', formattedAddress: 'Faridabad, Haryana, India', latitude: 28.4089, longitude: 77.3178, source: 'manual' },
  { displayName: 'Mumbai', formattedAddress: 'Mumbai, Maharashtra, India', latitude: 19.0760, longitude: 72.8777, source: 'manual' },
];

console.log('===========================================================');
console.log('MEDROUTE LOCATION SYSTEM REBUILD — FINAL VERIFICATION MATRIX');
console.log('===========================================================\n');

TEST_MATRIX.forEach(loc => {
  console.log(`📍 TEST LOCATION: ${loc.displayName} (${loc.formattedAddress})`);
  const outside = isLocationOutsideNetwork(loc);

  if (outside) {
    console.log('   ⚠️ OUTSIDE DEMO NETWORK REGION! Status: MEDROUTE NETWORK NOT AVAILABLE HERE');
  } else {
    const ranked = HOSPITALS.map(h => {
      const res = haversineDistance(loc.latitude, loc.longitude, h.lat, h.lng);
      return { name: h.name, distanceKm: res.distanceKm, durationMins: res.durationMins };
    }).sort((a, b) => a.distanceKm - b.distanceKm);

    console.log('   RANKED HOSPITALS:');
    ranked.slice(0, 3).forEach((r, idx) => {
      console.log(`   #${idx + 1} ${r.name} — ${r.distanceKm} km away — ${r.durationMins} min ETA`);
    });
  }
  console.log('-----------------------------------------------------------');
});
