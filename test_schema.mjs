import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve('.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
    const { data, error } = await supabase.from('properties').select('*').limit(1);
    if (error) {
        console.error("Error fetching properties:", error);
    } else {
        console.log("Columns from 1 row:", Object.keys(data[0] || {}));
    }
}
checkSchema();
