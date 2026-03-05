import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function AdminPropertiesPage(props: {
    searchParams: Promise<{ page?: string }>;
}) {
    const searchParams = await props.searchParams;
    const supabase = await createClient();
    const page = parseInt(searchParams?.page || '1');
    const limit = 10;
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    // Get total count
    const { count, error: countError } = await supabase
        .from('properties')
        .select('*', { count: 'exact', head: true });

    // Fetch paginated data
    const { data: properties, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .range(start, end);

    const totalCount = count || 0;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (error || countError) {
        return <div className="p-4 bg-red-50 text-red-600 rounded-lg">Error loading properties: {error?.message || countError?.message}</div>;
    }

    return (
        <div className="flex-grow max-w-7xl w-full mx-auto pb-10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#19322F] tracking-tight">My Properties</h1>
                    <p className="text-gray-500 mt-1 text-sm">Manage your portfolio and track performance.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-gray-200 text-[#19322F] hover:bg-gray-50 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2">
                        <span className="material-icons text-base">filter_list</span> Filter
                    </button>
                    <button className="bg-[#006655] hover:bg-[#006655]/90 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-[#006655]/20 transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2 whitespace-nowrap">
                        <span className="material-icons text-base">add</span> Add New Property
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Listings</p>
                        <p className="text-2xl font-bold text-[#19322F] mt-1">{totalCount}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[#006655]/10 flex items-center justify-center text-[#006655]">
                        <span className="material-icons">apartment</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Properties</p>
                        <p className="text-2xl font-bold text-[#19322F] mt-1">{totalCount}</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#006655]">
                        <span className="material-icons">check_circle</span>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-xl border border-[#006655]/10 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">Pending Sale</p>
                        <p className="text-2xl font-bold text-[#19322F] mt-1">0</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <span className="material-icons">pending</span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-6">Property Details</div>
                    <div className="col-span-2">Price</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {properties?.map(prop => (
                    <div key={prop.id} className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 hover:bg-[#EEF6F6] transition-colors items-center">
                        <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                            <div className="relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                                <img alt={prop.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={prop.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa'} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#19322F] group-hover:text-[#006655] transition-colors cursor-pointer">{prop.title}</h3>
                                <p className="text-sm text-gray-500">{prop.location}</p>
                                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                                    <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bed</span> {prop.beds} Beds</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span className="flex items-center gap-1"><span className="material-icons text-[14px]">bathtub</span> {prop.baths} Baths</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <span>{prop.sqft || 'N/A'} sqft</span>
                                </div>
                            </div>
                        </div>

                        <div className="col-span-6 md:col-span-2">
                            <div className="text-base font-semibold text-[#19322F]">${prop.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-400 uppercase">{prop.type}</div>
                        </div>

                        <div className="col-span-6 md:col-span-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-[#D9ECC8] text-[#006655] border border-[#006655]/10">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#006655] mr-1.5"></span>
                                Active
                            </span>
                        </div>

                        <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                            <button className="p-2 rounded-lg text-gray-400 hover:text-[#006655] hover:bg-[#D9ECC8]/30 transition-all tooltip-trigger" title="Edit Property">
                                <span className="material-icons text-xl">edit</span>
                            </button>
                            <button className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all tooltip-trigger" title="Delete Property">
                                <span className="material-icons text-xl">delete_outline</span>
                            </button>
                        </div>
                    </div>
                ))}

                {(!properties || properties.length === 0) && (
                    <div className="p-8 text-center text-gray-500">
                        No properties found.
                    </div>
                )}

                <div className="px-6 py-4 flex items-center justify-between bg-gray-50/50">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium text-[#19322F]">{totalCount === 0 ? 0 : start + 1}</span> to <span className="font-medium text-[#19322F]">{Math.min(end + 1, totalCount)}</span> of <span className="font-medium text-[#19322F]">{totalCount}</span> results
                    </div>
                    <div className="flex gap-2">
                        {hasPrevPage ? (
                            <Link href={`/admin/properties?page=${page - 1}`} className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:border-gray-300">Previous</Link>
                        ) : (
                            <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 opacity-50 cursor-not-allowed" disabled>Previous</button>
                        )}
                        {hasNextPage ? (
                            <Link href={`/admin/properties?page=${page + 1}`} className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white hover:border-gray-300">Next</Link>
                        ) : (
                            <button className="px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 opacity-50 cursor-not-allowed" disabled>Next</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
