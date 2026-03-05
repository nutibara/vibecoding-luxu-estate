import { createClient } from '@/utils/supabase/server';

export default async function AdminPropertiesPage() {
    const supabase = await createClient();
    const { data: properties, error } = await supabase.from('properties').select('*').order('created_at', { ascending: false });

    if (error) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading properties: {error.message}</div>;
    }

    return (
        <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#19322F]">Properties Overview</h1>
                <button className="bg-[#19322F] text-white px-5 py-2.5 rounded-lg hover:bg-[#2c534f] transition-colors font-medium cursor-not-allowed opacity-50">
                    Add Property
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-50/80 border-b border-gray-100 uppercase text-xs tracking-wider text-gray-500 font-semibold">
                                <th className="p-5">Property</th>
                                <th className="p-5">Location</th>
                                <th className="p-5">Price</th>
                                <th className="p-5">Type</th>
                                <th className="p-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {properties?.map(prop => (
                                <tr key={prop.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors group">
                                    <td className="p-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 relative rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                <img src={prop.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} alt={prop.title} className="object-cover w-full h-full" />
                                            </div>
                                            <div>
                                                <div className="font-semibold text-[#19322F] text-sm mb-0.5">{prop.title}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">bed</span> {prop.beds}
                                                    <span className="material-symbols-outlined text-[14px] ml-1">bathtub</span> {prop.baths}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-5 text-sm font-medium text-gray-600">{prop.location}</td>
                                    <td className="p-5 text-sm font-semibold text-[#19322F]">${prop.price.toLocaleString()}</td>
                                    <td className="p-5">
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${prop.type === 'sale' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {prop.type}
                                        </span>
                                    </td>
                                    <td className="p-5 text-right">
                                        <button className="text-gray-400 hover:text-emerald-600 font-medium transition-colors p-2 rounded-full hover:bg-emerald-50">
                                            <span className="material-symbols-outlined text-xl block">edit</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!properties || properties.length === 0) && (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No properties found.
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
