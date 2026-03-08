import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plane, Calendar, DollarSign, MapPin, Plus, Share2, Trash2, Loader,
  Clock, ArrowRight, Sparkles, Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { tripsService, Trip } from "@/services/trips";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; cls: string }> = {
  planning: { label: "Planning", cls: "bg-blue-100 text-blue-700" },
  ongoing: { label: "Ongoing", cls: "bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", cls: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", cls: "bg-red-100 text-red-700" },
};

const gradients = [
  "from-emerald-500 to-teal-600",
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-indigo-600",
  "from-orange-500 to-amber-600",
  "from-rose-500 to-pink-600",
];

const UserItineraries = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "planning" | "ongoing" | "completed">("all");

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);
    try {
      const data = await tripsService.getUserTrips();
      setTrips(data);
    } catch (error: any) {
      toast.error("Failed to load trips");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tripId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this trip?")) return;
    try {
      await tripsService.deleteTrip(tripId);
      toast.success("Trip deleted");
      setTrips(trips.filter((t) => t.id !== tripId));
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const handleShare = async (trip: Trip, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}`);
    toast.success("Trip link copied!");
  };

  const calcDays = (s: string, e: string) =>
    Math.max(1, Math.ceil((new Date(e).getTime() - new Date(s).getTime()) / (1000 * 60 * 60 * 24)) + 1);

  const filteredTrips = trips.filter((t) => filter === "all" || t.status === filter);

  const upcoming = trips.filter((t) => new Date(t.start_date) > new Date() && t.status !== "cancelled");
  const past = trips.filter((t) => new Date(t.end_date) < new Date());

  if (isLoading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">My Trips</h2>
            <p className="text-sm text-muted-foreground">{trips.length} trip{trips.length !== 1 ? "s" : ""} planned</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/destinations"><MapPin className="h-4 w-4 mr-1.5" /> Explore</Link>
            </Button>
            <Button asChild>
              <Link to="/trips/new"><Plus className="h-4 w-4 mr-1.5" /> Plan a Trip</Link>
            </Button>
          </div>
        </div>

        {/* Stats row */}
        {trips.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Trips", value: trips.length, icon: Plane, color: "text-primary" },
              { label: "Upcoming", value: upcoming.length, icon: Calendar, color: "text-blue-500" },
              { label: "Completed", value: past.length, icon: Clock, color: "text-emerald-500" },
              {
                label: "Total Budget",
                value: `GH₵ ${trips.reduce((s, t) => s + parseFloat(String(t.budget || 0)), 0).toLocaleString()}`,
                icon: DollarSign,
                color: "text-amber-500",
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-muted ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-lg font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Filter tabs */}
        {trips.length > 0 && (
          <div className="flex gap-2">
            {(["all", "planning", "ongoing", "completed"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-all ${filter === f ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {f}
              </button>
            ))}
          </div>
        )}

        {/* Trip cards */}
        {filteredTrips.length === 0 && trips.length > 0 && (
          <p className="text-center text-muted-foreground py-8">No trips match this filter.</p>
        )}

        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mx-auto mb-4">
              <Plane className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-semibold mb-1">No trips yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-6">
              Start planning your Ghana adventure today. Discover destinations, build itineraries, and manage bookings.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" asChild>
                <Link to="/destinations"><Sparkles className="h-4 w-4 mr-1.5" /> Find Inspiration</Link>
              </Button>
              <Button asChild>
                <Link to="/trips/new"><Plus className="h-4 w-4 mr-1.5" /> Plan a Trip</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTrips.map((trip, idx) => {
              const days = calcDays(trip.start_date, trip.end_date);
              const st = statusConfig[trip.status] || statusConfig.planning;
              const isUpcoming = new Date(trip.start_date) > new Date();
              const isPast = new Date(trip.end_date) < new Date();
              const grad = gradients[idx % gradients.length];

              return (
                <Link
                  key={trip.id}
                  to={`/trips/${trip.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  {/* Color top bar */}
                  <div className={`h-2 w-full bg-gradient-to-r ${grad}`} />
                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white`}>
                        <Plane className="h-5 w-5" />
                      </div>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </div>
                    <h3 className="font-display text-lg font-bold leading-snug mb-1 group-hover:text-primary transition-colors">
                      {trip.destination}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="h-3 w-3" /> {trip.destination}
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{days} days</div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(trip.start_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                      {trip.budget && (
                        <div className="flex items-center gap-1 text-primary font-medium">
                          <DollarSign className="h-3.5 w-3.5" /> GH₵ {parseFloat(String(trip.budget)).toLocaleString()}
                        </div>
                      )}
                    </div>

                    {isUpcoming && (
                      <div className="mb-3 rounded-lg bg-blue-50 border border-blue-100 px-3 py-1.5 text-xs text-blue-700 font-medium">
                        📅 Departing in {Math.ceil((new Date(trip.start_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                      </div>
                    )}

                    <div className="mt-auto flex items-center gap-2 pt-3 border-t border-border">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={(e) => handleShare(trip, e)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={(e) => handleDelete(trip.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" className="ml-auto gap-1.5 h-8 text-xs">
                        <Eye className="h-3.5 w-3.5" /> View <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserItineraries;
