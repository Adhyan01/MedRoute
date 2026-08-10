import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { HOSPITALS } from '@/lib/hospitals';

export async function GET() {
  try {
    // 1. Seed Hospitals
    for (const hosp of HOSPITALS) {
      const { data: existing } = await supabaseAdmin
        .from('hospitals')
        .select('id')
        .eq('name', hosp.name)
        .single();

      let hospitalId = existing?.id;

      if (!hospitalId) {
        const { data: inserted, error } = await supabaseAdmin
          .from('hospitals')
          .insert({
            name: hosp.name,
            address: hosp.address,
            latitude: hosp.lat,
            longitude: hosp.lng,
            phone: '+91-11-2345-6789',
            emergency_status: hosp.status.toUpperCase(),
            emergency_load: hosp.emergencyLoad,
            reliability_score: hosp.reliabilityScore,
            last_verified_at: new Date(Date.now() - hosp.lastSyncSeconds * 1000).toISOString(),
          })
          .select('id')
          .single();

        if (error) console.error(`Error inserting ${hosp.name}:`, error);
        hospitalId = inserted?.id;
      }

      if (hospitalId) {
        // Seed Beds
        for (const bed of hosp.icu.beds) {
          await supabaseAdmin.from('beds').upsert(
            {
              hospital_id: hospitalId,
              bed_number: bed.id,
              bed_type: 'ICU',
              department: 'Intensive Care Unit',
              status: bed.status.toUpperCase(),
              reserved_for: null,
            },
            { onConflict: 'hospital_id,bed_number' }
          );
        }

        // Seed Resources
        const resourcesList = [
          { resource_type: 'VENTILATOR', total_count: hosp.ventilators.total, available_count: hosp.ventilators.available },
          { resource_type: 'CT', total_count: 2, available_count: hosp.ct ? 2 : 0, status: hosp.ct ? 'AVAILABLE' : 'UNAVAILABLE' },
          { resource_type: 'MRI', total_count: 1, available_count: hosp.mri ? 1 : 0, status: hosp.mri ? 'AVAILABLE' : 'UNAVAILABLE' },
          { resource_type: 'BLOOD_BANK', total_count: 50, available_count: hosp.bloodBank ? 50 : 0, status: hosp.bloodBank ? 'AVAILABLE' : 'UNAVAILABLE' },
          { resource_type: 'OPERATING_THEATRE', total_count: hosp.operatingTheatres.total, available_count: hosp.operatingTheatres.available },
        ];

        for (const res of resourcesList) {
          await supabaseAdmin.from('resources').insert({
            hospital_id: hospitalId,
            ...res,
          });
        }

        // Seed Specialists
        for (const spec of hosp.specialists) {
          const specUpper = spec.role.toUpperCase().replace(/\s+/g, '_');
          await supabaseAdmin.from('specialists').insert({
            hospital_id: hospitalId,
            specialization: specUpper,
            status: spec.availability.toUpperCase().replace(/\s+/g, '_'),
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Database seeded successfully with 10 fictional hospitals' });
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 });
  }
}
