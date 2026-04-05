import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Calendar, Hotel, MapPin, CreditCard, Star,
    Loader, ArrowLeft, Clock, Compass,
    Map, Plane, AlertCircle, CheckCircle2, XCircle,
    FileText, Users, Receipt, Info, Share2, Download
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingsService, Booking } from "@/services/bookings";
import { toast } from "sonner";
import ReviewDialog from "@/components/dashboard/ReviewDialog";
import ReceiptView from "@/components/dashboard/ReceiptView";

const statusIcons: Record<string, any> = {
    confirmed: { icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-50 border-emerald-100", label: "Confirmed" },
    pending: { icon: Clock, cls: "text-amber-500 bg-amber-50 border-amber-100", label: "Pending" },
    cancelled: { icon: XCircle, cls: "text-rose-500 bg-rose-50 border-rose-100", label: "Cancelled" },
    completed: { icon: CheckCircle2, cls: "text-blue-500 bg-blue-50 border-blue-100", label: "Completed" },
};

const BookingDetail = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [isBookingLoading, setIsBookingLoading] = useState(true);
    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);

    useEffect(() => {
        if (id) {
            loadBooking();
        }
    }, [id]);

    const loadBooking = async () => {
        setIsBookingLoading(true);
        try {
            const data = await bookingsService.getBookingById(id!);
            setBooking(data);
        } catch (error: unknown) {
            toast.error("Failed to load booking details");
            console.error(error);
        } finally {
            setIsBookingLoading(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!booking) return;
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            await bookingsService.cancelBooking(booking.id);
            toast.success("Booking cancelled successfully");
            loadBooking();
        } catch (error: unknown) {
            toast.error("Failed to cancel booking");
        }
    };

    if (isBookingLoading) {
        return (
        <DashboardLayout role={user?.role || "user"}>
                <div className="flex items-center justify-center py-20">
                    <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!booking) {
        return (
        <DashboardLayout role={user?.role || "user"}>
                <div className="text-center py-20 space-y-4">
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <AlertCircle className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h2 className="text-2xl font-bold">Booking Not Found</h2>
                    <p className="text-muted-foreground">The booking you are looking for does not exist or you don't have access.</p>
                    <Button asChild variant="outline">
                        <Link to="/dashboard/bookings">Back to My Bookings</Link>
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const statusConfig = statusIcons[booking.status] || statusIcons.pending;
    const StatusIcon = statusConfig.icon;

    return (
      <DashboardLayout role={user?.role || "user"}>
            <div className="max-w-7xl mx-auto space-y-8 pb-10 px-4 md:px-6">
                {/* Navigation & Header */}
                <div className="flex flex-col gap-4">
                    <button
                        onClick={() => navigate("/dashboard/bookings")}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
                    >
                        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                        Back to My Bookings
                    </button>

                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Badge variant="outline" className={`h-6 rounded-lg font-bold text-[10px] uppercase tracking-tight border-none ${statusConfig.cls}`}>
                                    <StatusIcon className="h-3 w-3 mr-1" /> {statusConfig.label}
                                </Badge>
                                <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">
                                    REF: #{booking.id.substring(0, 8).toUpperCase()}
                                </span>
                            </div>
                            <h2 className="font-display text-4xl font-bold tracking-tight text-slate-900">
                                {booking.service_name || "Accommodation/Service"}
                            </h2>
                            <p className="text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-primary" />
                                {booking.booking_type === 'hotel' ? 'Premium Stay in Ghana' : 'Verified Service in Ghana'}
                            </p>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex-wrap">
                            <Button 
                                className="rounded-xl px-6 h-12 gap-2 shadow-lg shadow-emerald/20 bg-emerald-600 hover:bg-emerald-700"
                                onClick={() => setIsReceiptOpen(true)}
                            >
                                <Download className="h-4 w-4" /> View Receipt
                            </Button>
                            {booking.status === "confirmed" && (
                                <Button variant="outline" className="text-destructive hover:bg-rose-50 border-rose-100 rounded-xl px-6 h-12" onClick={handleCancelBooking}>
                                    <XCircle className="h-4 w-4 mr-2" /> Cancel Booking
                                </Button>
                            )}
                            {booking.status === "completed" && !booking.review && (
                                <Button className="rounded-xl px-6 h-12 gap-2 shadow-lg shadow-primary/20" onClick={() => setIsReviewDialogOpen(true)}>
                                    <Star className="h-4 w-4" /> Write a Review
                                </Button>
                            )}
                            <Button variant="secondary" className="rounded-xl px-6 h-12 gap-2 bg-slate-100 text-slate-700 hover:bg-slate-200">
                                <Share2 className="h-4 w-4" /> Share
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Statistics Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Price", value: `GH₵ ${Number(booking.total_price).toLocaleString()}`, icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
                        { label: "Booked On", value: new Date(booking.created_at).toLocaleDateString(), icon: Calendar, color: "text-blue-600 bg-blue-50" },
                        { label: "Guests", value: `${booking.number_of_guests || 1} Travellers`, icon: Users, color: "text-purple-600 bg-purple-50" },
                        { label: "Status", value: booking.status.toUpperCase(), icon: Info, color: "text-orange-600 bg-orange-50" },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <Card key={i} className="border-none shadow-sm hover:shadow-md transition-all group">
                                <CardContent className="p-6">
                                    <div className={`h-12 w-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                    <p className="text-xl font-bold text-slate-900 mt-1">{stat.value}</p>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Info */}
                    <div className="md:col-span-2 space-y-8">
                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Info className="h-5 w-5 text-primary" /> Service Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-8 space-y-8">
                                <div className="grid sm:grid-cols-2 gap-8">
                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Booking Type</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${booking.booking_type === 'hotel' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                                {booking.booking_type === 'hotel' ? <Hotel className="h-5 w-5" /> : <Compass className="h-5 w-5" />}
                                            </div>
                                            <p className="font-semibold capitalize">{booking.booking_type}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Date Booked</p>
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <p className="font-semibold">{new Date(booking.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-slate-100 p-6 bg-slate-50/30">
                                    <div className="grid sm:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Check-in / Start</p>
                                                <p className="text-lg font-bold">
                                                    {booking.check_in_date ? new Date(booking.check_in_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                                </p>
                                            </div>
                                            {booking.number_of_guests && (
                                                <div className="flex items-center gap-2 text-sm">
                                                    <Users className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{booking.number_of_guests} Guests</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1 text-right sm:text-left">
                                                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Check-out / End</p>
                                                <p className="text-lg font-bold">
                                                    {booking.check_out_date ? new Date(booking.check_out_date).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                                                </p>
                                            </div>
                                            {booking.room_type && (
                                                <div className="flex items-center gap-2 text-sm justify-end sm:justify-start">
                                                    <Hotel className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{booking.room_type}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {booking.special_requests && (
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <FileText className="h-3.5 w-3.5" /> Special Requests
                                        </p>
                                        <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100/50 text-sm italic text-slate-700">
                                            "{booking.special_requests}"
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border-none shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" /> Location
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="h-64 bg-slate-200 relative">
                                    {/* Placeholder for real map */}
                                    <div className="absolute inset-0 flex items-center justify-center flex-col gap-2">
                                        <Map className="h-10 w-10 text-slate-400" />
                                        <p className="text-slate-500 font-medium">Map View for {booking.service_name}</p>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <p className="text-sm font-medium flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-primary" /> Ghana, West Africa
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-lg bg-primary text-white overflow-hidden">
                            <CardHeader className="pb-2 border-b border-white/10">
                                <CardTitle className="text-sm uppercase tracking-widest opacity-80 flex items-center gap-2">
                                    <Receipt className="h-4 w-4" /> Price Breakdown
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between items-end">
                                    <p className="text-xs opacity-80 uppercase font-bold tracking-tight">Total Price</p>
                                    <p className="text-3xl font-bold italic">GH₵ {Number(booking.total_price).toLocaleString()}</p>
                                </div>

                                <div className="h-px bg-white/10" />

                                <div className="space-y-2 text-sm opacity-90">
                                    <div className="flex justify-between">
                                        <span>Base Rate</span>
                                        <span>GH₵ {(Number(booking.total_price) * 0.85).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Taxes \u0026 Fees</span>
                                        <span>GH₵ {(Number(booking.total_price) * 0.15).toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className={`rounded-xl px-4 py-3 flex items-center justify-between text-xs font-bold ${booking.payment?.status === 'completed' ? 'bg-emerald-400/20 text-emerald-100' : 'bg-amber-400/20 text-amber-100'}`}>
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Payment {booking.payment?.status || 'Pending'}
                                        </div>
                                        <span className="uppercase tracking-widest">{booking.payment?.id ? `#${booking.payment.id.substring(0, 6)}` : 'AWAITING'}</span>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter className="bg-white/5 p-4 flex justify-center">
                                <button className="text-xs font-bold uppercase tracking-widest hover:underline flex items-center gap-1.5 transition-all">
                                    Download Invoice <ArrowLeft className="h-3 w-3 rotate-180" />
                                </button>
                            </CardFooter>
                        </Card>

                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-primary" /> Important Info
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="text-xs space-y-4 text-muted-foreground leading-relaxed">
                                <p>• Cancellation policy for this booking: Full refund available if cancelled 48 hours before check-in.</p>
                                <p>• Please present your digital ID and booking reference number upon arrival at {booking.service_name}.</p>
                                <p>• Check-in time is usually after 2:00 PM, and check-out is before 11:00 AM.</p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <ReviewDialog
                    isOpen={isReviewDialogOpen}
                    onClose={() => setIsReviewDialogOpen(false)}
                    bookingId={booking.id}
                    serviceName={booking.service_name || "Accommodation/Service"}
                    onSuccess={loadBooking}
                />

                {isReceiptOpen && booking && (
                    <ReceiptView
                        booking={booking}
                        onClose={() => setIsReceiptOpen(false)}
                    />
                )}
            </div>
        </DashboardLayout>
    );
};

export default BookingDetail;
