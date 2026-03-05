import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    const propertyPayload = {
      title: 'Test',
      location: 'Test',
      price: 100,
      beds: 1,
      baths: 1,
      sqft: 100,
      type: 'sale',
      property_type: 'apartment',
      is_new: false,
      is_featured: false,
      description: 'Test',
      garage: 0,
      amenities: [],
      year_built: 2020,
      latitude: 0,
      longitude: 0,
      slug: 'test-property-1',
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'
    };

    console.log("Inserting payload...");
    const { data, error } = await supabase.from('properties').insert([propertyPayload]).select().single();
    if (error) {
        console.error("Error inserting:", error);
    } else {
        console.log("Inserted successfully:", data);
        // Clean up
        await supabase.from('properties').delete().eq('id', data.id);
    }
}

test();
