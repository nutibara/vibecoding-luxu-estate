'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function togglePropertyActive(id: string, isActive: boolean) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('properties')
        .update({ is_active: isActive })
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath('/admin/properties');
    revalidatePath('/');
}
