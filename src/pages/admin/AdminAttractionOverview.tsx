import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    ArrowLeft, 
    MapPin, 
    Clock, 
    DollarSign, 
    Landmark, 
    Edit2, 
    Calendar,
    Image as ImageIcon,
    Compass,
    Info,
    CheckCircle2
} from "lucide-react";
import { adminService, Attraction } from "@/services/admin";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const AdminAttractionOverview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [attraction, setAttraction] = useState<Attraction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadAttraction(id);
        }
    }, [id]);

    const loadAttraction = async (attractionId: string) => {
        try {
            setLoading(true);
            const data = await adminService.getAttractionById(attractionId);
            setAttraction(data);
        } catch (error) {
            console.error("Failed to load attraction:", error);
            toast.error("Failed to load attraction details");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="space-y-6">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-[400px] w-full rounded-xl" />
                    <div className="grid gap-6 md:grid-cols-3">
                        <Skeleton className="h-[200px] rounded-xl" />
                        <Skeleton className="h-[200px] rounded-xl md:col-span-2" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!attraction) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-[400px] flex-col items-center justify-center space-y-4">
                    <h2 className="text-2xl font-bold">Attraction not found</h2>
                    <Button onClick={() => navigate("/admin/attractions")}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attractions
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8 animate-in fade-in duration-500">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate("/admin/attractions")}
                        className="hover:bg-orange-50 hover:text-orange-600 transition-colors"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Attractions
                    </Button>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline"
                            className="border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                        >
                            <Edit2 className="mr-2 h-4 w-4" /> Edit Details
                        </Button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid gap-8 lg:grid-cols-12">
                    {/* Left Column: Visuals & Core Info */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Hero Section */}
                        <div className="relative group rounded-3xl overflow-hidden bg-slate-100 shadow-2xl ring-1 ring-black/5 aspect-video md:aspect-[21/9]">
                            {attraction.image_url ? (
                                <img 
                                    src={attraction.image_url} 
                                    alt={attraction.name}
                                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-orange-50">
                                    <Landmark className="h-20 w-20 text-orange-200" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 p-8 w-full">
                                <div className="flex flex-wrap items-center gap-3 mb-4">
                                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white border-none px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-lg">
                                        {attraction.category}
                                    </Badge>
                                    <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
                                        {attraction.status === 'published' ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>
                                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                                    {attraction.name}
                                </h1>
                                <div className="flex items-center mt-4 text-white/90 font-medium">
                                    <MapPin className="mr-2 h-5 w-5 text-orange-400" />
                                    <span className="text-lg">{attraction.destination_name}</span>
                                </div>
                            </div>
                        </div>

                        {/* Description & Activities */}
                        <div className="grid gap-8 md:grid-cols-2">
                            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="flex items-center text-lg font-bold">
                                        <Info className="mr-2 h-5 w-5 text-orange-500" />
                                        About Attraction
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                        {attraction.full_description || attraction.description}
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                                <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                    <CardTitle className="flex items-center text-lg font-bold">
                                        <Compass className="mr-2 h-5 w-5 text-orange-500" />
                                        Experience & Activities
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {attraction.activities && attraction.activities.length > 0 ? (
                                            <div className="grid grid-cols-1 gap-3">
                                                {attraction.activities.map((activity, i) => (
                                                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-orange-50/50 group hover:bg-orange-50 transition-colors">
                                                        <CheckCircle2 className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                                                        <span className="text-slate-700 font-medium">{activity}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-muted-foreground text-sm italic">No specific activities listed.</p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Visual Inventory / Gallery */}
                        <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="flex items-center text-lg font-bold uppercase tracking-tight text-slate-800">
                                    <ImageIcon className="mr-2 h-5 w-5 text-orange-500" />
                                    Visual Inventory
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6">
                                {attraction.gallery && attraction.gallery.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {attraction.gallery.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden group border border-slate-100 shadow-sm">
                                                <img 
                                                    src={img} 
                                                    alt={`${attraction.name} gallery ${i}`} 
                                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <ImageIcon className="h-12 w-12 text-slate-300 mb-2" />
                                        <p className="text-slate-500 font-medium">Add gallery images to showcase this attraction.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Logistics & Metadata */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Quick Stats Card */}
                        <Card className="rounded-3xl border-none shadow-lg bg-orange-600 text-white overflow-hidden">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-white/80 text-sm font-bold uppercase tracking-widest">Pricing & Access</CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6 text-white pb-8">
                                <div className="space-y-2">
                                    <div className="text-white/60 text-xs font-bold uppercase">Entrance Fee</div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black">{attraction.entrance_fee || "Free"}</span>
                                    </div>
                                </div>
                                <div className="h-px bg-white/10" />
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center font-bold">
                                        <Clock className="mr-2 h-5 w-5 text-orange-200" />
                                        Hours
                                    </div>
                                    <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">{attraction.opening_hours}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Location Metadata */}
                        <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="flex items-center text-sm font-bold uppercase tracking-widest text-slate-500">
                                    <MapPin className="mr-2 h-4 w-4 text-orange-500" />
                                    Logistics
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Best Visit Time</label>
                                    <div className="flex items-center text-slate-700 font-bold bg-slate-50 p-3 rounded-xl border border-slate-100">
                                        <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                                        {attraction.best_time || "All year round"}
                                    </div>
                                </div>
                                
                                {attraction.travel_tips && attraction.travel_tips.length > 0 && (
                                    <div>
                                        <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 block">Travel Advice</label>
                                        <div className="space-y-2">
                                            {attraction.travel_tips.map((tip, i) => (
                                                <div key={i} className="text-xs p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 leading-relaxed font-medium">
                                                    {tip}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Spatial Mapping */}
                        <Card className="rounded-3xl border-none shadow-sm bg-white overflow-hidden ring-1 ring-slate-100">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500">Spatial Intelligence</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 aspect-square">
                                {attraction.location_map ? (
                                    <iframe 
                                        src={attraction.location_map}
                                        className="h-full w-full border-none grayscale-[0.2] contrast-[1.1]"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center bg-slate-50">
                                        <Compass className="h-10 w-10 text-slate-300 mb-2" />
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">No GPS coordinates available</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminAttractionOverview;
