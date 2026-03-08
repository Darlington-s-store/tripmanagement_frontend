import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Camera, TreePine, Waves, Landmark, Music, Star, Clock, DollarSign, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const categories = [
    { id: "all", label: "All", icon: MapPin },
    { id: "cultural", label: "Cultural Sites", icon: Landmark },
    { id: "nature", label: "Nature Parks", icon: TreePine },
    { id: "beach", label: "Beaches", icon: Waves },
    { id: "historical", label: "Historical", icon: Camera },
    { id: "festival", label: "Festivals", icon: Music },
];

const regions = ["All Regions", "Greater Accra", "Ashanti", "Central", "Western", "Eastern", "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo"];

const destinations = [
    {
        id: 1, name: "Cape Coast Castle", region: "Central", category: "historical",
        description: "A UNESCO World Heritage Site and powerful monument to the transatlantic slave trade. An unmissable piece of Ghana's history.",
        image: "https://images.unsplash.com/photo-1611348586804-61bf6c080437?w=600&q=80",
        entranceFee: "GH₵ 50", openingHours: "8am - 5pm", rating: 4.9, reviews: 1204,
        tags: ["UNESCO", "History", "Guided Tours"],
    },
    {
        id: 2, name: "Kakum National Park", region: "Central", category: "nature",
        description: "Famous for its canopy walkway suspended 30m above the forest floor, offering a thrilling walk through the rainforest canopy.",
        image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?w=600&q=80",
        entranceFee: "GH₵ 80", openingHours: "7am - 6pm", rating: 4.7, reviews: 876,
        tags: ["Canopy Walk", "Wildlife", "Nature"],
    },
    {
        id: 3, name: "Labadi Beach", region: "Greater Accra", category: "beach",
        description: "Accra's most famous beach destination, perfect for swimming, relaxing and experiencing vibrant Ghanaian beach culture on weekends.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80",
        entranceFee: "GH₵ 10", openingHours: "All Day", rating: 4.3, reviews: 2341,
        tags: ["Swimming", "Food", "Entertainment"],
    },
    {
        id: 4, name: "Ashanti Cultural Centre", region: "Ashanti", category: "cultural",
        description: "Explore the rich Ashanti culture through traditional crafts, kente weaving demonstrations, and artifacts from the Ashanti Kingdom.",
        image: "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600&q=80",
        entranceFee: "GH₵ 20", openingHours: "9am - 5pm", rating: 4.5, reviews: 432,
        tags: ["Kente", "Crafts", "Culture"],
    },
    {
        id: 5, name: "Elmina Castle", region: "Central", category: "historical",
        description: "The oldest European building in sub-Saharan Africa, built by the Portuguese in 1482. A profound and moving historical landmark.",
        image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
        entranceFee: "GH₵ 40", openingHours: "9am - 5pm", rating: 4.8, reviews: 987,
        tags: ["UNESCO", "Colonial", "History"],
    },
    {
        id: 6, name: "Mole National Park", region: "Northern", category: "nature",
        description: "Ghana's largest wildlife refuge, home to elephants, antelopes, warthogs, baboons, and over 300 species of birds. A true safari experience.",
        image: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=600&q=80",
        entranceFee: "GH₵ 100", openingHours: "6am - 6pm", rating: 4.6, reviews: 654,
        tags: ["Safari", "Elephants", "Wildlife"],
    },
    {
        id: 7, name: "Wli Waterfalls", region: "Volta", category: "nature",
        description: "The highest waterfall in West Africa, located in the Agumatsa Wildlife Sanctuary. A spectacular 2-hour hike leads to the falls.",
        image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80",
        entranceFee: "GH₵ 30", openingHours: "7am - 5pm", rating: 4.7, reviews: 521,
        tags: ["Hiking", "Waterfall", "Adventure"],
    },
    {
        id: 8, name: "Accra Arts Centre", region: "Greater Accra", category: "cultural",
        description: "A vibrant craft market where artisans sell authentic Ghanaian crafts including wood carvings, batik fabric, jewelry, and souvenirs.",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80",
        entranceFee: "Free", openingHours: "8am - 6pm", rating: 4.2, reviews: 1102,
        tags: ["Shopping", "Crafts", "Art"],
    },
    {
        id: 9, name: "Homowo Festival", region: "Greater Accra", category: "festival",
        description: "The Ga people's harvest festival celebrated with traditional foods, drumming, and dancing. Typically held between August and September.",
        image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80",
        entranceFee: "Free", openingHours: "Seasonal", rating: 4.8, reviews: 312,
        tags: ["Festival", "Culture", "Ga People"],
    },
];

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

    const filtered = destinations.filter((d) => {
        const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
            d.description.toLowerCase().includes(search.toLowerCase());
        const matchCategory = selectedCategory === "all" || d.category === selectedCategory;
        const matchRegion = selectedRegion === "All Regions" || d.region === selectedRegion;
        return matchSearch && matchCategory && matchRegion;
    });

    return (
        <Layout>
            {/* Hero */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 py-20 text-white">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551963831-b3b1ca40c98e?w=1600&q=80')", backgroundSize: "cover", backgroundPosition: "center" }} />
                <div className="relative mx-auto max-w-6xl px-4 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm mb-6">
                        <MapPin className="h-4 w-4" />
                        Explore 9 Regions of Ghana
                    </div>
                    <h1 className="font-display text-5xl font-bold md:text-6xl mb-4">Discover Ghana's Wonders</h1>
                    <p className="mx-auto max-w-2xl text-xl text-white/80 mb-8">
                        From ancient castles to pristine beaches, find your next extraordinary adventure
                    </p>
                    <div className="mx-auto max-w-lg relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                            placeholder="Search destinations, attractions..."
                            className="pl-12 h-14 text-base rounded-2xl bg-white text-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            <div className="mx-auto max-w-6xl px-4 py-10">
                {/* Filters */}
                <div className="flex flex-col gap-4 mb-8">
                    {/* Category pills */}
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => {
                            const Icon = cat.icon;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all border ${selectedCategory === cat.id
                                            ? "bg-primary text-primary-foreground border-primary shadow-md"
                                            : "bg-card border-border hover:border-primary/50"
                                        }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                    {/* Region filter */}
                    <div className="flex flex-wrap gap-2">
                        {regions.map((region) => (
                            <button
                                key={region}
                                onClick={() => setSelectedRegion(region)}
                                className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border ${selectedRegion === region
                                        ? "bg-emerald-600 text-white border-emerald-600"
                                        : "bg-card border-border hover:border-emerald-400"
                                    }`}
                            >
                                {region}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-muted-foreground mb-6">{filtered.length} destination{filtered.length !== 1 ? "s" : ""} found</p>

                {/* Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((dest) => (
                        <div key={dest.id} className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-xl transition-all duration-300">
                            <div className="relative overflow-hidden h-52">
                                <img
                                    src={dest.image}
                                    alt={dest.name}
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute top-3 left-3">
                                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${categoryColors[dest.category] || "bg-gray-100 text-gray-800"}`}>
                                        {dest.category}
                                    </span>
                                </div>
                                <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white">
                                    <MapPin className="h-3.5 w-3.5" />
                                    <span className="text-sm font-medium">{dest.region}</span>
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="font-display text-lg font-bold leading-tight">{dest.name}</h3>
                                    <div className="flex items-center gap-1 text-sm shrink-0 ml-2">
                                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                        <span className="font-semibold">{dest.rating}</span>
                                        <span className="text-muted-foreground">({dest.reviews})</span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{dest.description}</p>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                                    <div className="flex items-center gap-1">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        {dest.entranceFee}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5" />
                                        {dest.openingHours}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {dest.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                                    ))}
                                </div>
                                <Button
                                    className="w-full gap-2 group/btn"
                                    onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(dest.name)}`)}
                                >
                                    Plan a Trip Here
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {filtered.length === 0 && (
                    <div className="py-20 text-center">
                        <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-1">No destinations found</h3>
                        <p className="text-muted-foreground">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>
        </Layout>
    );
}
