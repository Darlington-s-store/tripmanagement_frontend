import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Search, MapPin, Camera, TreePine, Waves, Landmark, Music, Star, Clock, DollarSign, ArrowRight, Loader } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import { destinationsService, Destination } from "@/services/destinations";
import { toast } from "sonner";

const categories = [
    { id: "all", label: "All", icon: MapPin },
    { id: "cultural", label: "Cultural Sites", icon: Landmark },
    { id: "nature", label: "Nature Parks", icon: TreePine },
    { id: "beach", label: "Beaches", icon: Waves },
    { id: "historical", label: "Historical", icon: Camera },
    { id: "festival", label: "Festivals", icon: Music },
];

const regions = ["All Regions", "Greater Accra", "Ashanti", "Central", "Western", "Eastern", "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo"];

const categoryColors: Record<string, string> = {
    historical: "bg-amber-100 text-amber-800",
    nature: "bg-green-100 text-green-800",
    beach: "bg-blue-100 text-blue-800",
    cultural: "bg-purple-100 text-purple-800",
    festival: "bg-rose-100 text-rose-800",
};

export default function Destinations() {
    const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("All Regions");
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchDestinations();
    }, [selectedCategory, selectedRegion]);

    const fetchDestinations = async () => {
        try {
            setIsLoading(true);
            const data = await destinationsService.getDestinations({
                category: selectedCategory === "all" ? undefined : selectedCategory,
                region: selectedRegion === "All Regions" ? undefined : selectedRegion
            });
            setDestinations(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load destinations. Displaying offline data.");
        } finally {
            setIsLoading(false);
        }
    };

    const filtered = destinations.filter((d) => 
        d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <Layout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 py-20 text-white">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="relative mx-auto max-w-6xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
                        <MapPin className="h-4 w-4" />
                        Explore Ghana's Beauty
                    </div>
                    <h1 className="font-display text-5xl font-bold md:text-6xl mb-4">Discover Ghana's Wonders</h1>
                    <p className="mx-auto max-w-2xl text-xl text-white/80 mb-8">
                        From ancient castles to pristine beaches, find your next extraordinary adventure
                    </p>
                    <div className="mx-auto max-w-lg relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search destinations..."
                            className="pl-12 h-14 text-base rounded-2xl bg-white text-foreground outline-none border-none ring-0 shadow-lg"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-10">
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-8">
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-all border ${selectedCategory === cat.id
                                            ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-primary/50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {regions.map((region) => (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all border ${selectedRegion === region
                                        ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                        : "bg-white border-slate-200 text-slate-500 hover:border-emerald-400"
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-20 flex flex-col items-center gap-4 text-muted-foreground">
                        <Loader className="h-10 w-10 animate-spin text-primary" />
                        <p>Discovering amazing places...</p>
                    </div>
                ) : (
                    <>
                        <p className="text-sm font-medium text-slate-500 mb-6">{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</p>

                        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                            {filtered.map((dest) => (
                                <div key={dest.id} className="group overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 ease-out flex flex-col">
                                    <div className="relative overflow-hidden h-64">
                                        <img
                                            src={dest.image_url}
                                            alt={dest.name}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                                        
                                        <div className="absolute top-4 left-4">
                                            <Badge className={`rounded-xl px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${categoryColors[dest.category] || "bg-white/90 text-slate-800 shadow-sm border-none backdrop-blur-sm"} border-none`}>
                                                {dest.category}
                                            </Badge>
                                        </div>
                                        
                                        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
                                            <div className="flex items-center gap-1.5">
                                                <div className="h-6 w-6 rounded-lg bg-white/20 backdrop-blur-md flex items-center justify-center">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-xs font-bold tracking-tight">{dest.region}</span>
                                            </div>
                                            <div className="flex items-center gap-1 bg-white/90 text-primary px-2 py-1 rounded-lg shadow-sm">
                                                <Star className="h-3 w-3 fill-primary" />
                                                <span className="text-[11px] font-bold">{dest.rating || "New"}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h3 className="font-display text-xl font-extrabold mb-2 text-slate-800 group-hover:text-primary transition-colors leading-tight">
                                            {dest.name}
                                        </h3>
                                        <p className="text-sm text-slate-500 line-clamp-2 mb-6 leading-relaxed flex-1">
                                            {dest.description}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 mt-auto">
                                            <Button
                                                asChild
                                                variant="ghost"
                                                className="text-primary font-bold text-xs gap-1 group/link p-0 hover:bg-transparent"
                                            >
                                                <Link to={`/destinations/${dest.id}`}>
                                                    View Details 
                                                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/link:translate-x-1" />
                                                </Link>
                                            </Button>
                                            
                                            <Button
                                                size="sm"
                                                className="rounded-xl h-9 px-4 text-[11px] font-bold bg-slate-900 border-none hover:bg-primary transition-all shadow-md group-hover:shadow-primary/20"
                                                onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(dest.name)}`)}
                                            >
                                                Book Now
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filtered.length === 0 && (
                            <div className="py-24 text-center rounded-[3rem] bg-slate-50 border-2 border-dashed border-slate-200">
                                <div className="h-20 w-20 rounded-[2rem] bg-slate-100 flex items-center justify-center mx-auto mb-6 text-slate-300">
                                    <MapPin className="h-10 w-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Hidden Gems Only?</h3>
                                <p className="text-slate-500 max-w-xs mx-auto">We couldn't find any destinations matching your search. Try broadening your criteria!</p>
                                <Button 
                                    variant="link" 
                                    className="mt-4 text-primary font-bold"
                                    onClick={() => { setSearch(""); setSelectedCategory("all"); setSelectedRegion("All Regions"); }}
                                >
                                    Clear all filters
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Layout>
    );
}
