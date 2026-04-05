import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
    MapPin, 
    Clock, 
    DollarSign, 
    Star, 
    Calendar, 
    ArrowLeft, 
    Share2, 
    Heart,
    Info,
    Camera,
    Map as MapIcon,
    ChevronRight,
    CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { destinationsService, Attraction } from "@/services/destinations";
import { reviewsService, Review } from "@/services/reviews";
import { useAuth } from "@/context/AuthContext";
import { ReviewsSection } from "@/components/trips/ReviewsSection";
import { ShareDestination } from "@/components/trips/ShareDestination";
import { toast } from "sonner";

const DestinationDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [attraction, setAttraction] = useState<Attraction | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState<string>("");
    const [shareOpen, setShareOpen] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDetail(id);
            fetchReviews(id);
        }
    }, [id]);

    const fetchReviews = async (targetId: string) => {
        try {
            // For now, let's look for 'activity' reviews since destinations are often booked as activities
            // or we can try a few types if it's generic.
            const data = await reviewsService.getServiceReviews('activity', targetId);
            setReviews(data);
        } catch (error) {
            console.error("Failed to fetch reviews", error);
        }
    };

    const fetchDetail = async (targetId: string) => {
        try {
            setLoading(true);
            const item = await destinationsService.getAttractionById(targetId);
            if (item) {
                setAttraction(item);
                setActiveImage(item.image_url);
            } else {
                toast.error("Destination not found");
                navigate("/destinations");
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to load details");
        } finally {
            setLoading(false);
        }
    };

    const handleAddReview = async (rating: number, comment: string) => {
        if (!id) return;
        try {
            await reviewsService.createReview({
                rating,
                comment,
                serviceType: 'activity',
                serviceId: id
            });
            
            toast.success("Review submitted! It will appear after moderation.");
            // Refresh reviews (will show if published)
            fetchReviews(id);
        } catch (error: unknown) {
            console.error(error);
            toast.error(error.message || "Failed to post review");
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading destination details...</p>
                </div>
            </Layout>
        );
    }

    if (!attraction) return null;

    const gallery = attraction.gallery || [];
    const images = attraction.image_url ? [attraction.image_url, ...gallery] : gallery;

    return (
        <Layout>
            <div className="bg-muted/30 pb-20">
                {/* Header/Nav */}
                <div className="container py-4">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Destinations
                    </button>
                </div>

                <div className="container grid gap-8 lg:grid-cols-3">
                    {/* Left Column: Images and Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Gallery */}
                        <div className="space-y-4">
                            <div className="aspect-[16/9] overflow-hidden rounded-3xl bg-muted border border-border shadow-sm">
                                <img 
                                    src={activeImage || "/placeholder.svg"} 
                                    alt={attraction.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            {images.length > 1 && (
                                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {images.map((img: string, idx: number) => (
                                        <button 
                                            key={idx}
                                            onClick={() => setActiveImage(img)}
                                            className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                                        >
                                            <img src={img} className="h-full w-full object-cover" alt="" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Title & Stats */}
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                                    {attraction.category}
                                </Badge>
                                <span className="flex items-center gap-1 text-sm text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                                    <Star className="h-3.5 w-3.5 fill-yellow-600" />
                                    4.8 (124 reviews)
                                </span>
                            </div>
                            <h1 className="font-display text-4xl font-bold tracking-tight md:text-5xl">
                                {attraction.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    {attraction.region}, Ghana
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-primary" />
                                    {attraction.opening_hours || "Open 24/7"}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <DollarSign className="h-4 w-4 text-primary" />
                                    {attraction.entrance_fee || "Free Entry"}
                                </span>
                            </div>
                        </div>

                        {/* Tabs Content */}
                        <Tabs defaultValue="overview" className="space-y-6">
                            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto gap-8">
                                <TabsTrigger value="overview" className="border-b-2 border-transparent rounded-none px-0 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base">Overview</TabsTrigger>
                                <TabsTrigger value="details" className="border-b-2 border-transparent rounded-none px-0 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base">Full Description</TabsTrigger>
                                <TabsTrigger value="tips" className="border-b-2 border-transparent rounded-none px-0 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base">Travel Tips</TabsTrigger>
                                <TabsTrigger value="map" className="border-b-2 border-transparent rounded-none px-0 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none text-base">Location</TabsTrigger>
                            </TabsList>
                            <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="prose prose-slate max-w-none">
                                    <p className="text-lg leading-relaxed text-muted-foreground">
                                        {attraction.description}
                                    </p>
                                </div>
                                
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border">
                                        <div className="p-2 rounded-xl bg-primary/10">
                                            <Camera className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Photo Spots</h4>
                                            <p className="text-sm text-muted-foreground">Beautiful viewpoints and landmarks perfect for photography.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-border">
                                        <div className="p-2 rounded-xl bg-primary/10">
                                            <Info className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold">Local Guides</h4>
                                            <p className="text-sm text-muted-foreground">Professional guides available on-site for tours.</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="details" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="prose prose-slate max-w-none bg-white p-8 rounded-3xl border border-border shadow-sm">
                                    {attraction.full_description ? (
                                        <div className="whitespace-pre-line text-muted-foreground space-y-4">
                                            {attraction.full_description}
                                        </div>
                                    ) : (
                                        <p className="text-muted-foreground italic">No detailed description available yet.</p>
                                    )}
                                </div>
                            </TabsContent>
                            <TabsContent value="tips" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="space-y-6">
                                    <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                                        <div className="shrink-0 h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                                            <Info className="h-5 w-5 text-amber-700" />
                                        </div>
                                        <div>
                                            <h4 className="text-amber-900 font-bold mb-1">Know Before You Go</h4>
                                            <p className="text-amber-800/80 text-sm leading-relaxed">
                                                Ghana is warm year-round. We recommend visiting early in the morning or late afternoon to avoid the peak heat.
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-8 rounded-3xl border border-border shadow-sm">
                                        <h3 className="text-xl font-bold mb-4">Travel Tips</h3>
                                        {attraction.travel_tips ? (
                                            <div className="whitespace-pre-line text-muted-foreground">
                                                {attraction.travel_tips}
                                            </div>
                                        ) : (
                                            <ul className="space-y-3">
                                                {[
                                                    "Wear comfortable walking shoes.",
                                                    "Bring cash for entrance fees as card payments may not be available.",
                                                    "Stay hydrated and carry water with you.",
                                                    "Respect local customs and ask before taking photos of people."
                                                ].map((tip, i) => (
                                                    <li key={i} className="flex gap-3 text-muted-foreground">
                                                        <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                                                        {tip}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="map" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="aspect-video rounded-3xl overflow-hidden border border-border shadow-sm bg-muted relative group">
                                    {(attraction as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).location_map ? (
                                        <iframe 
                                            src={(attraction as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).location_map}
                                            className="w-full h-full border-0"
                                            allowFullScreen
                                            loading="lazy"
                                        ></iframe>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8 text-center">
                                            <MapIcon className="h-12 w-12 mb-4 opacity-20" />
                                            <p className="font-semibold">Interactive map not available</p>
                                            <p className="text-sm">Located in {(attraction as any /* eslint-disable-line @typescript-eslint/no-explicit-any */).location_data || attraction.region}</p>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>
                        </Tabs>

                        {/* Reviews Section at the Bottom of Main Content */}
                        <div className="pt-10 border-t border-border mt-20">
                            <ReviewsSection 
                                attractionId={id!} 
                                reviews={reviews} 
                                onAddReview={handleAddReview}
                                isAuthenticated={isAuthenticated}
                            />
                        </div>
                    </div>

                    {/* Right Column: Actions & Info */}
                    <div className="space-y-6">
                        {/* Booking Card */}
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-3xl border border-border bg-white p-6 shadow-xl shadow-primary/5">
                                <div className="mb-6 flex items-baseline gap-2">
                                    <span className="text-3xl font-bold">{attraction.entrance_fee || "Free"}</span>
                                    <span className="text-sm text-muted-foreground">/ person</span>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-muted/50 text-sm space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Opening Hours:</span>
                                            <span className="font-medium">{attraction.opening_hours}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Status:</span>
                                            <Badge variant="outline" className="text-[10px] py-0">Open Today</Badge>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-3 rounded-2xl border border-border">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <div className="flex-1">
                                            <p className="text-xs text-muted-foreground">Best Time to Visit</p>
                                            <p className="text-sm font-semibold">Morning (8 AM - 10 AM)</p>
                                        </div>
                                    </div>
                                </div>

                                <Button 
                                    className="w-full h-12 text-base font-bold rounded-2xl mb-3 shadow-lg shadow-primary/20"
                                    onClick={() => navigate(`/trips/new?destination=${encodeURIComponent(attraction.name)}`)}
                                >
                                    Plan Trip with Trip Management
                                </Button>
                                <Button variant="outline" className="w-full h-12 rounded-2xl">
                                    Explore Nearby Hotels
                                </Button>

                                <p className="mt-4 text-center text-xs text-muted-foreground px-4">
                                    Instant confirmation • Customizable itinerary • Local expert guides available
                                </p>
                            </div>

                            {/* Social Actions */}
                            <div className="flex gap-4">
                                <Button 
                                    variant="outline" 
                                    className="flex-1 gap-2 rounded-2xl"
                                    onClick={() => setShareOpen(true)}
                                >
                                    <Share2 className="h-4 w-4" /> Share
                                </Button>
                                <Button variant="outline" className="flex-1 gap-2 rounded-2xl">
                                    <Heart className="h-4 w-4" /> Save
                                </Button>
                            </div>

                            {/* Help box */}
                            <div className="p-6 rounded-3xl bg-emerald-900 text-white">
                                <h4 className="font-bold mb-2 flex items-center gap-2">
                                    <MapIcon className="h-5 w-5" /> Need Assistance?
                                </h4>
                                <p className="text-emerald-100/70 text-sm mb-4">
                                    Our local experts can help you plan the perfect trip to {attraction.name}.
                                </p>
                                <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white border-0 rounded-xl">
                                    Chat with an Expert
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ShareDestination 
                open={shareOpen} 
                onOpenChange={setShareOpen} 
                destinationName={attraction.name}
                url={window.location.href}
            />
        </Layout>
    );
};

export default DestinationDetail;
