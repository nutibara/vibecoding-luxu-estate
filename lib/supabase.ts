import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Property {
    id: string;
    title: string;
    slug: string;
    location: string;
    price: number;
    image: string;
    beds: number;
    baths: number;
    sqft: number;
    type: "sale" | "rent";
    is_new: boolean;
    is_featured?: boolean;
    is_active?: boolean;
    description?: string;
    garage?: number;
    amenities?: string[];
    latitude?: number;
    longitude?: number;
    agent_name?: string;
    agent_image?: string;
}

export interface PropertyImage {
    id: string;
    property_id: string;
    url: string;
    alt: string;
    display_order: number;
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
