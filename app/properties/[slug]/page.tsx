import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, MapPin, Bed, Bath, Square, Car, Check } from "lucide-react";
import { supabase, Property, PropertyImage } from "../../../lib/supabase";
import PropertyMapWrapper from "../../components/PropertyMapWrapper";

interface PropertyDetailsProps {
    params: Promise<{ slug: string }>;
}

export default async function PropertyDetails({ params }: PropertyDetailsProps) {
    const { slug } = await params;

    const [propertyResult, imagesResult] = await Promise.all([
        supabase.from("properties").select("*").eq("slug", slug).single(),
        supabase.from("property_images").select("*").eq("property_id", (
            await supabase.from("properties").select("id").eq("slug", slug).single()
        ).data?.id).order("display_order", { ascending: true }),
    ]);

    const property: Property | null = propertyResult.data;

    // if primary image is not in gallery, prepend it
    const galleryImages: PropertyImage[] = imagesResult.data || [];
    const imageUrls = [property?.image, ...galleryImages.map(img => img.url)].filter(Boolean) as string[];

    if (!property) {
        notFound();
    }

    const formatPrice = (price: number) =>
        new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(price);

    return (
        <main className="min-h-screen bg-nordic-light">
            {/* Navigation Bar */}
            <nav className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-nordic-dark/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-nordic-dark hover:text-mosque transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-medium text-sm">Back to properties</span>
                    </Link>
                    <Link href="/" className="text-xl font-bold tracking-tight text-nordic-dark">
                        LUXE<span className="font-light">ESTATE</span>
                    </Link>
                    <div className="w-24" /> {/* Spacer for centering logo */}
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">

                {/* Header Section */}
                <header className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl md:text-5xl font-light text-nordic-dark mb-2">
                                {property.title}
                            </h1>
                            <div className="flex items-center gap-2 text-nordic-muted">
                                <MapPin className="w-4 h-4 text-mosque" />
                                <p>{property.location}</p>
                            </div>
                        </div>
                        <div className="text-left md:text-right">
                            <p className="text-3xl md:text-4xl font-semibold text-mosque">
                                {formatPrice(property.price)}
                            </p>
                            <p className="text-sm text-nordic-muted uppercase tracking-wider font-semibold">
                                FOR {property.type}
                            </p>
                        </div>
                    </div>
                </header>

                {/* Image Gallery */}
                <section className="mb-16">
                    <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-4 h-[400px] md:h-[500px]">
                        {/* Main Hero Image */}
                        <div className={`relative overflow-hidden rounded-2xl ${imageUrls.length > 1 ? 'md:col-span-3 md:row-span-2' : 'md:col-span-4 md:row-span-2'}`}>
                            <img
                                src={property.image}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Side Gallery Images (if any) */}
                        {imageUrls.slice(1, 3).map((url, index) => (
                            <div key={index} className="hidden md:block relative overflow-hidden rounded-2xl h-full">
                                <img
                                    src={url}
                                    alt={`Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Additional Images Thumbnail Strip */}
                    {imageUrls.length > 3 && (
                        <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-nordic-dark/20 scrollbar-track-transparent">
                            {imageUrls.slice(3).map((url, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 w-36 h-24 md:w-48 md:h-32 relative overflow-hidden rounded-xl border-2 border-transparent hover:border-mosque transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <img
                                        src={url}
                                        alt={`Additional photo ${index + 1}`}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Details & Description */}
                    <div className="lg:col-span-2 space-y-12">

                        {/* Key Features Bar */}
                        <section className="flex flex-wrap items-center gap-8 py-6 border-y border-nordic-dark/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
                                    <Bed className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-nordic-muted uppercase tracking-wider">Bedrooms</p>
                                    <p className="font-semibold text-nordic-dark">{property.beds}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
                                    <Bath className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-nordic-muted uppercase tracking-wider">Bathrooms</p>
                                    <p className="font-semibold text-nordic-dark">{property.baths}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
                                    <Square className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs text-nordic-muted uppercase tracking-wider">Area</p>
                                    <p className="font-semibold text-nordic-dark">{property.sqft} sqft</p>
                                </div>
                            </div>

                            {property.garage !== undefined && property.garage > 0 && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-mosque/10 flex items-center justify-center text-mosque">
                                        <Car className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-nordic-muted uppercase tracking-wider">Garage</p>
                                        <p className="font-semibold text-nordic-dark">{property.garage}</p>
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Description */}
                        <section>
                            <h2 className="text-2xl font-light text-nordic-dark mb-4">About the Property</h2>
                            <div className="prose prose-lg text-nordic-muted leading-relaxed">
                                <p>{property.description || "No description available for this property."}</p>
                            </div>
                        </section>

                        {/* Amenities */}
                        {property.amenities && property.amenities.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-light text-nordic-dark mb-6">Amenities</h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-8">
                                    {property.amenities.map((amenity, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-nordic-dark">
                                            <div className="p-1 rounded bg-mosque/10 text-mosque">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <span className="font-medium text-sm">{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Location Map */}
                        <section>
                            <h2 className="text-2xl font-light text-nordic-dark mb-6">Location</h2>
                            {property.latitude && property.longitude ? (
                                <div className="shadow-lg shadow-nordic-dark/5 rounded-xl overflow-hidden">
                                    <PropertyMapWrapper
                                        latitude={property.latitude}
                                        longitude={property.longitude}
                                        address={property.location}
                                    />
                                </div>
                            ) : (
                                <div className="p-8 bg-nordic-dark/5 rounded-xl text-center text-nordic-muted">
                                    Map coordinates not available for this property.
                                </div>
                            )}
                        </section>

                    </div>

                    {/* Right Column: Agent Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 bg-white p-8 rounded-2xl shadow-card border border-nordic-dark/5">
                            <h3 className="text-lg font-medium text-nordic-dark mb-6">Contact Agent</h3>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 rounded-full overflow-hidden bg-nordic-dark/10">
                                    {property.agent_image ? (
                                        <img src={property.agent_image} alt={property.agent_name || "Agent"} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-mosque">
                                            <span className="material-icons text-3xl">person</span>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-semibold text-nordic-dark text-lg">{property.agent_name || "Luxe Estate Agent"}</p>
                                    <p className="text-sm text-mosque font-medium">Verified Agent</p>
                                </div>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg bg-nordic-light/50 border border-nordic-dark/10 focus:border-mosque focus:ring-1 focus:ring-mosque outline-none transition-all placeholder:text-nordic-muted/60" />
                                </div>
                                <div>
                                    <input type="email" placeholder="Email Address" className="w-full px-4 py-3 rounded-lg bg-nordic-light/50 border border-nordic-dark/10 focus:border-mosque focus:ring-1 focus:ring-mosque outline-none transition-all placeholder:text-nordic-muted/60" />
                                </div>
                                <div>
                                    <textarea rows={4} placeholder="I'm interested in this property..." className="w-full px-4 py-3 rounded-lg bg-nordic-light/50 border border-nordic-dark/10 focus:border-mosque focus:ring-1 focus:ring-mosque outline-none transition-all resize-none placeholder:text-nordic-muted/60"></textarea>
                                </div>
                                <button type="button" className="w-full py-4 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors shadow-lg shadow-mosque/20">
                                    Send Message
                                </button>
                                <button type="button" className="w-full py-4 bg-white border border-nordic-dark/10 hover:border-mosque text-nordic-dark font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                                    <span className="material-icons text-mosque text-[18px]">phone</span>
                                    Call Agent
                                </button>
                            </form>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
