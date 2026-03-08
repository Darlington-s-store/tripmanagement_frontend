import { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { tripsService, Trip } from "@/services/trips";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  ArrowLeft, Calendar, MapPin, Users, DollarSign, Clock,
  Plane, Edit, Trash2, Hotel, Car, Star, Share2, FileText, CheckCircle2
} from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-blue-100 text-blue-700",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100 text-gray-700",
  cancelled: "bg-red-100 text-red-700",
};

const activityTypeColors: Record<string, { cls: string; icon: React.ReactNode }> = {
  attraction: { cls: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: <Star className="h-3 w-3" /> },
  hotel: { cls: "bg-blue-100 text-blue-700 border-blue-200", icon: <Hotel className="h-3 w-3" /> },
  transport: { cls: "bg-orange-100 text-orange-700 border-orange-200", icon: <Car className="h-3 w-3" /> },
  food: { cls: "bg-rose-100 text-rose-700 border-rose-200", icon: <span className="text-xs">🍽</span> },
  other: { cls: "bg-gray-100 text-gray-600 border-gray-200", icon: <Clock className="h-3 w-3" /> },
};

function parseActivities(activitiesText: string) {
  if (!activitiesText) return [];
  return activitiesText.split("\n").filter(Boolean).map((line, idx) => {
    const match = line.match(/^\[(\w+)\]\s*(?:(.+?):\s*)?(.+)$/);
    if (match) {
      return { id: String(idx), type: match[1].toLowerCase(), time: match[2] || "", title: match[3] };
    }
    return { id: String(idx), type: "other", time: "", title: line };
  });
}

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated && id) loadTrip();
  }, [isLoading, isAuthenticated, id]);

  const loadTrip = async () => {
    try {
      setIsLoadingTrip(true);
      const data = await tripsService.getTripById(id!);
      setTrip(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load trip");
    } finally {
      setIsLoadingTrip(false);
    }
  };

  const handleDelete = async () => {
    if (!trip) return;
    if (!window.confirm("Delete this trip? This action cannot be undone.")) return;
    try {
      await tripsService.deleteTrip(trip.id);
      toast.success("Trip deleted");
      navigate("/dashboard/itineraries");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete trip");
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Trip link copied to clipboard!");
  };

  const changeTripStatus = async (newStatus: string) => {
    if (!trip) return;
    try {
      await tripsService.updateTrip(trip.id, undefined, undefined, undefined, undefined, undefined, newStatus);
      setTrip({ ...trip, status: newStatus as any });
      toast.success(`Trip marked as ${newStatus}`);
    } catch (err: any) {
      toast.error("Failed to update status");
    }
  };

  if (isLoading || isLoadingTrip) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!trip) {
    return (
      <DashboardLayout role="user">
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">Trip not found</h2>
          <Button onClick={() => navigate("/dashboard/itineraries")}>Back to Trips</Button>
        </div>
      </DashboardLayout>
    );
  }

  const tripDays = Array.isArray(trip.itineraries) ? [...trip.itineraries].sort((a, b) => a.day_number - b.day_number) : [];
  const budget = trip.budget ? parseFloat(String(trip.budget)) : null;
  const bookings = Array.isArray(trip.bookings) ? trip.bookings : [];
  const totalBookingSpend = bookings.reduce((s, b) => s + parseFloat(String(b.total_price || 0)), 0) || 0;
  const budgetRemaining = budget ? budget - totalBookingSpend : null;
  const numDays = trip.start_date && trip.end_date
    ? Math.ceil((new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)) + 1
    : null;

  return (
    <DashboardLayout role="user">
      <div className="max-w-4xl mx-auto">
        {/* Back nav */}
        <button
          onClick={() => navigate("/dashboard/itineraries")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Trips
        </button>

        {/* Trip Hero Header */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900 via-teal-800 to-cyan-900 p-8 text-white">
          <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1000')] bg-cover bg-center" />
          <div className="relative">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColors[trip.status] || "bg-white/20 text-white"}`}>
                    {trip.status}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold mb-1">{trip.destination}</h1>
                {trip.description && <p className="text-white/80 text-sm max-w-lg mt-1">{trip.description}</p>}
                <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-white/90">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {new Date(trip.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} – {new Date(trip.end_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                  {numDays && <div className="flex items-center gap-1.5"><Clock className="h-4 w-4" />{numDays} days</div>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Share2 className="h-4 w-4" /> Share
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate(`/trips/new?edit=${trip.id}`)} className="gap-1.5 bg-white/10 border-white/20 text-white hover:bg-white/20">
                  <Edit className="h-4 w-4" /> Edit
                </Button>
                <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1.5 bg-red-500/80 hover:bg-red-600">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main content */}
          <div className="md:col-span-2 space-y-6">

            {/* Itinerary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Calendar className="h-5 w-5 text-primary" /> Daily Itinerary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {tripDays.length === 0 ? (
                  <div className="py-8 text-center">
                    <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
                    <p className="text-muted-foreground text-sm">No itinerary days planned yet.</p>
                    <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => navigate(`/trips/new`)}>
                      <Edit className="h-4 w-4" /> Edit Trip to Add Days
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    {/* vertical timeline line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
                    <div className="space-y-6 pl-10">
                      {tripDays.map((day) => {
                        const activities = parseActivities(day.activities || "");
                        const dayDate = new Date(trip.start_date);
                        dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
                        return (
                          <div key={day.day_number} className="relative">
                            {/* Circle on timeline */}
                            <div className="absolute -left-[38px] flex h-7 w-7 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary">
                              {day.day_number}
                            </div>
                            <div>
                              <div className="mb-2">
                                <p className="font-semibold">Day {day.day_number}</p>
                                <p className="text-xs text-muted-foreground">{dayDate.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</p>
                              </div>
                              {activities.length > 0 ? (
                                <div className="space-y-1.5">
                                  {activities.map((act) => {
                                    const typeInfo = activityTypeColors[act.type] || activityTypeColors.other;
                                    return (
                                      <div key={act.id} className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${typeInfo.cls}`}>
                                        {typeInfo.icon}
                                        {act.time && <span className="text-xs opacity-70 shrink-0">{act.time}</span>}
                                        <span className="flex-1">{act.title}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">{day.activities || "No activities scheduled"}</p>
                              )}
                              {day.notes && (
                                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-muted/50 p-2 text-xs text-muted-foreground">
                                  <FileText className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                                  {day.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Linked Bookings */}
            {bookings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-primary" /> Booked Services
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                      <div>
                        <p className="font-semibold capitalize">{booking.service_name || booking.booking_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                          {booking.check_out_date ? ` – ${new Date(booking.check_out_date).toLocaleDateString()}` : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">GH₵ {parseFloat(String(booking.total_price)).toFixed(2)}</p>
                        <Badge variant={booking.status === "confirmed" ? "default" : "secondary"} className="text-xs">
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Budget card */}
            {budget && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" /> Budget</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-primary">GH₵ {budget.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total budget</p>
                  </div>
                  {totalBookingSpend > 0 && (
                    <>
                      <div className="h-px bg-border" />
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spent (bookings)</span>
                          <span className="font-semibold text-destructive">GH₵ {totalBookingSpend.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-semibold ${(budgetRemaining || 0) < 0 ? "text-destructive" : "text-emerald-600"}`}>
                            GH₵ {(budgetRemaining || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                      {/* Progress bar */}
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (totalBookingSpend / budget) * 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">{((totalBookingSpend / budget) * 100).toFixed(0)}% used</p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Quick actions */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => navigate("/hotels")}>
                  <Hotel className="h-4 w-4" /> Browse Hotels
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => navigate("/attractions")}>
                  <Star className="h-4 w-4" /> Explore Attractions
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => navigate("/guides")}>
                  <Users className="h-4 w-4" /> Find Tour Guides
                </Button>
                <Button variant="outline" className="w-full gap-2 justify-start" onClick={() => navigate("/transport")}>
                  <Car className="h-4 w-4" /> Book Transport
                </Button>
              </CardContent>
            </Card>

            {/* Status change */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Plane className="h-4 w-4 text-primary" /> Trip Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {(["planning", "ongoing", "completed", "cancelled"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => changeTripStatus(s)}
                    className={`w-full rounded-lg px-3 py-2 text-sm text-left capitalize transition-all font-medium ${trip.status === s ? statusColors[s] + " ring-2 ring-current" : "bg-muted/50 hover:bg-muted"
                      }`}
                  >
                    {s}
                  </button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
