import { createClient } from '@/utils/supabase/server';
import PropertyForm from '@/app/components/admin/PropertyForm';
import { notFound } from 'next/navigation';

export default async function EditPropertyPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const { id } = params;
    const supabase = await createClient();

    // Fetch the property
    const { data: property, error: propError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();

    if (propError || !property) {
        notFound();
    }

    // Fetch related images
    const { data: images } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('display_order', { ascending: true });

    return <PropertyForm initialData={property} initialImages={images || []} />;
}
