"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FiltersModal, { FilterState } from "./FiltersModal";

interface HeroSearchProps {
    initialQ: string;
    initialFilters: FilterState;
}

const PROPERTY_TYPES = ["All", "House", "Apartment", "Villa", "Penthouse"];

export default function HeroSearch({ initialQ, initialFilters }: HeroSearchProps) {
    const router = useRouter();
    const [q, setQ] = useState(initialQ);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeType, setActiveType] = useState(() => {
        if (!initialFilters.type || initialFilters.type === "Any Type") return "All";
        return initialFilters.type;
    });

    const handleSearch = () => {
        applyFiltersToUrl(q, { ...initialFilters, type: activeType === "All" ? "Any Type" : activeType });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const applyFiltersToUrl = (searchQuery: string, filters: FilterState) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (filters.minPrice) params.set("minPrice", filters.minPrice);
        if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
        if (filters.type && filters.type !== "Any Type") params.set("type", filters.type);
        if (filters.beds) params.set("beds", filters.beds);
        if (filters.baths) params.set("baths", filters.baths);
        if (filters.amenities.length > 0) params.set("amenities", filters.amenities.join(","));

        // Reset pagination to page 1 on search
        router.push(`/?${params.toString()}`);
    };

    const handleModalApply = (filters: FilterState) => {
        if (filters.type === "Any Type") {
            setActiveType("All");
        } else {
            setActiveType(filters.type);
        }
        applyFiltersToUrl(q, filters);
    };

    const handleTypeClick = (type: string) => {
        setActiveType(type);
        applyFiltersToUrl(q, { ...initialFilters, type: type === "All" ? "Any Type" : type });
    };

    return (
        <section className="py-12 md:py-16">
            <div className="max-w-3xl mx-auto text-center space-y-8">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-nordic-dark leading-tight">
                    Find your{" "}
                    <span className="relative inline-block">
                        <span className="relative z-10 font-medium">sanctuary</span>
                        <span className="absolute bottom-2 left-0 w-full h-3 bg-mosque/20 -rotate-1 z-0"></span>
                    </span>
                    .
                </h1>
                <div className="relative group max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="material-icons text-nordic-muted text-2xl group-focus-within:text-mosque transition-colors">search</span>
                    </div>
                    <input
                        className="block w-full pl-12 pr-4 py-4 rounded-xl border-none bg-white text-nordic-dark shadow-soft placeholder-nordic-muted/60 focus:ring-2 focus:ring-mosque focus:bg-white transition-all text-lg focus:outline-none"
                        placeholder="Search by city, neighborhood, or address..."
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20"
                        onClick={handleSearch}
                    >
                        Search
                    </button>
                </div>

                <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
                    {PROPERTY_TYPES.map((type) => {
                        const isActive = activeType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => handleTypeClick(type)}
                                className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${isActive
                                        ? "bg-nordic-dark text-white shadow-lg shadow-nordic-dark/10 hover:-translate-y-0.5"
                                        : "bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 hover:bg-mosque/5"
                                    }`}
                            >
                                {type}
                            </button>
                        );
                    })}

                    <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>

                    <button
                        className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <span className="material-icons text-base">tune</span> Filters
                    </button>
                </div>
            </div>

            <FiltersModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialFilters={initialFilters}
                onApply={handleModalApply}
            />
        </section>
    );
}
