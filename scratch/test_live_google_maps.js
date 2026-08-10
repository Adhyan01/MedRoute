const KEY = 'AIzaSyABIXMSGq3p-mYNTn_nrvWtDtdHuDdxlhs';

async function testLiveGeocode(place) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log(`📍 Testing Geocode for: "${place}"`);
    console.log(`   Status: ${data.status}`);
    if (data.status === 'OK' && data.results?.[0]) {
      const first = data.results[0];
      console.log(`   Formatted Address: ${first.formatted_address}`);
      console.log(`   Coordinates: Lat ${first.geometry.location.lat}, Lng ${first.geometry.location.lng}`);
    } else if (data.error_message) {
      console.log(`   Error Message: ${data.error_message}`);
    }
  } catch (err) {
    console.error(`   Fetch Failed: ${err.message}`);
  }
  console.log('--------------------------------------------------');
}

async function run() {
  console.log('=== TESTING LIVE GOOGLE MAPS API KEY ===\n');
  await testLiveGeocode('Noida, Uttar Pradesh');
  await testLiveGeocode('Gurugram, Haryana');
  await testLiveGeocode('Connaught Place, New Delhi');
  await testLiveGeocode('Mumbai, Maharashtra');
}

run();
