import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
    id: string;
    title: string;
    location: string;
    price: number;
    image: string;
    beds: number;
    baths: number;
    sqft: number;
    type: "sale" | "rent";
    is_new: boolean;
    is_featured?: boolean;
}

export interface Collection {
    id: string;
    title: string;
    location: string;
    price: number;
    image: string;
    beds: number;
    baths: number;
    sqft: number;
    tag: string;
}
