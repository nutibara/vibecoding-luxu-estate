"use client";

import dynamic from "next/dynamic";

const PropertyMap = dynamic(() => import("./PropertyMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[400px] bg-nordic-dark/5 rounded-xl animate-pulse flex items-center justify-center">
            <span className="text-nordic-muted">Loading map...</span>
        </div>
    ),
});

interface PropertyMapWrapperProps {
    latitude: number;
    longitude: number;
    address: string;
}

export default function PropertyMapWrapper(props: PropertyMapWrapperProps) {
    return <PropertyMap {...props} />;
}
