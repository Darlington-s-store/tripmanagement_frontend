import { useState, useEffect } from "react";
import { Plane, Search, Eye, MapPin, Calendar, DollarSign, Trash2, Star, Globe, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, AdminTrip } from "@/services/admin";
import { toast } from "sonner";

const AdminTrips = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [tripsList, setTripsList] = useState<AdminTrip[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadTrips();
    }, []);

    const loadTrips = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getAllTrips();
            setTripsList(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load trips:", error);
            toast.error("Failed to load trips");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this trip?")) return;
        try {
            await adminService.deleteTrip(id);
            toast.success("Trip deleted successfully");
            loadTrips();
        } catch (error) {
            toast.error("Failed to delete trip");
        }
    };

    const handleToggle = async (id: string, field: 'is_public' | 'is_featured', value: boolean) => {
        try {
            await adminService.updateTrip(id, { [field]: value });
            setTripsList(tripsList.map(t => t.id === id ? { ...t, [field]: value } : t));
            toast.success(`Trip ${field === 'is_public' ? 'visibility' : 'featured status'} updated`);
        } catch (error) {
            toast.error("Failed to update trip status");
        }
    };

    const filtered = tripsList.filter((t) => {
        return (
            t.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div>
                    <h2 className="font-display text-2xl font-bold font-display">User Trips & Itineraries</h2>
                    <p className="text-muted-foreground">Monitor and manage all trips created by travellers</p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                    <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by user, destination, or ID..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {isLoading ? (
                        <div className="col-span-full py-12 text-center">
                            <div className="flex justify-center mb-2">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                            Loading trips...
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-muted-foreground">
                            No trips found matching your search.
                        </div>
                    ) : (
                        filtered.map((trip) => (
                            <div key={trip.id} className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-lg">
                                <div className="flex items-start justify-between">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                        <Plane className="h-5 w-5" />
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                            <Link to={`/trips/${trip.id}`}>
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(trip.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <h3 className="font-display text-lg font-bold">{trip.destination}</h3>
                                    <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        <span>User: <strong>{trip.user_name}</strong></span>
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span>
                                            {new Date(trip.start_date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-semibold text-primary">
                                            Budget: {typeof trip.budget === 'number' ? `GH₵${trip.budget.toLocaleString()}` : trip.budget}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {trip.is_public ? <Globe className="h-3 w-3 text-success" /> : <Lock className="h-3 w-3 text-muted-foreground" />}
                                            <Label htmlFor={`public-${trip.id}`} className="text-xs">Public</Label>
                                        </div>
                                        <Switch
                                            id={`public-${trip.id}`}
                                            checked={trip.is_public}
                                            onCheckedChange={(val) => handleToggle(trip.id, 'is_public', val)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Star className={`h-3 w-3 ${trip.is_featured ? "fill-warning text-warning" : "text-muted-foreground"}`} />
                                            <Label htmlFor={`featured-${trip.id}`} className="text-xs">Featured</Label>
                                        </div>
                                        <Switch
                                            id={`featured-${trip.id}`}
                                            checked={trip.is_featured}
                                            onCheckedChange={(val) => handleToggle(trip.id, 'is_featured', val)}
                                        />
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                    <span>ID: {trip.id.substring(0, 8)}</span>
                                    <span>Created: {new Date(trip.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminTrips;
