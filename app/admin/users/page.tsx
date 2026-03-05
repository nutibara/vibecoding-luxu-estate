import { createClient } from '@/utils/supabase/server';
import RoleDropdown from './RoleDropdown';

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: users, error } = await supabase.rpc('get_admin_users');

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading users: {error.message}</div>;
    }

    return (
        <div className="w-full max-w-7xl mx-auto space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-[#19322F]">User Directory</h1>
                    <p className="text-[#19322F]/60 mt-1 text-sm">Manage user access and roles for your properties.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <div className="relative group w-full md:w-80">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="material-icons text-[#19322F]/40 group-focus-within:text-[#006655] text-xl">search</span>
                        </div>
                        <input className="block w-full pl-10 pr-3 py-2.5 border-none rounded-lg bg-white text-[#19322F] shadow-sm placeholder-[#19322F]/30 focus:ring-2 focus:ring-[#006655] focus:bg-white transition-all text-sm" placeholder="Search by name, email..." type="text" />
                    </div>
                    <button className="bg-[#006655] hover:bg-[#006655]/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-[#006655]/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 whitespace-nowrap">
                        <span className="material-icons text-base">add</span> Add User
                    </button>
                </div>
            </header>

            <div className="flex gap-6 border-b border-[#19322F]/10 overflow-x-auto">
                <button className="pb-3 text-sm font-semibold text-[#006655] border-b-2 border-[#006655]">All Users</button>
                <button className="pb-3 text-sm font-medium text-[#19322F]/60 hover:text-[#19322F] transition-colors">Agents</button>
                <button className="pb-3 text-sm font-medium text-[#19322F]/60 hover:text-[#19322F] transition-colors">Admins</button>
            </div>

            <main className="w-full pb-12 space-y-4">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-[#19322F]/50 mb-2">
                    <div className="col-span-4">User Details</div>
                    <div className="col-span-3">Role & Status</div>
                    <div className="col-span-3">Activity</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {users?.map((user: any) => {
                    const name = user.email.split('@')[0];
                    return (
                        <div key={user.id} className="group relative bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:bg-[#D9ECC8]/20 flex flex-col md:grid md:grid-cols-12 gap-4 items-center z-10 transition-all">
                            <div className="col-span-12 md:col-span-4 flex items-center w-full">
                                <div className="relative flex-shrink-0">
                                    <img alt={`Portrait of ${name}`} className="h-12 w-12 rounded-full object-cover border border-gray-200" src={`https://api.dicebear.com/7.x/initials/svg?seed=${name}&backgroundColor=006655&textColor=ffffff`} />
                                    {user.role === 'admin' ? (
                                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-white"></span>
                                    ) : (
                                        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-400 ring-2 ring-white"></span>
                                    )}
                                </div>
                                <div className="ml-4 overflow-hidden">
                                    <div className="text-sm font-bold text-[#19322F] truncate capitalize">{name.replace(/[^a-zA-Z0-9]/g, ' ')}</div>
                                    <div className="text-xs text-[#19322F]/60 truncate">{user.email}</div>
                                    <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-gray-50 rounded text-[#19322F]/50 group-hover:bg-white/50 transition-colors">ID: #{user.id.substring(0, 8)}</div>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${user.role === 'admin' ? 'bg-[#19322F] text-white' : 'bg-gray-100 text-gray-600'}`}>
                                    {user.role === 'admin' ? 'Administrator' : 'User'}
                                </span>
                                <div className="flex items-center text-xs text-[#19322F]/60">
                                    <span className={`material-icons text-[14px] mr-1 ${user.role === 'admin' ? 'text-[#006655]' : 'text-gray-400'}`}>
                                        {user.role === 'admin' ? 'check_circle' : 'schedule'}
                                    </span>
                                    {user.role === 'admin' ? 'Active' : 'Active'}
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-[#19322F]/40">Joined</div>
                                    <div className="text-sm font-semibold text-[#19322F]">
                                        {new Date(user.created_at).toLocaleDateString([], { month: 'short', year: 'numeric' })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-[#19322F]/40">Access Level</div>
                                    <div className="text-sm font-semibold text-[#19322F]">
                                        {user.role === 'admin' ? 'Level 5' : 'Level 1'}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 md:col-span-2 w-full flex justify-end relative">
                                <RoleDropdown userId={user.id} currentRole={user.role} />
                            </div>
                        </div>
                    );
                })}
                {(!users || users.length === 0) && (
                    <div className="p-8 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
                        No users found.
                    </div>
                )}
            </main>
        </div>
    );
}
