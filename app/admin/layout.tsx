import Link from 'next/link';
import { ReactNode } from 'react';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex min-h-[calc(100vh-80px)] pt-[80px] bg-[#EEF6F6]">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col gap-4 sticky top-[80px] h-[calc(100vh-80px)]">
                <h2 className="text-xl font-bold text-[#19322F] mb-4">Admin Panel</h2>
                <Link href="/admin/properties" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">real_estate_agent</span>
                    Properties
                </Link>
                <Link href="/admin/users" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors flex items-center gap-2">
                    <span className="material-symbols-outlined text-xl">group</span>
                    Users
                </Link>
            </aside>
            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
