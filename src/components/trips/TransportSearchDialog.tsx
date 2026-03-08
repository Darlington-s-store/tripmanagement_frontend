import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Car, Search, MapPin, Loader2, Plane, Bus, ArrowRight } from "lucide-react";
import { transportService, TransportService as TransportType } from "@/services/transport";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TransportSearchDialogProps {
    onSelect: (transport: TransportType) => void;
    defaultFrom?: string;
    defaultTo?: string;
    trigger?: React.ReactNode;
}

export default function TransportSearchDialog({ onSelect, defaultFrom = "Accra", defaultTo = "", trigger }: TransportSearchDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [transport, setTransport] = useState<TransportType[]>([]);
    const [from, setFrom] = useState(defaultFrom);
    const [to, setTo] = useState(defaultTo);
    const [type, setType] = useState<string>("all");

    const fetchTransport = async () => {
        setLoading(true);
        try {
            const data = await transportService.getTransportServices({
                from: from,
                to: to,
                type: type === "all" ? undefined : type
            });
            setTransport(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchTransport();
    }, [open, type]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <Car className="h-4 w-4" /> Add Transport
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="p-6 pb-0">
                    <DialogTitle className="text-2xl font-display font-bold flex items-center gap-2">
                        <Car className="h-6 w-6 text-primary" /> Find Transport
                    </DialogTitle>
                    <DialogDescription>
                        Book buses or flights for your trip movement
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-4 flex-1 flex flex-col overflow-hidden">
                    <Tabs value={type} onValueChange={setType} className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="all">All</TabsTrigger>
                            <TabsTrigger value="bus" className="gap-2"><Bus className="h-3.5 w-3.5" /> Bus</TabsTrigger>
                            <TabsTrigger value="flight" className="gap-2"><Plane className="h-3.5 w-3.5" /> Flight</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    <div className="grid grid-cols-2 gap-2">
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="From..."
                                value={from}
                                onChange={(e) => setFrom(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="To..."
                                value={to}
                                onChange={(e) => setTo(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                    <Button className="w-full" onClick={fetchTransport} disabled={loading}>
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search Transport"}
                    </Button>

                    <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                            </div>
                        ) : transport.length > 0 ? (
                            transport.map((item) => (
                                <Card key={item.id} className="overflow-hidden hover:border-primary/50 transition-colors cursor-pointer" onClick={() => { onSelect(item); setOpen(false); }}>
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline" className="capitalize text-[10px] px-1.5 py-0 h-4">
                                                    {item.type === 'flight' ? <Plane className="h-2.5 w-2.5 mr-1" /> : <Bus className="h-2.5 w-2.5 mr-1" />}
                                                    {item.type}
                                                </Badge>
                                                <span className="font-bold text-sm">{item.operator}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="font-medium text-foreground">{item.from_location}</span>
                                                <ArrowRight className="h-3 w-3" />
                                                <span className="font-medium text-foreground">{item.to_location}</span>
                                            </div>
                                            {item.departure_time && (
                                                <p className="text-[10px] text-muted-foreground mt-1">
                                                    Departure: {item.departure_time} {item.arrival_time ? `· Arrival: ${item.arrival_time}` : ""}
                                                </p>
                                            )}
                                        </div>
                                        <div className="text-right ml-4">
                                            <div className="text-sm font-bold text-primary">GH₵ {item.price}</div>
                                            <Button size="sm" variant="ghost" className="h-8 px-2 text-xs font-bold text-primary hover:bg-primary/10">Select</Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <Car className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-20" />
                                <p className="text-sm text-muted-foreground">No transport services found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
