"use client";

import { useState } from "react";
import { PropertyImage } from "../../lib/supabase";

interface Props {
    images: PropertyImage[];
    title: string;
    isFeatured?: boolean;
    isNew?: boolean;
}

export default function PropertyGallery({ images, title, isFeatured, isNew }: Props) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const heroImage = images[selectedIndex];

    return (
        <div className="space-y-4">
            {/* Hero image */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group">
                <img
                    alt={heroImage.alt || title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    src={heroImage.url}
                />
                <div className="absolute top-4 left-4 flex gap-2">
                    {isFeatured && (
                        <span className="bg-mosque text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            Premium
                        </span>
                    )}
                    {isNew && (
                        <span className="bg-white/90 backdrop-blur text-nordic-dark text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                            New
                        </span>
                    )}
                </div>
                <button className="absolute bottom-4 right-4 bg-white/90 hover:bg-white text-nordic-dark px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2">
                    <span className="material-icons text-sm">grid_view</span>
                    View All Photos
                </button>
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 snap-x">
                {images.map((img, index) => (
                    <button
                        key={img.id}
                        onClick={() => setSelectedIndex(index)}
                        className={`flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start transition-all ${index === selectedIndex
                                ? "ring-2 ring-mosque ring-offset-2 ring-offset-[#EEF6F6] opacity-100"
                                : "opacity-70 hover:opacity-100"
                            }`}
                    >
                        <img
                            alt={img.alt || `${title} - Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                            src={img.url}
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}
