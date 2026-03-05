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
        <div className="relative w-full md:w-auto">
            <select
                value={currentRole}
                onChange={handleChange}
                disabled={isPending}
                className="inline-flex items-center pl-4 pr-10 py-2 border border-gray-200 bg-transparent text-xs font-medium rounded-lg text-[#19322F]/70 hover:border-[#19322F] hover:text-[#19322F] focus:outline-none focus:ring-2 focus:ring-[#006655] transition-colors w-full appearance-none cursor-pointer disabled:opacity-50 group-hover:bg-white group-hover:shadow-sm"
            >
                <option value="user">User Role</option>
                <option value="admin">Admin Role</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#19322F]/70">
                {isPending ? (
                    <div className="w-4 h-4 border-2 border-[#006655] border-t-transparent flex-shrink-0 animate-spin rounded-full" />
                ) : (
                    <span className="material-icons text-[16px]">expand_more</span>
                )}
            </div>
        </div>
    );
}
