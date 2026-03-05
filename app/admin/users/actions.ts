'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateUserRole(userId: string, newRole: string) {
    const supabase = await createClient();
    const { error } = await supabase.rpc('set_user_role', {
        target_user_id: userId,
        new_role: newRole,
    });

    if (error) {
        console.error("Error setting role:", error);
        return { success: false, error: error.message };
    }

    revalidatePath('/admin/users');
    return { success: true };
}
