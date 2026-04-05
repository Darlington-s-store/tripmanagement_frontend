import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plane,
  MapPin,
  Plus,
  Share2,
  Trash2,
  Loader,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { tripsService, Trip } from "@/services/trips";
import { toast } from "sonner";
import { formatDate, getValidDate, formatCurrency, getTripDurationDays, formatTripDate } from "@/utils/date";

const statusConfig: Record<string, { label: string; cls: string }> = {
  planning: { label: "Planning", cls: "border-primary/20 bg-primary/10 text-primary" },
  ongoing: { label: "Ongoing", cls: "border-emerald-200 bg-emerald-100 text-emerald-700" },
  completed: { label: "Completed", cls: "border-border bg-muted text-muted-foreground" },
  cancelled: { label: "Cancelled", cls: "border-destructive/20 bg-destructive/10 text-destructive" },
};

const getDaysUntilTrip = (startDate: string) => {
  const start = getValidDate(startDate);
  if (!start) return 0;
  return Math.ceil((start.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
};

const UserItineraries = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "planning" | "ongoing" | "completed">("all");

  useEffect(() => {
    void loadTrips();
  }, []);

  const loadTrips = async () => {
    setIsLoading(true);

    try {
      const data = await tripsService.getUserTrips();
      setTrips(data);
    } catch {
      toast.error("Failed to load trips");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (tripId: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!window.confirm("Delete this trip?")) return;

    try {
      await tripsService.deleteTrip(tripId);
      toast.success("Trip deleted");
      setTrips((currentTrips) => currentTrips.filter((trip) => trip.id !== tripId));
    } catch {
      toast.error("Failed to delete trip");
    }
  };

  const handleShare = async (trip: Trip, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    try {
      await navigator.clipboard.writeText(`${window.location.origin}/trips/${trip.id}`);
      toast.success("Trip link copied");
    } catch {
      toast.error("Couldn't copy the trip link");
    }
  };

  const filteredTrips = [...trips]
    .filter((trip) => filter === "all" || trip.status === filter)
    .sort(
      (left, right) =>
        new Date(right.created_at || right.start_date).getTime() -
        new Date(left.created_at || left.start_date).getTime(),
    );

  const upcomingTrips = trips.filter((trip) => new Date(trip.start_date) > new Date() && trip.status !== "cancelled");
  const completedTrips = trips.filter((trip) => trip.status === "completed");
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budget || 0), 0);

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
      <div className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Trips</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Review the trips you have already planned and start a new one whenever you want.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" asChild>
              <Link to="/destinations">
                <MapPin className="mr-1.5 h-4 w-4" />
                Explore
              </Link>
            </Button>
            <Button asChild>
              <Link to="/trips/new">
                <Plus className="mr-1.5 h-4 w-4" />
                New Trip
              </Link>
            </Button>
          </div>
        </div>

        {trips.length > 0 && (
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-y border-border py-3 text-sm">
            <p className="text-muted-foreground">
              Total trips: <span className="font-medium text-foreground">{trips.length}</span>
            </p>
            <p className="text-muted-foreground">
              Upcoming: <span className="font-medium text-foreground">{upcomingTrips.length}</span>
            </p>
            <p className="text-muted-foreground">
              Completed: <span className="font-medium text-foreground">{completedTrips.length}</span>
            </p>
            <p className="text-muted-foreground">
              Total budget: <span className="font-medium text-foreground">{formatCurrency(totalBudget)}</span>
            </p>
          </div>
        )}

        {trips.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(["all", "planning", "ongoing", "completed"] as const).map((value) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={`rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors ${
                  filter === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        )}

        {trips.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Plane className="h-8 w-8" />
            </div>
            <h2 className="mb-1 text-lg font-semibold">No trips yet</h2>
            <p className="mx-auto mb-6 max-w-xs text-sm text-muted-foreground">
              Start planning your Ghana adventure today. Your saved trips will appear here once you create them.
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" asChild>
                <Link to="/destinations">
                  <Sparkles className="mr-1.5 h-4 w-4" />
                  Find Inspiration
                </Link>
              </Button>
              <Button asChild>
                <Link to="/trips/new">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Plan a Trip
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <section className="space-y-4">
            <div className="flex flex-col gap-1">
              <h2 className="text-xl font-semibold tracking-tight">Saved trips</h2>
              <p className="text-sm text-muted-foreground">
                Open any saved trip to review or edit it. Use the new trip button to start another one.
              </p>
            </div>

            <div className="border-t border-border">
              {filteredTrips.map((trip) => {
                const tripTitle = trip.trip_name || trip.destination;
                const status = statusConfig[trip.status] || statusConfig.planning;
                const tripDays = getTripDurationDays(trip.start_date, trip.end_date);
                const daysUntilTrip = getDaysUntilTrip(trip.start_date);
                const isUpcoming = daysUntilTrip > 0 && trip.status !== "cancelled";

                return (
                  <Link
                    key={trip.id}
                    to={`/trips/${trip.id}`}
                    className="group block border-b border-border py-5 transition-colors hover:bg-muted/20"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="space-y-3 xl:max-w-sm">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
                            {tripTitle}
                          </h3>
                          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${status.cls}`}>
                            {status.label}
                          </span>
                        </div>

                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" />
                          {trip.destination}
                        </p>

                        {isUpcoming && (
                          <p className="text-xs font-medium text-primary">
                            Starts in {daysUntilTrip} day{daysUntilTrip !== 1 ? "s" : ""}
                          </p>
                        )}
                      </div>

                      <div className="grid flex-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Dates</p>
                          <p className="mt-1 font-medium">
                            {formatDate(trip.start_date, "MMM dd")} - {formatDate(trip.end_date, "MMM dd, yyyy")}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Duration</p>
                          <p className="mt-1 font-medium">
                            {tripDays} day{tripDays !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget</p>
                          <p className="mt-1 font-medium">{formatCurrency(trip.budget)}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
                          <p className="mt-1 font-medium">{status.label}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground"
                        onClick={(event) => handleShare(trip, event)}
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-muted-foreground hover:text-destructive"
                        onClick={(event) => handleDelete(trip.id, event)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                      <span className="ml-auto inline-flex items-center gap-1 font-medium text-primary">
                        Open trip
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filteredTrips.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No trips match this filter. You can still use New Trip to plan another one.
              </p>
            )}
          </section>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserItineraries;
