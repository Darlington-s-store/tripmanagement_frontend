import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, Search, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/layout/Layout";
import { guidesService } from "@/services/guides";
import type { Guide } from "@/services/guides";
import { toast } from "sonner";

const TourGuides = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    setIsLoading(true);
    try {
      const data = await guidesService.searchGuides({ limit: 100 });
      setGuides(data);
    } catch (error: unknown) {
      toast.error("Failed to load guides");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = useMemo(() => {
    return guides.filter((g) => {
      const matchesSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.bio || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLang =
        language === "all" ||
        (g.languages || "").toLowerCase().includes(language.toLowerCase());
      return matchesSearch && matchesLang;
    });
  }, [guides, searchQuery, language]);

  return (
    <Layout>
      <section className="bg-gradient-primary py-16">
        <div className="container">
          <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">Find a Tour Guide</h1>
          <p className="mb-8 text-primary-foreground/80">Connect with experienced local guides who bring Ghana's stories to life</p>
          <div className="flex flex-col gap-2 rounded-2xl bg-background p-3 shadow-primary-lg sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3">
              <Search className="h-4 w-4 text-primary" />
              <Input placeholder="Search by name or specialty..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 bg-transparent shadow-none focus-visible:ring-0" />
            </div>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-full rounded-xl sm:w-[160px]"><SelectValue placeholder="Language" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Languages</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="twi">Twi</SelectItem>
                <SelectItem value="french">French</SelectItem>
                <SelectItem value="ewe">Ewe</SelectItem>
              </SelectContent>
            </Select>
            <Button size="lg" className="gap-2 rounded-xl" onClick={loadGuides}><Search className="h-4 w-4" /> Search</Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <p className="mb-4 text-sm text-muted-foreground">
            {isLoading ? "Loading..." : `${filtered.length} guides found`}
          </p>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20">
              <Loader className="mb-3 h-10 w-10 text-muted-foreground animate-spin" />
              <p className="text-lg font-semibold">Loading guides...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card py-20">
              <Search className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-lg font-semibold">No guides found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((g) => (
                <div key={g.id} className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-primary-md">
                  <div className="mb-4 flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent font-display text-2xl font-bold text-primary">
                      {g.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-semibold">{g.name}</h3>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{Number(g.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="mb-3 text-sm text-muted-foreground line-clamp-2">{g.bio || "Experienced local guide"}</p>
                  <div className="mb-3 flex flex-wrap gap-1">
                    {(g.languages || "").split(",").filter(Boolean).map((l) => (
                      <Badge key={l.trim()} variant="outline" className="text-xs">{l.trim()}</Badge>
                    ))}
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-xl font-bold text-primary">GH₵{g.hourly_rate}</span>
                      <span className="text-sm text-muted-foreground">/day</span>
                    </div>
                    <Button size="sm" asChild>
                      <Link to={`/guides/${g.id}`}>View Guide</Link>
                    </Button>
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

export default TourGuides;
