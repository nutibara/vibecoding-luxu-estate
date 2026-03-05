import { createClient } from '@/utils/supabase/server';
import RoleDropdown from './RoleDropdown';

export default async function AdminUsersPage() {
    const supabase = await createClient();
    const { data: users, error } = await supabase.rpc('get_admin_users');

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading users: {error.message}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#19322F]">User Management</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 uppercase text-xs tracking-wider text-gray-500 font-semibold">
                                <th className="p-5">User ID</th>
                                <th className="p-5">Email</th>
                                <th className="p-5">Joined</th>
                                <th className="p-5">Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users?.map((user: any) => (
                                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-5 font-mono text-xs text-gray-500">{user.id}</td>
                                    <td className="p-5 font-medium text-[#19322F]">{user.email}</td>
                                    <td className="p-5 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString()}</td>
                                    <td className="p-5 w-48">
                                        <RoleDropdown userId={user.id} currentRole={user.role} />
                                    </td>
                                </tr>
                            ))}
                            {(!users || users.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
