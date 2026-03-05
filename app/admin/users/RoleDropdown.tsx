'use client';

import { useTransition } from 'react';
import { updateUserRole } from './actions';

export default function RoleDropdown({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newRole = e.target.value;
        startTransition(() => {
            updateUserRole(userId, newRole);
        });
    };

    return (
        <div className="relative">
            <select
                value={currentRole}
                onChange={handleChange}
                disabled={isPending}
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <option value="user">User</option>
                <option value="admin">Admin</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                {isPending ? (
                    <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent flex-shrink-0 animate-spin rounded-full" />
                ) : (
                    <span className="material-symbols-outlined text-[18px]">expand_more</span>
                )}
            </div>
        </div>
    );
}
