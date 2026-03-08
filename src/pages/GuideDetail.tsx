import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, MapPin, CheckCircle, Calendar, Loader, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { guidesService, Guide } from "@/services/guides";
import { bookingsService } from "@/services/bookings";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const GuideDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const [guide, setGuide] = useState<Guide | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        if (id) loadGuide();
    }, [id]);

    const loadGuide = async () => {
        try {
            setIsLoading(true);
            const data = await guidesService.getGuideById(id!);
            setGuide(data);
        } catch (error: any) {
            toast.error("Failed to load guide details");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleBookGuide = () => {
        if (!isAuthenticated) {
            toast.error("Please login to book a guide");
            navigate("/login");
            return;
        }

        if (!selectedDate) {
            toast.error("Please select a date");
            return;
        }

        navigate("/checkout", {
            state: {
                type: 'guide',
                id: guide!.id,
                name: guide!.name,
                date: selectedDate,
                guests: 1,
                price: guide!.hourly_rate,
                totalPrice: guide!.hourly_rate,
            },
        });
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container py-20 flex items-center justify-center">
                    <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
            </Layout>
        );
    }

    if (!guide) {
        return (
            <Layout>
                <div className="container py-20 text-center">
                    <h1 className="text-2xl font-bold mb-2">Guide not found</h1>
                    <p className="text-muted-foreground mb-4">The guide you're looking for doesn't exist.</p>
                    <Button onClick={() => navigate("/guides")}>Back to Guides</Button>
                </div>
            </Layout>
        );
    }

    const languages = guide.languages ? guide.languages.split(",").map(l => l.trim()) : [];
    const initials = guide.name.split(" ").map((n) => n[0]).join("");

    return (
        <Layout>
            <div className="bg-muted py-8">
                <div className="container">
                    {/* Breadcrumb */}
                    <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                        <Link to="/" className="hover:text-primary">Home</Link>
                        <span>/</span>
                        <Link to="/guides" className="hover:text-primary">Guides</Link>
                        <span>/</span>
                        <span className="text-foreground">{guide.name}</span>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Main Content */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Header Info */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                    <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-accent font-display text-4xl font-bold text-primary">
                                        {initials}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <h1 className="font-display text-3xl font-bold">{guide.name}</h1>
                                            <div className="flex flex-col items-start gap-1 sm:items-end">
                                                <div className="flex items-center gap-1">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                    <span className="font-bold text-primary">{Number(guide.rating || 0).toFixed(1)}</span>
                                                    {guide.reviews && (
                                                        <span className="text-xs text-primary/80">({guide.reviews.total_reviews} reviews)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {languages.map((l) => (
                                                <Badge key={l} variant="outline">{l}</Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* About Section */}
                            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <h2 className="font-display text-xl font-bold mb-4">About</h2>
                                <p className="text-muted-foreground leading-relaxed">{guide.bio || "Experienced local guide ready to show you around."}</p>

                                {guide.experience_years && (
                                    <div className="mt-4 flex items-center gap-2 text-muted-foreground">
                                        <CheckCircle className="h-4 w-4 text-success" />
                                        <span>{guide.experience_years} years of experience</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Booking Sidebar */}
                        <div className="space-y-6">
                            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-sm">
                                <div className="mb-6 flex items-end gap-2 border-b border-border pb-6">
                                    <span className="font-display text-4xl font-bold text-primary">GH₵{guide.hourly_rate}</span>
                                    <span className="text-muted-foreground mb-1">/ day</span>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium mb-1.5 block">Select Date</label>
                                        <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <input
                                                type="date"
                                                value={selectedDate}
                                                onChange={(e) => setSelectedDate(e.target.value)}
                                                className="w-full bg-transparent outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        size="lg"
                                        className="w-full mt-4"
                                        onClick={handleBookGuide}
                                        disabled={isBooking}
                                    >
                                        {isBooking ? "Booking..." : "Book This Guide"}
                                    </Button>
                                    <p className="text-center text-xs text-muted-foreground mt-4">You won't be charged yet</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default GuideDetail;
