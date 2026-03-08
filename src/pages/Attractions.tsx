import { useState, useMemo } from "react";
import { MapPin, Clock, DollarSign, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import kakumPark from "@/assets/kakum-park.jpg";
import elminaCastle from "@/assets/elmina-castle.jpg";
import molePark from "@/assets/mole-park.jpg";
import heroGhana from "@/assets/hero-ghana.jpg";

const attractions = [
  { id: 1, name: "Cape Coast Castle", region: "Central", category: "Historical", fee: "GH₵40", hours: "9AM - 5PM", image: elminaCastle, description: "Historic castle and UNESCO World Heritage Site" },
  { id: 2, name: "Kakum National Park", region: "Central", category: "Nature", fee: "GH₵60", hours: "8AM - 4PM", image: kakumPark, description: "Canopy walkway through pristine rainforest" },
  { id: 3, name: "Mole National Park", region: "Northern", category: "Wildlife", fee: "GH₵50", hours: "6AM - 6PM", image: molePark, description: "Ghana's largest wildlife refuge with elephants" },
  { id: 4, name: "Wli Waterfalls", region: "Volta", category: "Nature", fee: "GH₵30", hours: "7AM - 5PM", image: heroGhana, description: "The tallest waterfall in West Africa" },
  { id: 5, name: "Kwame Nkrumah Memorial", region: "Greater Accra", category: "Historical", fee: "GH₵20", hours: "9AM - 5PM", image: elminaCastle, description: "Memorial park for Ghana's first president" },
  { id: 6, name: "Aburi Botanical Gardens", region: "Eastern", category: "Nature", fee: "GH₵15", hours: "8AM - 6PM", image: kakumPark, description: "Beautiful botanical gardens in the Akuapem hills" },
];

const Attractions = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");

  const filtered = useMemo(() => {
    return attractions.filter((a) => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = region === "all" || a.region.toLowerCase().replace(" ", "-") === region;
      const matchesCategory = category === "all" || a.category.toLowerCase() === category;
      return matchesSearch && matchesRegion && matchesCategory;
    });
  }, [searchQuery, region, category]);

  return (
    <Layout>
      <section className="bg-gradient-primary py-16">
        <div className="container">
          <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">Tourist Attractions</h1>
          <p className="mb-8 text-primary-foreground/80">Explore Ghana's most beautiful destinations, historical sites, and natural wonders</p>
          <div className="flex flex-col gap-2 rounded-2xl bg-background p-3 shadow-primary-lg sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3">
              <Search className="h-4 w-4 text-primary" />
              <Input placeholder="Search attractions..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
            </div>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger className="w-full rounded-xl sm:w-[160px]"><SelectValue placeholder="Region" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="central">Central</SelectItem>
                <SelectItem value="greater-accra">Greater Accra</SelectItem>
                <SelectItem value="northern">Northern</SelectItem>
                <SelectItem value="volta">Volta</SelectItem>
                <SelectItem value="eastern">Eastern</SelectItem>
              </SelectContent>
            </Select>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full rounded-xl sm:w-[160px]"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="historical">Historical</SelectItem>
                <SelectItem value="nature">Nature</SelectItem>
                <SelectItem value="wildlife">Wildlife</SelectItem>
              </SelectContent>
            </Select>
            <Button size="lg" className="gap-2 rounded-xl"><Search className="h-4 w-4" /> Search</Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <p className="mb-4 text-sm text-muted-foreground">{filtered.length} attractions found</p>
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20">
              <Search className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No attractions found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <div key={a.id} className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-primary-md">
                  <div className="relative h-48 overflow-hidden">
                    <img src={a.image} alt={a.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <Badge className="absolute right-3 top-3">{a.category}</Badge>
                  </div>
                  <div className="p-4">
                    <h3 className="mb-1 font-display text-lg font-semibold">{a.name}</h3>
                    <p className="mb-3 text-sm text-muted-foreground">{a.description}</p>
                    <div className="mb-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {a.region}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {a.hours}</span>
                      <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {a.fee}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Attractions;
