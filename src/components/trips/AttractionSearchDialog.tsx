
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Loader2, Compass } from "lucide-react";
import { destinationsService, Attraction } from "@/services/destinations";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface AttractionSearchDialogProps {
    onSelect: (attraction: Attraction) => void;
    defaultLocation?: string;
    trigger?: React.ReactNode;
}

export default function AttractionSearchDialog({ onSelect, defaultLocation = "", trigger }: AttractionSearchDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [search, setSearch] = useState(defaultLocation);

    const fetchAttractions = async () => {
        setLoading(true);
        try {
            const data = await destinationsService.searchAttractions({ search });
            setAttractions(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchAttractions();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Compass className="h-4 w-4" /> Add Attraction
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
                        <Compass className="h-6 w-6 text-primary" /> Discover Attractions
                    </DialogTitle>
                    <DialogDescription>
                        Search and select a famous spot to visit in {search || "Ghana"}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search attraction or city..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === "Enter" && fetchAttractions()}
                            />
                        </div>
                        <Button onClick={fetchAttractions} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                            </div>
                        ) : attractions.length > 0 ? (
                            attractions.map((attr) => (
                                <Card key={attr.id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { onSelect(attr); setOpen(false); }}>
                                    <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                                        <div className="w-full sm:w-28 h-28 shrink-0">
                                            <img
                                                src={attr.image_url || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500"}
                                                alt={attr.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-bold text-base leading-tight">{attr.name}</h4>
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{attr.category}</Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" /> {attr.destination_name}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-2 line-clamp-1">{attr.description}</p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="text-xs font-bold text-emerald-600 flex-1">
                                                    {attr.entrance_fee === "Free" ? "FREE ENTRY" : `Fee: ${attr.entrance_fee}`}
                                                </div>
                                                <Button size="sm" variant="outline" className="h-7 text-[10px] font-bold text-primary border-primary/20 hover:bg-primary/5">Add to Plan</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Compass className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                <p className="text-sm text-muted-foreground">No attractions found. Try a different search.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
