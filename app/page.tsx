import Link from "next/link";
import { supabase, Property } from "../lib/supabase";
import Pagination from "./components/Pagination";
import FeaturedCollection from "./components/FeaturedCollection";

const PAGE_SIZE = 8;

interface HomeProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  // Fetch paginated properties + total count in parallel with featured collections
  const [propertiesResult, featuredResult] = await Promise.all([
    supabase
      .from("properties")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: true })
      .range(offset, offset + PAGE_SIZE - 1),
    supabase.from("properties").select("*").eq("is_featured", true).order("created_at", { ascending: true }),
  ]);

  const properties: Property[] = propertiesResult.data ?? [];
  const totalCount = propertiesResult.count ?? 0;
  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const featuredProperties: Property[] = featuredResult.data ?? [];

  const formatPrice = (price: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero / Search */}
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
            />
            <button className="absolute inset-y-2 right-2 px-6 bg-mosque hover:bg-mosque/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-mosque/20">
              Search
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-nordic-dark text-white text-sm font-medium shadow-lg shadow-nordic-dark/10 transition-transform hover:-translate-y-0.5">All</button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5">House</button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5">Apartment</button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5">Villa</button>
            <button className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-nordic-dark/5 text-nordic-muted hover:text-nordic-dark hover:border-mosque/50 text-sm font-medium transition-all hover:bg-mosque/5">Penthouse</button>
            <div className="w-px h-6 bg-nordic-dark/10 mx-2"></div>
            <button className="whitespace-nowrap flex items-center gap-1 px-4 py-2 rounded-full text-nordic-dark font-medium text-sm hover:bg-black/5 transition-colors">
              <span className="material-icons text-base">tune</span> Filters
            </button>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <FeaturedCollection properties={featuredProperties} />

      {/* New in Market — paginated */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light text-nordic-dark">New in Market</h2>
            <p className="text-nordic-muted mt-1 text-sm">
              Fresh opportunities added this week.{" "}
              <span className="text-mosque font-medium">{totalCount} properties</span>
            </p>
          </div>
          <div className="hidden md:flex bg-white p-1 rounded-lg">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">All</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors">Buy</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors">Rent</button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <Link key={property.id} href={`/properties/${property.slug}`} className="block h-full">
              <article className="bg-white rounded-xl overflow-hidden shadow-card hover:shadow-soft transition-all duration-300 group cursor-pointer h-full flex flex-col">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    alt={property.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    src={property.image}
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-mosque hover:text-white transition-colors text-nordic-dark">
                    <span className="material-icons text-lg">favorite_border</span>
                  </button>
                  <div className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${property.type === "rent" ? "bg-mosque/90" : "bg-nordic-dark/90"}`}>
                    FOR {property.type.toUpperCase()}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-lg text-nordic-dark">
                      {formatPrice(property.price)}
                      {property.type === "rent" && <span className="text-sm font-normal text-nordic-muted">/mo</span>}
                    </h3>
                  </div>
                  <h4 className="text-nordic-dark font-medium truncate mb-1">{property.title}</h4>
                  <p className="text-nordic-muted text-xs mb-4">{property.location}</p>
                  <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-nordic-muted text-xs">
                      <span className="material-icons text-sm text-mosque/80">king_bed</span> {property.beds}
                    </div>
                    <div className="flex items-center gap-1 text-nordic-muted text-xs">
                      <span className="material-icons text-sm text-mosque/80">bathtub</span> {property.baths}
                    </div>
                    <div className="flex items-center gap-1 text-nordic-muted text-xs">
                      <span className="material-icons text-sm text-mosque/80">square_foot</span> {property.sqft}m²
                    </div>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>

        {/* Server-side pagination */}
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      </section>
    </main>
  );
}