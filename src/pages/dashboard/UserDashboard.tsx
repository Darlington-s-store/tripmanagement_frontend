import { useEffect, useState } from "react";
import {
  Calendar,
  Hotel,
  MapPin,
  CreditCard,
  ArrowUpRight,
  Loader,
  Plus,
  Search,
  Briefcase,
  Compass,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { bookingsService, Booking } from "@/services/bookings";
import { tripsService, Trip } from "@/services/trips";
import { toast } from "sonner";
import { 
  formatDate, 
  formatDateRange, 
  formatCurrency, 
  getTripDurationDays,
  formatTripDate 
} from "@/utils/date";

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700",
  pending: "bg-amber-100 text-amber-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-blue-100 text-blue-700",
};

const bookingTypeLabels: Record<string, string> = {
  hotel: "Hotel",
  guide: "Guide",
  activity: "Activity",
  transport: "Transport",
};

const formatStatus = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);

    try {
      const [bookingsData, tripsData] = await Promise.all([
        bookingsService.getUserBookings(),
        tripsService.getUserTrips(),
      ]);

      setBookings(bookingsData);
      setTrips(tripsData);
    } catch (error: unknown) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const now = new Date();
  const upcomingTrips = [...trips]
    .filter((trip) => new Date(trip.start_date) > now && trip.status !== "cancelled")
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
  const nextTrip = upcomingTrips[0];
  const recentTrips = [...trips].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()).slice(0, 4);
  const recentBookings = [...bookings].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5);

  const totalSpent = bookings.reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);
  const activeBookings = bookings.filter((booking) => booking.status === "pending" || booking.status === "confirmed").length;
  const completedTrips = trips.filter((trip) => trip.status === "completed").length;

  const bookingStatusSummary = [
    { label: "Confirmed", value: bookings.filter((booking) => booking.status === "confirmed").length },
    { label: "Pending", value: bookings.filter((booking) => booking.status === "pending").length },
    { label: "Completed", value: bookings.filter((booking) => booking.status === "completed").length },
    { label: "Cancelled", value: bookings.filter((booking) => booking.status === "cancelled").length },
  ];

  const bookingTypeSummary = Object.entries(bookingTypeLabels)
    .map(([type, label]) => ({
      label,
      value: bookings.filter((booking) => booking.booking_type === type).length,
    }))
    .filter((item) => item.value > 0);

  const stats = [
    {
      label: "Upcoming trips",
      value: upcomingTrips.length,
      note: nextTrip ? `Next: ${nextTrip.trip_name || nextTrip.destination}` : "No upcoming trip",
      icon: MapPin,
    },
    {
      label: "Active bookings",
      value: activeBookings,
      note: "Pending and confirmed bookings",
      icon: Calendar,
    },
    {
      label: "Total spent",
      value: formatCurrency(totalSpent),
      note: "Across all bookings",
      icon: CreditCard,
    },
    {
      label: "Completed trips",
      value: completedTrips,
      note: "Trips marked completed",
      icon: CheckCircle2,
    },
  ];

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
      <div className="space-y-6 pb-10">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              Welcome back, {user?.full_name?.split(" ")[0] || "traveller"}. Here is a practical snapshot of your trips and bookings.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild className="gap-2">
              <Link to="/trips/new">
                <Plus className="h-4 w-4" />
                Plan a trip
              </Link>
            </Button>
            <Button variant="outline" asChild className="gap-2">
              <Link to="/hotels">
                <Search className="h-4 w-4" />
                Explore stays
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Card key={stat.label}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-2xl font-semibold tracking-tight">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.note}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_360px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Next trip</CardTitle>
                <CardDescription>Your closest upcoming itinerary.</CardDescription>
              </CardHeader>
              <CardContent>
                {nextTrip ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <h2 className="text-xl font-semibold">{nextTrip.trip_name || nextTrip.destination}</h2>
                        {nextTrip.trip_name && (
                          <p className="text-sm text-muted-foreground">{nextTrip.destination}</p>
                        )}
                        <p className="text-sm text-muted-foreground">{formatDateRange(nextTrip.start_date, nextTrip.end_date)}</p>
                      </div>
                      <Badge variant="outline" className={statusColors[nextTrip.status] || "bg-gray-100 text-gray-700"}>
                        {formatStatus(nextTrip.status)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border bg-muted/20 p-3">
                        <p className="text-sm text-muted-foreground">Status</p>
                        <p className="mt-1 font-medium">{formatStatus(nextTrip.status)}</p>
                      </div>
                      <div className="rounded-lg border bg-muted/20 p-3">
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="mt-1 font-medium">{formatCurrency(nextTrip.budget)}</p>
                      </div>
                      <div className="rounded-lg border bg-muted/20 p-3">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="mt-1 font-medium">{getTripDurationDays(nextTrip.start_date, nextTrip.end_date)} days</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild className="gap-2">
                        <Link to={`/trips/${nextTrip.id}`}>
                          View itinerary
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to="/dashboard/trips">All trips</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    No upcoming trips yet. Plan a trip when you are ready.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent trips</CardTitle>
                  <CardDescription>Your latest planned trips.</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/dashboard/trips">Manage trips</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {recentTrips.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                    You have not created any trips yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTrips.map((trip) => (
                      <div key={trip.id} className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <p className="font-medium">{trip.trip_name || trip.destination}</p>
                          {trip.trip_name && (
                            <p className="text-sm text-muted-foreground">{trip.destination}</p>
                          )}
                          <p className="text-sm text-muted-foreground">{formatTripDate(trip.start_date, trip.end_date)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={statusColors[trip.status] || "bg-gray-100 text-gray-700"}>
                            {formatStatus(trip.status)}
                          </Badge>
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/trips/${trip.id}`} className="gap-1.5">
                              Open
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Booking overview</CardTitle>
                <CardDescription>Status and service breakdown from your real bookings.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {bookingStatusSummary.map((item) => (
                    <div key={item.label} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                      <span className="text-sm text-muted-foreground">{item.label}</span>
                      <span className="font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Booking types</p>
                    <p className="text-sm text-muted-foreground">{bookings.length} total</p>
                  </div>

                  {bookingTypeSummary.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No booking activity yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {bookingTypeSummary.map((item) => {
                        const percentage = bookings.length > 0 ? Math.round((item.value / bookings.length) * 100) : 0;

                        return (
                          <div key={item.label} className="space-y-1.5">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="font-medium">{item.value}</span>
                            </div>
                            <div className="h-2 rounded-full bg-muted">
                              <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick links</CardTitle>
                <CardDescription>Shortcuts for the tasks users usually come back for.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link to="/dashboard/bookings">
                    Manage bookings
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link to="/dashboard/trips">
                    View trips
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-between" asChild>
                  <Link to="/hotels">
                    Browse hotels
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>Your latest booking activity.</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/bookings">View all bookings</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentBookings.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
                <Briefcase className="mx-auto mb-3 h-10 w-10 opacity-30" />
                <p className="text-sm">You have not made any bookings yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        {booking.booking_type === "hotel" ? (
                          <Hotel className="h-4 w-4 text-primary" />
                        ) : (
                          <Compass className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium">{booking.service_name || `Booking ${booking.id.slice(0, 8)}`}</p>
                        <p className="text-sm text-muted-foreground">
                          {bookingTypeLabels[booking.booking_type] || booking.booking_type} | {formatDate(booking.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 lg:justify-end">
                      <Badge variant="outline" className={statusColors[booking.status] || "bg-gray-100 text-gray-700"}>
                        {formatStatus(booking.status)}
                      </Badge>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(Number(booking.total_price || 0))}</p>
                        <p className="text-sm text-muted-foreground">{booking.reference_id}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default UserDashboard;
