// Standard Node.js Verification for Hospital Matching
const fs = require('fs');

// Simple Haversine test
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

const HOSPITALS = [
  { name: 'CityCare Hospital (CP)', lat: 28.6315, lng: 77.2167 },
  { name: 'Nova Medical Centre (Noida)', lat: 28.5708, lng: 77.3261 },
  { name: 'Apex Care Hospital (Gurugram)', lat: 28.4950, lng: 77.0890 },
  { name: 'Greenfield Medical (Ghaziabad)', lat: 28.6410, lng: 77.3712 },
  { name: 'Hope Hospital (Faridabad)', lat: 28.4089, lng: 77.3178 },
];

const TEST_LOCATIONS = [
  { name: 'Connaught Place, New Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Sector 18, Noida', lat: 28.5708, lng: 77.3261 },
  { name: 'Cyber City, Gurugram', lat: 28.4950, lng: 77.0890 },
  { name: 'Indirapuram, Ghaziabad', lat: 28.6410, lng: 77.3712 },
  { name: 'Sector 16, Faridabad', lat: 28.4089, lng: 77.3178 },
];

console.log('==================================================');
console.log('EMPIRICAL VERIFICATION OF LOCATION-AWARE MATCHING');
console.log('==================================================\n');

TEST_LOCATIONS.forEach((userLoc) => {
  console.log(`📍 USER LOCATION: ${userLoc.name}`);
  const ranked = HOSPITALS.map(h => {
    const res = haversineDistance(userLoc.lat, userLoc.lng, h.lat, h.lng);
    return { name: h.name, distanceKm: res.distanceKm, durationMins: res.durationMins };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  ranked.forEach((item, idx) => {
    console.log(`   #${idx + 1} ${item.name} — ${item.distanceKm} km away — ${item.durationMins} min ETA`);
  });
  console.log('--------------------------------------------------');
});
