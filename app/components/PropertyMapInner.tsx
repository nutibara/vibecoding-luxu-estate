"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue with webpack
const defaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Props {
    latitude: number;
    longitude: number;
    title: string;
    address: string;
}

export default function PropertyMapInner({ latitude, longitude, title, address }: Props) {
    return (
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100">
            <MapContainer
                center={[latitude, longitude]}
                zoom={14}
                scrollWheelZoom={false}
                className="w-full h-full z-0"
                style={{ height: "100%", width: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[latitude, longitude]} icon={defaultIcon}>
                    <Popup>
                        <div className="text-sm">
                            <strong>{title}</strong>
                            <br />
                            {address}
                        </div>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
}
