import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { adminService, Destination } from "@/services/admin";
import { toast } from "sonner";

const AdminDestinationOverview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [destination, setDestination] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadDestination();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const loadDestination = async () => {
        try {
            setLoading(true);
            const data = await adminService.getDestinationById(id!);
            setDestination(data);
        } catch (error) {
            console.error("Failed to load destination:", error);
            toast.error("Failed to load destination details.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this destination? This action cannot be undone.")) return;
        try {
            await adminService.deleteDestination(id!);
            toast.success("Destination deleted successfully");
            navigate("/admin/destinations");
        } catch (error) {
            toast.error("Failed to delete destination");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </DashboardLayout>
        );
    }

    if (!destination) {
        return (
            <DashboardLayout role="admin">
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <AlertCircle className="h-12 w-12 text-destructive" />
                    <h2 className="text-xl font-semibold">Destination Not Found</h2>
                    <Button onClick={() => navigate("/admin/destinations")} variant="outline">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b pb-6">
                    <div>
                        <Button 
                            variant="link" 
                            className="px-0 mb-4 h-auto text-muted-foreground"
                            onClick={() => navigate("/admin/destinations")}
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Destinations
                        </Button>
                        <h1 className="text-3xl font-bold">{destination.name}</h1>
                        <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <span>{destination.region}</span>
                            <span>&bull;</span>
                            <span>{destination.category}</span>
                            <span>&bull;</span>
                            <span>Added: {destination.created_at ? new Date(destination.created_at).toLocaleDateString() : 'N/A'}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant={destination.status === 'active' ? 'default' : 'secondary'} className="mr-2">
                            {destination.status}
                        </Badge>
                        <Button variant="outline" onClick={() => navigate(`/admin/destinations/${id}/edit`)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-6">
                        <div className="rounded-lg overflow-hidden border bg-muted">
                            <img 
                                src={destination.image_url || '/placeholder.jpg'} 
                                alt={destination.name}
                                className="w-full h-auto object-cover max-h-[400px]"
                            />
                        </div>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-2">Description</h3>
                                <p className="text-muted-foreground mb-6">{destination.description}</p>
                                
                                <h3 className="text-lg font-semibold mb-2">Full Details</h3>
                                <p className="text-sm whitespace-pre-wrap">
                                    {destination.full_description || "No full description available."}
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Gallery</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {Array.isArray(destination.gallery) && destination.gallery.length > 0 ? (
                                        destination.gallery.map((img, idx) => (
                                            <div key={idx} className="aspect-square rounded-md overflow-hidden border">
                                                <img src={img} alt={`Gallery image ${idx + 1}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground col-span-full">No gallery images</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold border-b pb-3 mb-4">Logistics</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Entrance Fee</div>
                                        <div>{destination.entrance_fee || "Free"}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-muted-foreground mb-1">Opening Hours</div>
                                        <div>{destination.opening_hours || "Not specified"}</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold border-b pb-3 mb-4">Location</h3>
                                {destination.location_map ? (
                                    <div className="aspect-square rounded-md overflow-hidden border bg-muted">
                                        <iframe 
                                            src={destination.location_map} 
                                            className="w-full h-full border-0" 
                                            loading="lazy" 
                                            title={`${destination.name} Location`}
                                        />
                                    </div>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No map location provided.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDestinationOverview;
