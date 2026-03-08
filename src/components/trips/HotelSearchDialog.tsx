import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Hotel, Search, Star, MapPin, Loader2, DollarSign } from "lucide-react";
import { hotelsService, Hotel as HotelType } from "@/services/hotels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface HotelSearchDialogProps {
    onSelect: (hotel: HotelType) => void;
    defaultLocation?: string;
    trigger?: React.ReactNode;
}

export default function HotelSearchDialog({ onSelect, defaultLocation = "", trigger }: HotelSearchDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [hotels, setHotels] = useState<HotelType[]>([]);
    const [search, setSearch] = useState(defaultLocation);

    const fetchHotels = async () => {
        setLoading(true);
        try {
            const data = await hotelsService.searchHotels({ location: search });
            setHotels(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchHotels();
    }, [open]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Hotel className="h-4 w-4" /> Add Hotel
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
                        <Hotel className="h-6 w-6 text-primary" /> Find Accommodation
                    </DialogTitle>
                    <DialogDescription>
                        Search and select a hotel for your trip in {search || "Ghana"}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-4 flex-1 flex flex-col overflow-hidden">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search location..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === "Enter" && fetchHotels()}
                            />
                        </div>
                        <Button onClick={fetchHotels} disabled={loading}>
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                            </div>
                        ) : hotels.length > 0 ? (
                            hotels.map((hotel) => (
                                <Card key={hotel.id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { onSelect(hotel); setOpen(false); }}>
                                    <CardContent className="p-0 flex flex-col sm:flex-row h-full">
                                        <div className="w-full sm:w-32 h-32 shrink-0">
                                            <img
                                                src={hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"}
                                                alt={hotel.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4 flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-bold text-base leading-tight">{hotel.name}</h4>
                                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                                        <Star className="h-3 w-3 fill-current" /> {hotel.rating || 0}
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                    <MapPin className="h-3 w-3" /> {hotel.location}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className="text-sm font-bold text-primary flex-1">
                                                    GH₵ {hotel.price_per_night} <span className="text-[10px] text-muted-foreground font-normal">/ night</span>
                                                </div>
                                                <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-muted-foreground mr-1" onClick={(e) => { e.stopPropagation(); window.open(`/hotels/${hotel.id}`, '_blank'); }}>View</Button>
                                                <Button size="sm" variant="outline" className="h-8 text-xs font-bold text-primary border-primary/20 hover:bg-primary/5">Select</Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Hotel className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                <p className="text-sm text-muted-foreground">No hotels found for this location.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
