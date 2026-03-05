'use client';

import { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import dynamic from 'next/dynamic';

const PropertyMap = dynamic(() => import('./PropertyMap'), {
    ssr: false,
    loading: () => <div className="h-[300px] w-full bg-gray-100 animate-pulse rounded-md mt-4 flex items-center justify-center text-gray-400">Loading Map...</div>
});


type PropertyImage = {
    id: string;
    url: string;
    alt: string | null;
    display_order: number;
    file?: File; // For newly added images before upload
};

type PropertyFormData = {
    title: string;
    price: string;
    status: string; // 'sale' or 'rent'
    property_type: string;
    description: string;
    location: string;
    area: string;
    year_built: string;
    beds: number;
    baths: number;
    garage: number;
    amenities: string[];
    is_featured: boolean;
    is_new: boolean;
    latitude: string;
    longitude: string;
};

interface PropertyFormProps {
    initialData?: any;
    initialImages?: any[];
}

const AMENITIES_LIST = [
    'Swimming Pool',
    'Garden',
    'Air Conditioning',
    'Smart Home',
    'Balcony',
    'Gym',
    'Parking',
    'Security System'
];

export default function PropertyForm({ initialData, initialImages = [] }: PropertyFormProps) {
    const isEditMode = !!initialData;
    const router = useRouter();
    const supabase = createClient();

    // Convert existing amenities to checkable state
    const [formData, setFormData] = useState<PropertyFormData>({
        title: initialData?.title || '',
        price: initialData?.price?.toString() || '',
        status: initialData?.type || 'sale',
        property_type: initialData?.property_type || 'apartment',
        description: initialData?.description || '',
        location: initialData?.location || '',
        area: initialData?.sqft?.toString() || '',
        year_built: initialData?.year_built?.toString() || '',
        beds: initialData?.beds || 1,
        baths: initialData?.baths || 1,
        garage: initialData?.garage || 0,
        amenities: initialData?.amenities || [],
        is_featured: initialData?.is_featured || false,
        is_new: initialData?.is_new || false,
        latitude: initialData?.latitude?.toString() || '',
        longitude: initialData?.longitude?.toString() || '',
    });

    const [images, setImages] = useState<PropertyImage[]>(
        initialImages.map((img) => ({
            id: img.id,
            url: img.url,
            alt: img.alt,
            display_order: img.display_order,
        }))
    );

    const [isSaving, setIsSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleCheckboxChange = (amenity: string) => {
        setFormData((prev) => {
            if (prev.amenities.includes(amenity)) {
                return { ...prev, amenities: prev.amenities.filter((a) => a !== amenity) };
            } else {
                return { ...prev, amenities: [...prev.amenities, amenity] };
            }
        });
    };

    const handleNumberChange = (field: keyof PropertyFormData, operation: 'add' | 'sub') => {
        setFormData((prev) => {
            const currentVal = Number(prev[field]) || 0;
            const newVal = operation === 'add' ? currentVal + 1 : Math.max(0, currentVal - 1);
            return { ...prev, [field]: newVal };
        });
    };

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const newFiles = Array.from(e.target.files);
        const newImages: PropertyImage[] = newFiles.map((file, idx) => ({
            id: `temp-${Date.now()}-${idx}`,
            url: URL.createObjectURL(file), // Provide a local preview URL
            alt: file.name,
            display_order: images.length + idx,
            file: file,
        }));

        setImages((prev) => [...prev, ...newImages]);
    };

    const removeImage = (id: string) => {
        setImages((prev) => prev.filter((img) => img.id !== id));
    };

    const setMainImage = (id: string) => {
        setImages((prev) => {
            const copy = [...prev];
            const idx = copy.findIndex((i) => i.id === id);
            if (idx > -1) {
                const [item] = copy.splice(idx, 1);
                copy.unshift(item);
                // Update display orders
                return copy.map((img, i) => ({ ...img, display_order: i }));
            }
            return prev;
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setErrorMsg('');

        try {
            // Prepare slug
            const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

            const propertyPayload = {
                title: formData.title,
                location: formData.location,
                price: Number(formData.price),
                beds: formData.beds,
                baths: formData.baths,
                sqft: Number(formData.area),
                type: formData.status, // sale or rent
                property_type: formData.property_type,
                is_new: formData.is_new,
                is_featured: formData.is_featured,
                description: formData.description,
                garage: formData.garage,
                amenities: formData.amenities,
                year_built: formData.year_built ? Number(formData.year_built) : null,
                latitude: formData.latitude ? Number(formData.latitude) : null,
                longitude: formData.longitude ? Number(formData.longitude) : null,
                slug: isEditMode && initialData.slug ? initialData.slug : slug,
                image: initialData?.image || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa', // Temporary fallback
            };

            let propertyId = initialData?.id;

            if (isEditMode) {
                const { error } = await supabase
                    .from('properties')
                    .update(propertyPayload)
                    .eq('id', propertyId);
                if (error) throw error;
            } else {
                console.log("Inserting new property payload:", propertyPayload);
                const { data, error } = await supabase
                    .from('properties')
                    .insert([propertyPayload])
                    .select()
                    .single();
                if (error) {
                    console.error("Supabase Insert Error:", error);
                    throw error;
                }
                propertyId = data.id;
            }

            // Upload any new images
            let uploadedCount = 0;
            const savedImageUrls = [];

            for (let i = 0; i < images.length; i++) {
                const img = images[i];
                let publicUrl = img.url;

                if (img.file) {
                    // Upload to storage
                    const fileExt = img.file.name.split('.').pop();
                    const fileName = `${propertyId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                    const { error: uploadError } = await supabase.storage
                        .from('property_images')
                        .upload(fileName, img.file);

                    if (uploadError) throw uploadError;

                    // Get public URL
                    const { data: { publicUrl: url } } = supabase.storage
                        .from('property_images')
                        .getPublicUrl(fileName);

                    publicUrl = url;
                }

                savedImageUrls.push(publicUrl);

                // Insert into property_images if it's new, otherwise update order
                if (img.file) {
                    const { error: insertImgErr } = await supabase
                        .from('property_images')
                        .insert([{
                            property_id: propertyId,
                            url: publicUrl,
                            alt: img.alt,
                            display_order: i
                        }]);
                    if (insertImgErr) throw insertImgErr;
                } else if (!img.id.startsWith('temp-')) {
                    // It's an existing image, update order
                    await supabase
                        .from('property_images')
                        .update({ display_order: i })
                        .eq('id', img.id);
                }
            }

            // Remove deleted images that were originally from the server
            const existingImageIds = initialImages.map(i => i.id);
            const currentImageIds = images.filter(i => !i.id.startsWith('temp-')).map(i => i.id);
            const deletedImageIds = existingImageIds.filter(id => !currentImageIds.includes(id));

            if (deletedImageIds.length > 0) {
                await supabase
                    .from('property_images')
                    .delete()
                    .in('id', deletedImageIds);
            }

            // Update main property image to be the first one in the list
            if (savedImageUrls.length > 0) {
                await supabase
                    .from('properties')
                    .update({ image: savedImageUrls[0] })
                    .eq('id', propertyId);
            }

            router.push('/admin/properties');
            router.refresh();

        } catch (err: any) {
            console.error('Save error:', err);
            setErrorMsg(err.message || 'An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-[family-name:var(--font-sf-pro)] text-[#19322F]">
            <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
                <div className="space-y-4">
                    <nav aria-label="Breadcrumb" className="flex">
                        <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
                            <li><button onClick={() => router.push('/admin/properties')} className="hover:text-[#006655] transition-colors">Properties</button></li>
                            <li><span className="material-icons text-xs text-gray-400">chevron_right</span></li>
                            <li aria-current="page" className="text-[#19322F]">
                                {isEditMode ? 'Edit Property' : 'Add New'}
                            </li>
                        </ol>
                    </nav>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                            {isEditMode ? 'Edit Property' : 'Add New Property'}
                        </h1>
                        <p className="text-base text-gray-500 max-w-2xl font-normal">
                            Fill in the details below. Fields marked with * are mandatory.
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => router.back()}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="property-form"
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-lg bg-[#006655] hover:bg-[#19322F] text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm disabled:opacity-50"
                    >
                        <span className="material-icons text-sm">{isSaving ? 'hourglass_empty' : 'save'}</span>
                        {isSaving ? 'Saving...' : 'Save Property'}
                    </button>
                </div>
            </header>

            {errorMsg && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
                    {errorMsg}
                </div>
            )}

            <form id="property-form" className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start" onSubmit={handleSubmit}>
                <div className="xl:col-span-8 space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
                            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center text-[#19322F]">
                                <span className="material-icons text-lg">info</span>
                            </div>
                            <h2 className="text-xl font-bold">Basic Information</h2>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="group">
                                <label className="block text-sm font-medium mb-1.5" htmlFor="title">Property Title <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full text-base px-4 py-2.5 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all outline-none"
                                    id="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. Modern Penthouse with Ocean View"
                                    type="text"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" htmlFor="price">Price <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                                        <input
                                            className="w-full pl-7 pr-4 py-2.5 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base font-medium outline-none"
                                            id="price"
                                            required
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            placeholder="0.00"
                                            type="number"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" htmlFor="status">Listing Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer outline-none"
                                        id="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                    >
                                        <option value="sale">For Sale</option>
                                        <option value="rent">For Rent</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" htmlFor="property_type">Property Type</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base cursor-pointer outline-none"
                                        id="property_type"
                                        value={formData.property_type}
                                        onChange={handleInputChange}
                                    >
                                        <option value="apartment">Apartment</option>
                                        <option value="house">House</option>
                                        <option value="villa">Villa</option>
                                        <option value="commercial">Commercial</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]"
                                        checked={formData.is_new}
                                        onChange={(e) => setFormData(p => ({ ...p, is_new: e.target.checked }))}
                                    />
                                    <span className="text-sm font-medium">Mark as New Listing</span>
                                </label>
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]"
                                        checked={formData.is_featured}
                                        onChange={(e) => setFormData(p => ({ ...p, is_featured: e.target.checked }))}
                                    />
                                    <span className="text-sm font-medium">Featured Property</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
                            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center">
                                <span className="material-icons text-lg">description</span>
                            </div>
                            <h2 className="text-xl font-bold">Description</h2>
                        </div>
                        <div className="p-8">
                            <textarea
                                className="w-full px-4 py-3 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-base leading-relaxed resize-y min-h-[200px] outline-none"
                                id="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the property features, neighborhood, and unique selling points..."
                            ></textarea>
                            <div className="mt-2 text-right text-xs text-gray-400">
                                {formData.description.length} / 2000 characters
                            </div>
                        </div>
                    </div>

                    {/* Gallery */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-[#D9ECC8]/30 flex justify-between items-center bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center">
                                    <span className="material-icons text-lg">image</span>
                                </div>
                                <h2 className="text-xl font-bold">Gallery</h2>
                            </div>
                            <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">JPG, PNG, WEBP</span>
                        </div>
                        <div className="p-8">
                            <div className="relative border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50 p-10 text-center hover:bg-[#D9ECC8]/10 hover:border-[#006655]/40 transition-colors cursor-pointer group mb-6">
                                <input
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-[#006655] group-hover:scale-110 transition-transform duration-300">
                                        <span className="material-icons text-2xl">cloud_upload</span>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-base font-medium">Click or drag images here</p>
                                        <p className="text-xs text-gray-400">Max file size 5MB per image</p>
                                    </div>
                                </div>
                            </div>

                            {images.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {images.map((img, index) => (
                                        <div key={img.id} className="aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100">
                                            <img alt={img.alt || 'Property preview'} className="w-full h-full object-cover" src={img.url} />
                                            <div className="absolute inset-0 bg-[#19322F]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(img.id)}
                                                    className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors"
                                                >
                                                    <span className="material-icons text-sm">delete</span>
                                                </button>
                                                {index !== 0 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setMainImage(img.id)}
                                                        className="w-8 h-8 rounded-full bg-white text-[#19322F] hover:bg-gray-50 flex items-center justify-center transition-colors tooltip"
                                                        title="Set as Main Image"
                                                    >
                                                        <span className="material-icons text-sm">star</span>
                                                    </button>
                                                )}
                                            </div>
                                            {index === 0 && (
                                                <span className="absolute top-2 left-2 bg-[#006655] text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">Main</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="xl:col-span-4 space-y-8">
                    {/* Location */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
                            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center">
                                <span className="material-icons text-lg">place</span>
                            </div>
                            <h2 className="text-lg font-bold">Location</h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" htmlFor="location">Address</label>
                                <input
                                    className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm outline-none"
                                    id="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    placeholder="Street Address, City, Zip"
                                    type="text"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" htmlFor="latitude">Latitude</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm outline-none"
                                        id="latitude"
                                        value={formData.latitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. 40.7128"
                                        type="number"
                                        step="any"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" htmlFor="longitude">Longitude</label>
                                    <input
                                        className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white placeholder-gray-400 focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm outline-none"
                                        id="longitude"
                                        value={formData.longitude}
                                        onChange={handleInputChange}
                                        placeholder="e.g. -74.0060"
                                        type="number"
                                        step="any"
                                    />
                                </div>
                            </div>
                            {formData.latitude && formData.longitude && !isNaN(Number(formData.latitude)) && !isNaN(Number(formData.longitude)) && (
                                <PropertyMap lat={Number(formData.latitude)} lng={Number(formData.longitude)} />
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
                        <div className="px-6 py-4 border-b border-[#D9ECC8]/30 flex items-center gap-3 bg-gradient-to-r from-[#D9ECC8]/10 to-transparent">
                            <div className="w-8 h-8 rounded-full bg-[#D9ECC8] flex items-center justify-center">
                                <span className="material-icons text-lg">straighten</span>
                            </div>
                            <h2 className="text-lg font-bold">Details</h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="area">Area (sqft/m²)</label>
                                    <input
                                        className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm outline-none"
                                        id="area"
                                        value={formData.area}
                                        onChange={handleInputChange}
                                        placeholder="0"
                                        type="number"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 font-medium mb-1 block" htmlFor="year_built">Year Built</label>
                                    <input
                                        className="w-full text-left px-3 py-2 rounded border border-gray-200 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#006655] focus:border-[#006655] transition-all text-sm outline-none"
                                        id="year_built"
                                        value={formData.year_built}
                                        onChange={handleInputChange}
                                        placeholder="YYYY"
                                        type="number"
                                    />
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <span className="material-icons text-gray-400 text-sm">bed</span> Bedrooms
                                    </label>
                                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                                        <button type="button" onClick={() => handleNumberChange('beds', 'sub')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                                        <input className="w-10 text-center border-none bg-transparent p-0 focus:ring-0 text-sm font-medium" readOnly type="text" value={formData.beds} />
                                        <button type="button" onClick={() => handleNumberChange('beds', 'add')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <span className="material-icons text-gray-400 text-sm">shower</span> Bathrooms
                                    </label>
                                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                                        <button type="button" onClick={() => handleNumberChange('baths', 'sub')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                                        <input className="w-10 text-center border-none bg-transparent p-0 focus:ring-0 text-sm font-medium" readOnly type="text" value={formData.baths} />
                                        <button type="button" onClick={() => handleNumberChange('baths', 'add')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <span className="material-icons text-gray-400 text-sm">directions_car</span> Parking/Garage
                                    </label>
                                    <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
                                        <button type="button" onClick={() => handleNumberChange('garage', 'sub')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100">-</button>
                                        <input className="w-10 text-center border-none bg-transparent p-0 focus:ring-0 text-sm font-medium" readOnly type="text" value={formData.garage} />
                                        <button type="button" onClick={() => handleNumberChange('garage', 'add')} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100">+</button>
                                    </div>
                                </div>
                            </div>

                            <hr className="border-gray-100" />

                            <div>
                                <h3 className="text-sm font-bold mb-3 uppercase tracking-wider text-xs text-gray-500">Amenities</h3>
                                <div className="space-y-2">
                                    {AMENITIES_LIST.map((amenity) => (
                                        <label key={amenity} className="flex items-center gap-2.5 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-[#006655] border-gray-300 rounded focus:ring-[#006655]"
                                                checked={formData.amenities.includes(amenity)}
                                                onChange={() => handleCheckboxChange(amenity)}
                                            />
                                            <span className="text-sm text-gray-700 group-hover:text-[#19322F] transition-colors">{amenity}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Sticky Save Button */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 rounded-lg border border-gray-300 bg-white font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="flex-1 py-3 rounded-lg bg-[#006655] text-white font-medium flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </main>
    );
}
