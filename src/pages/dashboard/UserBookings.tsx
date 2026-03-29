import { useEffect, useState } from "react";
import {
  Calendar, Hotel, MapPin, CreditCard, Star,
  Loader, Search, ArrowUpRight, Clock, Map, Plane, Compass,
  AlertCircle, CheckCircle2, XCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { bookingsService, Booking } from "@/services/bookings";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusIcons: Record<string, any> = {
  confirmed: { icon: CheckCircle2, cls: "text-emerald-500 bg-emerald-50 border-emerald-100", label: "Confirmed" },
  pending: { icon: Clock, cls: "text-amber-500 bg-amber-50 border-amber-100", label: "Pending" },
  cancelled: { icon: XCircle, cls: "text-rose-500 bg-rose-50 border-rose-100", label: "Cancelled" },
  completed: { icon: CheckCircle2, cls: "text-blue-500 bg-blue-50 border-blue-100", label: "Completed" },
};

const UserBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await bookingsService.getUserBookings();
      setBookings(data);
    } catch (error: any) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await bookingsService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully");
      loadBookings();
    } catch (error: any) {
      toast.error("Failed to cancel booking");
    }
  };

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter);

  if (isLoading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">My Bookings</h2>
            <p className="text-muted-foreground mt-1">Manage your hotel stays and tour reservations across Ghana.</p>
          </div>
          <Button asChild className="gap-2 rounded-xl h-12 px-6">
            <Link to="/hotels">
              <Search className="h-4 w-4" /> New Booking
            </Link>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 rounded-2xl bg-muted/30 w-fit">
          {(["all", "confirmed", "pending", "completed", "cancelled"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl px-4 py-2 text-sm font-medium capitalize transition-all ${filter === f ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {bookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mb-6">
              <Calendar className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-bold mb-2">No bookings found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              You haven't made any bookings yet. Start your adventure by exploring our curated hotels and tours.
            </p>
            <Button asChild className="gap-2">
              <Link to="/hotels">Explore Ghana</Link>
            </Button>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground italic">
            No {filter} bookings found.
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredBookings.map((b) => {
              const config = statusIcons[b.status] || statusIcons.pending;
              const StatusIcon = config.icon;

              return (
                <Card key={b.id} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    {/* Left Side: Type Icon */}
                    <div className={`p-8 md:p-10 flex flex-col items-center justify-center gap-3 ${b.booking_type === 'hotel' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {b.booking_type === 'hotel' ? <Hotel className="h-10 w-10" /> : <Compass className="h-10 w-10" />}
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{b.booking_type}</span>
                    </div>

                    {/* Right Side: Details */}
                    <CardContent className="flex-1 p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge variant="outline" className={`h-6 rounded-lg font-bold text-[10px] uppercase tracking-tight border-none ${config.cls}`}>
                            <StatusIcon className="h-3 w-3 mr-1" /> {config.label}
                          </Badge>
                          <span className="text-[11px] font-mono text-muted-foreground">REF: #{b.id.substring(0, 8).toUpperCase()}</span>
                        </div>
                        <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                          {b.service_name || "Accommodation/Service"}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                          {b.room_type && (
                            <div className="flex items-center gap-1.5">
                              <Hotel className="h-3.5 w-3.5" /> {b.room_type}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-primary font-bold">
                            <CreditCard className="h-3.5 w-3.5" /> GH₵ {Number(b.total_price).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 md:border-l border-slate-100 md:pl-8">
                        <Button variant="outline" size="sm" asChild className="rounded-xl h-10 px-4">
                          <Link to={`/dashboard/bookings/${b.id}`}>View Details</Link>
                        </Button>
                        {b.status === "confirmed" && (
                          <Button variant="ghost" size="sm" onClick={() => handleCancelBooking(b.id)} className="h-10 px-4 text-destructive hover:bg-rose-50 rounded-xl">
                            Cancel
                          </Button>
                        )}
                        {b.status === "completed" && (
                          <Button size="sm" className="rounded-xl h-10 px-4 gap-1.5">
                            <Star className="h-3.5 w-3.5" /> Review
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary-600 p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Map className="h-8 w-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Plan Your Next Escape</h3>
              <p className="text-white/80">Need help discovering the hidden gems of Ghana?</p>
            </div>
          </div>
          <Button asChild variant="secondary" className="rounded-xl h-11 px-8 font-bold bg-white text-primary border-none hover:bg-white/90">
            <Link to="/destinations">Find Inspiration</Link>
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserBookings;
