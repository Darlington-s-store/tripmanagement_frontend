import { useState, useEffect, useCallback } from "react";
import { Search, MapPin, Star, SlidersHorizontal, Loader, Calendar, Users, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { hotelsService, Hotel } from "@/services/hotels";
import { HotelCard } from "@/components/cards/HotelCard";
import { toast } from "sonner";
import { useDebounce } from "@/hooks/use-debounce";

const AMENITIES = ["WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Beach Access", "Parking", "AC"];
const REGIONS = ["Greater Accra", "Ashanti", "Central", "Western", "Northern", "Eastern", "Volta", "Bono", "Upper East", "Upper West"];

const Hotels = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [starRating, setStarRating] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(searchQuery, 500);

  const loadHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await hotelsService.searchHotels({
        location: debouncedSearch,
        region: region === "all" ? undefined : region,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        rating: starRating === "all" ? undefined : starRating,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
        sortBy: sortBy === "default" ? undefined : sortBy,
        limit: 100,
      });
      setHotels(data);
    } catch (error: unknown) {
      toast.error("Failed to load hotels");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearch, region, minPrice, maxPrice, starRating, selectedAmenities, sortBy]);

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setRegion("all");
    setStarRating("all");
    setMinPrice("");
    setMaxPrice("");
    setSelectedAmenities([]);
    setSortBy("default");
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 py-16 text-white overflow-hidden relative">
        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200')] bg-cover bg-center" />
        <div className="container relative">
          <Badge className="mb-4 bg-emerald-500/20 text-emerald-200 border-emerald-500/30">Luxury Accommodations</Badge>
          <h1 className="mb-4 font-display text-4xl font-extrabold md:text-6xl tracking-tight">Stay in the Heart of <br /><span className="text-emerald-400 font-cursive italic">Ghana</span></h1>
          <p className="mb-8 text-white/80 text-lg max-w-xl">From coastal resorts to urban luxury, find your sanctuary away from home with our curated hotel collection.</p>

          <div className="flex flex-col gap-3 rounded-2xl bg-white/10 backdrop-blur-md p-4 border border-white/20 shadow-2xl md:flex-row max-w-4xl">
            <div className="flex flex-[2] items-center gap-3 rounded-xl bg-white/10 px-4 py-2 border border-white/10 group focus-within:bg-white/20 transition-all">
              <Search className="h-5 w-5 text-emerald-400" />
              <Input
                placeholder="Where are you going?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-white placeholder:text-white/50 text-base"
              />
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-xl bg-white/10 px-4 py-2 border border-white/10 group focus-within:bg-white/20 transition-all">
              <MapPin className="h-5 w-5 text-emerald-400" />
              <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="border-0 bg-transparent shadow-none focus:ring-0 text-white p-0 h-auto">
                  <SelectValue placeholder="All Regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {REGIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button size="lg" className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-8 h-12">Search</Button>
          </div>
        </div>
      </section>

      <section className="py-12 bg-muted/30 min-h-screen">
        <div className="container">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside className="w-full lg:w-72 space-y-8 bg-white p-6 rounded-2xl shadow-sm border h-fit sticky top-24">
              <div className="flex items-center justify-between">
                <h3 className="font-bold flex items-center gap-2 tracking-tight text-lg"><Filter className="h-4 w-4 text-emerald-600" /> Filter Stays</h3>
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-emerald-600 font-medium">Clear All</button>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Price Range (GH₵)</label>
                <div className="flex items-center gap-3">
                  <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="rounded-xl border-muted bg-muted/30 focus-visible:ring-emerald-500" />
                  <span className="text-muted-foreground font-light">—</span>
                  <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="rounded-xl border-muted bg-muted/30 focus-visible:ring-emerald-500" />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rating</label>
                <Select value={starRating} onValueChange={setStarRating}>
                  <SelectTrigger className="rounded-xl border-muted bg-muted/30 focus:ring-emerald-500 shadow-none"><SelectValue placeholder="Select Rating" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Ratings</SelectItem>
                    <SelectItem value="4.5">4.5+ (Exceptional)</SelectItem>
                    <SelectItem value="4.0">4.0+ (Great)</SelectItem>
                    <SelectItem value="3.5">3.5+ (Good)</SelectItem>
                    <SelectItem value="3.0">3.0+ (Average)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Amenities</label>
                <div className="grid grid-cols-1 gap-2">
                  {AMENITIES.map(amenity => (
                    <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                      <div
                        className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedAmenities.includes(amenity) ? 'bg-emerald-500 border-emerald-500' : 'border-muted group-hover:border-emerald-300'}`}
                        onClick={(e) => { e.preventDefault(); toggleAmenity(amenity); }}
                      >
                        {selectedAmenities.includes(amenity) && <X className="h-3 w-3 text-white" />}
                      </div>
                      <span className={`text-sm ${selectedAmenities.includes(amenity) ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>
            </aside>

            {/* Content Area */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold tracking-tight">Available Hotels</h2>
                  <p className="text-sm text-muted-foreground">Found {hotels.length} places for your stay</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground hidden sm:inline">Sort By:</span>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] rounded-full bg-muted/50 border-0 focus:ring-emerald-500"><SelectValue placeholder="Sort Default" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Newest Added</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Top Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-[400px] rounded-2xl bg-muted animate-pulse border border-muted/50" />
                  ))}
                </div>
              ) : hotels.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-muted-foreground/30 bg-card py-32">
                  <div className="bg-muted p-6 rounded-full mb-6">
                    <Search className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-2xl font-bold">No stays found</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs text-center">We couldn't find any hotels matching your current filters. Try relaxing your criteria.</p>
                  <Button variant="outline" className="mt-8 rounded-full px-8" onClick={clearFilters}>Reset All Filters</Button>
                </div>
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  {hotels.map((hotel) => (
                    <HotelCard key={hotel.id} hotel={hotel} />
                  ))}
                </div>
              )}

              {!isLoading && hotels.length > 0 && (
                <div className="flex justify-center pt-8">
                  <Button variant="outline" className="rounded-full px-12 border-emerald-500/30 text-emerald-700 hover:bg-emerald-50">Show More Stays</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Hotels;

