import Link from "next/link";
import { supabase, Property } from "../lib/supabase";
import Pagination from "./components/Pagination";
import FeaturedCollection from "./components/FeaturedCollection";
import HeroSearch from "./components/HeroSearch";
import { getTranslation } from "./i18n/server";

const PAGE_SIZE = 8;

interface HomeProps {
  searchParams: Promise<{
    page?: string;
    q?: string;
    minPrice?: string;
    maxPrice?: string;
    type?: string;
    beds?: string;
    baths?: string;
    amenities?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { t } = await getTranslation();
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  let query = supabase
    .from("properties")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,location.ilike.%${params.q}%`);
  }
  if (params.minPrice) query = query.gte("price", parseInt(params.minPrice, 10));
  if (params.maxPrice) query = query.lte("price", parseInt(params.maxPrice, 10));
  if (params.type && params.type !== "Any Type") {
    query = query.ilike("title", `%${params.type}%`);
  }
  if (params.beds) query = query.gte("beds", parseInt(params.beds, 10));
  if (params.baths) query = query.gte("baths", parseInt(params.baths, 10));
  if (params.amenities) {
    const amenitiesArr = params.amenities.split(",");
    query = query.contains("amenities", amenitiesArr);
  }

  const [propertiesResult, featuredResult] = await Promise.all([
    query,
    supabase.from("properties").select("*").eq("is_featured", true).order("created_at", { ascending: true }).limit(2),
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

  const initialFilters = {
    minPrice: params.minPrice || "",
    maxPrice: params.maxPrice || "",
    type: params.type || "Any Type",
    beds: params.beds || "",
    baths: params.baths || "",
    amenities: params.amenities ? params.amenities.split(",") : [],
  };

  const isFiltering = !!(params.q || params.minPrice || params.maxPrice || params.type || params.beds || params.baths || params.amenities);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      {/* Hero / Search */}
      <HeroSearch initialQ={params.q || ""} initialFilters={initialFilters} />

      {/* Featured Collections */}
      {!isFiltering && <FeaturedCollection properties={featuredProperties} t={t} />}

      {/* New in Market — paginated */}
      <section>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-light text-nordic-dark">
              {isFiltering ? t("listings.search_results_title") : t("listings.title")}
            </h2>
            <p className="text-nordic-muted mt-1 text-sm">
              {isFiltering
                ? t("listings.search_results_subtitle", { count: totalCount })
                : t("listings.subtitle")}
              {!isFiltering && (
                <span className="text-mosque font-medium"> {t("listings.properties_count", { count: totalCount })}</span>
              )}
            </p>
          </div>
          <div className="hidden md:flex bg-white p-1 rounded-lg">
            <button className="px-4 py-1.5 rounded-md text-sm font-medium bg-nordic-dark text-white shadow-sm">{t("listings.tab_all")}</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors">{t("listings.tab_buy")}</button>
            <button className="px-4 py-1.5 rounded-md text-sm font-medium text-nordic-muted hover:text-nordic-dark transition-colors">{t("listings.tab_rent")}</button>
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
                    {property.type === "rent" ? t("listings.for_rent") : t("listings.for_sale")}
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <div className="flex justify-between items-baseline mb-2">
                    <h3 className="font-bold text-lg text-nordic-dark">
                      {formatPrice(property.price)}
                      {property.type === "rent" && <span className="text-sm font-normal text-nordic-muted">{t("listings.per_month")}</span>}
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
        <Pagination currentPage={currentPage} totalPages={totalPages} t={t} />
      </section>
    </main>
  );
}