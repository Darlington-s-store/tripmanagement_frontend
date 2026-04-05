import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { tripsService, Trip } from "@/services/trips";
import { 
  getValidDate, 
  formatDate, 
  formatDateRange, 
  formatBookingRange,
  formatCurrency,
  formatNumber
} from "@/utils/date";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { normalizeTripPlanning } from "@/lib/trip-planning";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Clock,
  Plane,
  Edit,
  Trash2,
  Hotel,
  Car,
  Star,
  Share2,
  FileText,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";

const statusColors: Record<string, string> = {
  planning: "bg-primary/10 text-primary",
  ongoing: "bg-emerald-100 text-emerald-700",
  completed: "bg-muted text-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

const activityTypeStyles: Record<string, { cls: string; icon: ReactNode; label: string }> = {
  attraction: {
    cls: "border-primary/20 bg-primary/5 text-primary",
    icon: <Star className="h-3 w-3" />,
    label: "Attraction",
  },
  hotel: {
    cls: "border-border bg-secondary text-secondary-foreground",
    icon: <Hotel className="h-3 w-3" />,
    label: "Hotel",
  },
  transport: {
    cls: "border-primary/20 bg-primary/10 text-primary",
    icon: <Car className="h-3 w-3" />,
    label: "Transport",
  },
  food: {
    cls: "border-border bg-secondary text-secondary-foreground",
    icon: <UtensilsCrossed className="h-3 w-3" />,
    label: "Food",
  },
  other: {
    cls: "border-border bg-muted text-muted-foreground",
    icon: <Clock className="h-3 w-3" />,
    label: "Other",
  },
};

interface ParsedDescription {
  summary: string;
  transit: {
    mode?: string;
    provider?: string;
    ref?: string;
  };
  preferences: {
    style?: string;
    stay?: string;
  };
  interests: string[];
  wishlist: {
    attractions?: string;
    hotels?: string;
    transport?: string;
  };
  extra: string[];
}

function parseActivities(activitiesText: string) {
  if (!activitiesText) return [];

  return activitiesText
    .split("\n")
    .filter(Boolean)
    .map((line, index) => {
      const match = line.match(/^\[(\w+)\]\s*(?:(.+?):\s*)?(.+?)(?:\s*@\s*(.+))?$/);

      if (match) {
        return {
          id: String(index),
          type: match[1].toLowerCase(),
          time: match[2] || "",
          title: match[3],
          location: match[4] || "",
        };
      }

      return { id: String(index), type: "other", time: "", title: line, location: "" };
    });
}

function parsePipeFields(line: string) {
  return line
    .split("|")
    .map((part) => part.trim())
    .reduce<Record<string, string>>((accumulator, part) => {
      const [key, ...rest] = part.split(":");

      if (rest.length === 0) return accumulator;

      accumulator[key.trim().toLowerCase()] = rest.join(":").trim();
      return accumulator;
    }, {});
}

function parseTripDescription(description?: string): ParsedDescription {
  const result: ParsedDescription = {
    summary: "",
    transit: {},
    preferences: {},
    interests: [],
    wishlist: {},
    extra: [],
  };

  if (!description) return result;

  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  for (const line of lines) {
    if (line === "--- PRIMARY TRANSIT ---" || line === "--- TRIP PREFERENCES ---") {
      continue;
    }

    if (line.startsWith("Mode:")) {
      const fields = parsePipeFields(line);
      result.transit = {
        mode: fields.mode,
        provider: fields.provider,
        ref: fields.ref,
      };
      continue;
    }

    if (line.startsWith("Style:")) {
      const fields = parsePipeFields(line);
      result.preferences = {
        style: fields.style,
        stay: fields.stay,
      };
      continue;
    }

    if (line.startsWith("Interests:")) {
      result.interests = line
        .replace("Interests:", "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      continue;
    }

    if (line.startsWith("Attractions Wishlist:")) {
      result.wishlist.attractions = line.replace("Attractions Wishlist:", "").trim();
      continue;
    }

    if (line.startsWith("Hotel Wishlist:")) {
      result.wishlist.hotels = line.replace("Hotel Wishlist:", "").trim();
      continue;
    }

    if (line.startsWith("Transport Wishlist:")) {
      result.wishlist.transport = line.replace("Transport Wishlist:", "").trim();
      continue;
    }

    if (!result.summary) {
      result.summary = line;
    } else {
      result.extra.push(line);
    }
  }

  return result;
}

// Using centralized date and value utilities from src/utils/date.ts

export default function TripDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoadingTrip, setIsLoadingTrip] = useState(true);

  const loadTrip = useCallback(async () => {
    try {
      setIsLoadingTrip(true);
      const data = await tripsService.getTripById(id!);
      setTrip(data);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to load trip");
    } finally {
      setIsLoadingTrip(false);
    }
  }, [id]);

  useEffect(() => {
    if (!isLoading && isAuthenticated && id) {
      void loadTrip();
    }
  }, [id, isAuthenticated, isLoading, loadTrip]);

  const handleDelete = async () => {
    if (!trip) return;
    if (!window.confirm("Delete this trip? This action cannot be undone.")) return;

    try {
      await tripsService.deleteTrip(trip.id);
      toast.success("Trip deleted");
      navigate("/dashboard/trips");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete trip");
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Trip link copied to clipboard");
    } catch {
      toast.error("Couldn't copy the trip link");
    }
  };

  const changeTripStatus = async (newStatus: string) => {
    if (!trip) return;

    try {
      await tripsService.updateTrip(trip.id, { status: newStatus });
      setTrip({ ...trip, status: newStatus as Trip["status"] });
      toast.success(`Trip marked as ${newStatus}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (isLoading || isLoadingTrip) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  if (!trip) {
    return (
      <DashboardLayout role="user">
        <div className="py-20 text-center">
          <h2 className="mb-2 text-2xl font-bold">Trip not found</h2>
          <Button onClick={() => navigate("/dashboard/trips")}>Back to trips</Button>
        </div>
      </DashboardLayout>
    );
  }

  const tripDays = Array.isArray(trip.itineraries)
    ? [...trip.itineraries].sort((a, b) => a.day_number - b.day_number)
    : [];
  const bookings = Array.isArray(trip.bookings) ? trip.bookings : [];
  const budget = trip.budget ? Number.parseFloat(String(trip.budget)) : null;
  const totalBookingSpend = bookings.reduce((sum, booking) => sum + Number.parseFloat(String(booking.total_price || 0)), 0) || 0;
  const budgetRemaining = budget !== null ? budget - totalBookingSpend : null;
  const startDateWindow = getValidDate(trip.start_date);
  const endDateWindow = getValidDate(trip.end_date);
  const numDays =
    startDateWindow && endDateWindow
      ? Math.max(1, Math.ceil((endDateWindow.getTime() - startDateWindow.getTime()) / (1000 * 60 * 60 * 24)) + 1)
      : null;
  const maxStoredDay = tripDays.length > 0 ? Math.max(...tripDays.map((day) => day.day_number)) : 0;
  const renderedTripDays =
    Math.max(numDays || 0, maxStoredDay) > 0
      ? Array.from({ length: Math.max(numDays || 0, maxStoredDay) }, (_, index) => {
          const dayNumber = index + 1;
          return (
            tripDays.find((day) => day.day_number === dayNumber) || {
              id: `placeholder-${dayNumber}`,
              trip_id: trip.id,
              day_number: dayNumber,
              activities: "",
              notes: "",
            }
          );
        })
      : [];
  const parsedDescription = normalizeTripPlanning(trip.planning_details, trip.description);
  const wishlistItems = [
    parsedDescription.wishlist.attractions ? `Attractions: ${parsedDescription.wishlist.attractions}` : null,
    parsedDescription.wishlist.hotels ? `Hotels: ${parsedDescription.wishlist.hotels}` : null,
    parsedDescription.wishlist.transport ? `Transport: ${parsedDescription.wishlist.transport}` : null,
  ].filter(Boolean) as string[];
  const tripTitle = trip.trip_name?.trim() || trip.destination;
  const headerDetails = [
    {
      label: "Dates",
      value: formatDateRange(startDateWindow, endDateWindow),
    },
    {
      label: "Duration",
      value: formatNumber(numDays, " days"),
    },
    {
      label: "Budget",
      value: formatCurrency(budget),
    },
    {
      label: "Travellers",
      value: formatNumber(trip.traveller_count),
    },
    {
      label: "Status",
      value: trip.status.charAt(0).toUpperCase() + trip.status.slice(1),
    },
  ];

  return (
    <DashboardLayout role="user">
      <div className="w-full space-y-8">
        <div className="space-y-4 border-b border-border pb-6">
          <button
            onClick={() => navigate("/dashboard/trips")}
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Trips
          </button>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-3">
              <Badge variant="outline" className={statusColors[trip.status] || "bg-muted text-foreground"}>
                {trip.status}
              </Badge>

              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">{tripTitle}</h1>
                {trip.trip_name?.trim() && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {trip.destination}
                  </p>
                )}
                {parsedDescription.summary && (
                  <p className="max-w-3xl text-sm text-muted-foreground">{parsedDescription.summary}</p>
                )}
                {parsedDescription.extra.length > 0 && (
                  <p className="max-w-3xl text-sm text-muted-foreground">{parsedDescription.extra.join(" ")}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/trips/new?edit=${trip.id}`)}
                className="gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-2">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-x-6 gap-y-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
            {headerDetails.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="font-medium">{item.value}</p>
              </div>
            ))}
          </div>

          {(parsedDescription.transit.mode ||
            parsedDescription.transit.notes ||
            parsedDescription.preferences.style ||
            parsedDescription.interests.length > 0 ||
            wishlistItems.length > 0) && (
            <div className="grid gap-4 border-t border-border pt-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">Primary transit</p>
                <p className="text-sm text-muted-foreground">
                  {parsedDescription.transit.mode || "Not set"}
                  {parsedDescription.transit.provider && parsedDescription.transit.provider !== "N/A"
                    ? ` | ${parsedDescription.transit.provider}`
                    : ""}
                  {parsedDescription.transit.ref && parsedDescription.transit.ref !== "N/A"
                    ? ` | ${parsedDescription.transit.ref}`
                    : ""}
                </p>
              </div>

              {parsedDescription.transit.notes && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Transit notes</p>
                  <p className="text-sm text-muted-foreground">{parsedDescription.transit.notes}</p>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-sm font-medium">Preferences</p>
                <p className="text-sm text-muted-foreground">
                  {parsedDescription.preferences.style || "Not set"}
                  {parsedDescription.preferences.stay && parsedDescription.preferences.stay !== "N/A"
                    ? ` | ${parsedDescription.preferences.stay}`
                    : ""}
                </p>
              </div>

              {parsedDescription.interests.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Interests</p>
                  <p className="text-sm text-muted-foreground">{parsedDescription.interests.join(", ")}</p>
                </div>
              )}

              {wishlistItems.length > 0 && (
                <div className="space-y-1">
                  <p className="text-sm font-medium">Wishlist</p>
                  <p className="text-sm text-muted-foreground">{wishlistItems.join(" | ")}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_340px]">
          <div className="space-y-8">
            <section className="space-y-4">
              <div className="flex flex-col gap-2 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Daily itinerary</h2>
                  <p className="text-sm text-muted-foreground">
                    {renderedTripDays.length > 0
                      ? `${renderedTripDays.length} day${renderedTripDays.length > 1 ? "s" : ""} planned`
                      : "No itinerary days yet"}
                  </p>
                </div>
              </div>

              {renderedTripDays.length === 0 ? (
                <div className="rounded-lg border border-dashed py-12 text-center">
                  <Calendar className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
                  <p className="text-sm text-muted-foreground">No itinerary days planned yet.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 gap-2"
                    onClick={() => navigate(`/trips/new?edit=${trip.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit trip to add days
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {renderedTripDays.map((day) => {
                    const activities = parseActivities(day.activities || "");
                    const dayDate = startDateWindow ? new Date(startDateWindow) : null;

                    if (dayDate) {
                      dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
                    }

                    return (
                      <div
                        key={day.day_number}
                        className="border-t border-border pt-6 first:border-t-0 first:pt-0"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="font-semibold">Day {day.day_number}</p>
                            {dayDate && (
                              <p className="text-sm text-muted-foreground">
                                 {formatDate(dayDate, "EEEE, d MMMM")}
                              </p>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {activities.length > 0
                              ? `${activities.length} item${activities.length > 1 ? "s" : ""}`
                              : "No scheduled activities"}
                          </p>
                        </div>

                        <div className="mt-4 space-y-3">
                          {activities.length > 0 ? (
                            activities.map((activity) => {
                              const typeInfo = activityTypeStyles[activity.type] || activityTypeStyles.other;

                              return (
                                <div
                                  key={activity.id}
                                  className="grid gap-3 rounded-lg border px-4 py-3 md:grid-cols-[120px_minmax(0,1fr)_auto]"
                                >
                                  <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                      {activity.time || "Unscheduled"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                                  </div>

                                  <div className="min-w-0">
                                    <p className="text-sm font-medium">{activity.title}</p>
                                    {activity.location && (
                                      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                        <MapPin className="h-3 w-3" />
                                        {activity.location}
                                      </p>
                                    )}
                                  </div>

                                  <Badge variant="outline" className={`h-fit gap-1 self-start border ${typeInfo.cls}`}>
                                    {typeInfo.icon}
                                    {typeInfo.label}
                                  </Badge>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-sm italic text-muted-foreground">
                              {day.activities || "No activities scheduled"}
                            </p>
                          )}
                        </div>

                        {day.notes && (
                          <div className="mt-4 border-l-2 border-primary/20 pl-4">
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                              <span>{day.notes}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {bookings.length > 0 && (
              <section className="space-y-4 border-t border-border pt-8">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">Booked services</h2>
                  <p className="text-sm text-muted-foreground">Linked bookings attached to this trip.</p>
                </div>

                <div className="space-y-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col gap-3 rounded-lg border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-semibold capitalize">
                          {booking.service_name || booking.booking_type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatBookingRange(booking.check_in_date, booking.check_out_date)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 sm:text-right">
                        <div>
                          <p className="font-semibold text-primary">
                            {formatCurrency(Number.parseFloat(String(booking.total_price || 0)))}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={statusColors[booking.status] || "bg-muted text-foreground"}
                        >
                          {booking.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-6">
            {(budget !== null || totalBookingSpend > 0) && (
              <section className="space-y-4 rounded-lg border p-5">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">Budget</h3>
                  <p className="text-sm text-muted-foreground">Current trip budget and spend.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Total budget</p>
                    <p className="text-2xl font-semibold text-primary">{formatCurrency(budget)}</p>
                  </div>

                  {totalBookingSpend > 0 && budget !== null && budget > 0 && (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Spent on bookings</span>
                          <span className="font-medium">{formatCurrency(totalBookingSpend)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-medium ${(budgetRemaining || 0) < 0 ? "text-destructive" : "text-emerald-600"}`}>
                            {formatCurrency(budgetRemaining)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(100, (totalBookingSpend / budget) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.min(100, (totalBookingSpend / budget) * 100).toFixed(0)}% of budget used
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </section>
            )}

            <section className="space-y-3 rounded-lg border p-5">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Quick actions</h3>
                <p className="text-sm text-muted-foreground">Useful next steps for this trip.</p>
              </div>

              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/hotels")}>
                <Hotel className="h-4 w-4" />
                Browse hotels
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/attractions")}
              >
                <Star className="h-4 w-4" />
                Explore attractions
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={() => navigate("/guides")}>
                <Users className="h-4 w-4" />
                Find tour guides
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={() => navigate("/transport")}
              >
                <Car className="h-4 w-4" />
                Book transport
              </Button>
            </section>

            <section className="space-y-3 rounded-lg border p-5">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Trip status</h3>
                <p className="text-sm text-muted-foreground">Update the trip stage when plans change.</p>
              </div>

              <div className="space-y-2">
                {(["planning", "ongoing", "completed", "cancelled"] as const).map((status) => {
                  const isCurrent = trip.status === status;

                  return (
                    <button
                      key={status}
                      onClick={() => changeTripStatus(status)}
                      className={`w-full rounded-lg border px-3 py-2 text-left text-sm font-medium capitalize transition-colors ${
                        isCurrent
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background hover:border-primary/40 hover:bg-primary/5"
                      }`}
                    >
                      {status}
                    </button>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </DashboardLayout>
  );
}
