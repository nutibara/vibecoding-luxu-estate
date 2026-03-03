"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icon in leaflet with Next.js/Webpack
import L from "leaflet";

interface PropertyMapProps {
    latitude: number;
    longitude: number;
    address: string;
}

export default function PropertyMap({ latitude, longitude, address }: PropertyMapProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        // Fix Leaflet's default icon path issues in React
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });
    }, []);

    if (!isMounted) {
        return <div className="w-full h-[400px] bg-gray-100 rounded-xl animate-pulse flex items-center justify-center text-nordic-muted">Loading map...</div>;
    }

    return (
        <div className="w-full h-[400px] rounded-xl overflow-hidden z-0">
            <MapContainer
                center={[latitude, longitude]}
                zoom={14}
                scrollWheelZoom={false}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <Marker position={[latitude, longitude]}>
                    <Popup>
                        <div className="font-sans">
                            <p className="font-medium text-nordic-dark m-0">{address}</p>
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
