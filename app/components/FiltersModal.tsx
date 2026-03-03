"use client";

import { useState, useEffect } from "react";

export interface FilterState {
    minPrice: string;
    maxPrice: string;
    type: string;
    beds: string;
    baths: string;
    amenities: string[];
}

interface FiltersModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialFilters: FilterState;
    onApply: (filters: FilterState) => void;
}

const AMENITIES_LIST = [
    { id: "pool", label: "Swimming Pool", icon: "pool" },
    { id: "gym", label: "Gym", icon: "fitness_center" },
    { id: "parking", label: "Parking", icon: "local_parking" },
    { id: "ac", label: "Air Conditioning", icon: "ac_unit" },
    { id: "wifi", label: "High-speed Wifi", icon: "wifi" },
    { id: "patio", label: "Patio / Terrace", icon: "deck" },
];

export default function FiltersModal({ isOpen, onClose, initialFilters, onApply }: FiltersModalProps) {
    const [filters, setFilters] = useState<FilterState>(initialFilters);

    // Sync state when modal opens in case initialFilters changed
    useEffect(() => {
        if (isOpen) {
            setFilters(initialFilters);
        }
    }, [isOpen, initialFilters]);

    if (!isOpen) return null;

    const handleAmenityToggle = (amenity: string) => {
        setFilters((prev) => {
            const exists = prev.amenities.includes(amenity);
            return {
                ...prev,
                amenities: exists ? prev.amenities.filter((a) => a !== amenity) : [...prev.amenities, amenity],
            };
        });
    };

    const clearFilters = () => {
        setFilters({
            minPrice: "",
            maxPrice: "",
            type: "Any Type",
            beds: "",
            baths: "",
            amenities: [],
        });
    };

    const applyFilters = () => {
        onApply(filters);
        onClose();
    };

    // Beds/Baths handlers
    const updateCount = (key: "beds" | "baths", increment: boolean) => {
        setFilters((prev) => {
            const current = parseInt(prev[key] || "0", 10);
            let next = increment ? current + 1 : current - 1;
            if (next < 0) next = 0;
            return { ...prev, [key]: next === 0 ? "" : next.toString() };
        });
    };

    return (
        <>
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose}></div>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <main className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] pointer-events-auto">
                    {/* Header */}
                    <header className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Filters</h1>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500">
                            <span className="material-icons">close</span>
                        </button>
                    </header>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
                        {/* Section 2: Price Range */}
                        <section>
                            <div className="flex justify-between items-end mb-4">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Price Range</label>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                                    <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Min Price</label>
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mr-1">$</span>
                                        <input
                                            className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm focus:outline-none"
                                            type="number"
                                            placeholder="e.g. 500000"
                                            value={filters.minPrice}
                                            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="bg-background-light p-3 rounded-lg border border-transparent focus-within:border-mosque/30 transition-colors">
                                    <label className="block text-[10px] text-gray-500 uppercase font-medium mb-1">Max Price</label>
                                    <div className="flex items-center">
                                        <span className="text-gray-400 mr-1">$</span>
                                        <input
                                            className="w-full bg-transparent border-0 p-0 text-gray-900 font-medium focus:ring-0 text-sm focus:outline-none"
                                            type="number"
                                            placeholder="e.g. 2000000"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 3: Property Details */}
                        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Property Type */}
                            <div className="space-y-3">
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">Property Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-background-light border-0 rounded-lg py-3 pl-4 pr-10 text-gray-900 appearance-none focus:ring-2 focus:ring-mosque focus:outline-none cursor-pointer"
                                        value={filters.type}
                                        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                                    >
                                        <option value="Any Type">Any Type</option>
                                        <option value="House">House</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Villa">Villa</option>
                                        <option value="Penthouse">Penthouse</option>
                                    </select>
                                    <span className="material-icons absolute right-3 top-3 text-gray-400 pointer-events-none">expand_more</span>
                                </div>
                            </div>

                            {/* Rooms */}
                            <div className="space-y-4">
                                {/* Beds */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">Bedrooms</span>
                                    <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                                        <button
                                            onClick={() => updateCount("beds", false)}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque disabled:opacity-50 transition-colors"
                                        >
                                            <span className="material-icons text-base">remove</span>
                                        </button>
                                        <span className="text-sm font-semibold w-6 text-center">{filters.beds ? `${filters.beds}+` : "Any"}</span>
                                        <button
                                            onClick={() => updateCount("beds", true)}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                                        >
                                            <span className="material-icons text-base">add</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Baths */}
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-900">Bathrooms</span>
                                    <div className="flex items-center space-x-3 bg-background-light rounded-full p-1">
                                        <button
                                            onClick={() => updateCount("baths", false)}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-500 hover:text-mosque transition-colors"
                                        >
                                            <span className="material-icons text-base">remove</span>
                                        </button>
                                        <span className="text-sm font-semibold w-6 text-center">{filters.baths ? `${filters.baths}+` : "Any"}</span>
                                        <button
                                            onClick={() => updateCount("baths", true)}
                                            className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-mosque hover:bg-mosque hover:text-white transition-colors"
                                        >
                                            <span className="material-icons text-base">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Section 4: Amenities */}
                        <section>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Amenities &amp; Features</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {AMENITIES_LIST.map((amenity) => {
                                    const isActive = filters.amenities.includes(amenity.label);
                                    return (
                                        <label key={amenity.id} className="cursor-pointer group relative">
                                            <input
                                                className="peer sr-only"
                                                type="checkbox"
                                                checked={isActive}
                                                onChange={() => handleAmenityToggle(amenity.label)}
                                            />
                                            <div className={`h-full px-4 py-3 rounded-lg border text-sm flex items-center justify-center gap-2 transition-all ${isActive ? 'border-mosque bg-mosque/5 text-mosque font-medium' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
                                                <span className={`material-icons text-lg ${isActive ? 'text-mosque' : 'text-gray-400 group-hover:text-gray-500'}`}>{amenity.icon}</span>
                                                {amenity.label}
                                            </div>
                                            {isActive && <div className="absolute top-2 right-2 w-2 h-2 bg-mosque rounded-full opacity-100 transition-opacity"></div>}
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="bg-white border-t border-gray-100 px-8 py-6 sticky bottom-0 z-10 flex items-center justify-between">
                        <button
                            onClick={clearFilters}
                            className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors underline decoration-gray-300 underline-offset-4"
                        >
                            Clear all filters
                        </button>
                        <button
                            onClick={applyFilters}
                            className="bg-mosque hover:bg-mosque/90 text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-mosque/30 transition-all hover:shadow-mosque/40 flex items-center gap-2 transform active:scale-95"
                        >
                            Apply Filters
                            <span className="material-icons text-sm">arrow_forward</span>
                        </button>
                    </footer>
                </main>
            </div>
        </>
    );
}
