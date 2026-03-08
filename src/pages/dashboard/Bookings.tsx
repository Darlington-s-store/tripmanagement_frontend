import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { bookingsService, Booking } from "@/services/bookings";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { MapPin, Calendar, Users, Trash2, Loader } from "lucide-react";

export default function BookingsDashboard() {
  const { isAuthenticated, isLoading } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      loadBookings();
    }
  }, [isLoading, isAuthenticated]);

  const loadBookings = async () => {
    try {
      setIsLoadingBookings(true);
      const data = await bookingsService.getUserBookings();
      setBookings(data);
    } catch (error: any) {
      toast.error("Failed to load bookings");
      console.error(error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    try {
      await bookingsService.cancelBooking(bookingId);
      toast.success("Booking cancelled successfully!");
      loadBookings();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isUpcoming = (checkInDate: string) => {
    return new Date(checkInDate) > new Date();
  };

  if (isLoading) {
    return (
      <DashboardLayout role="user">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <DashboardLayout role="user">
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground mt-2">
            View and manage all your hotel bookings
          </p>
        </div>

        {isLoadingBookings ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
              <Button onClick={() => window.location.href = "/hotels"}>Browse Hotels</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{booking.service_name || 'Booking Detail'}</CardTitle>
                      <div className="flex gap-2 mt-2">
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                        {isUpcoming(booking.check_in_date) && (
                          <Badge variant="outline">Upcoming</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        GH₵{Number(booking.total_price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Booking ID: {booking.id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-in</p>
                        <p className="font-medium">
                          {new Date(booking.check_in_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Check-out</p>
                        <p className="font-medium">
                          {new Date(booking.check_out_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Guests</p>
                        <p className="font-medium">{booking.number_of_guests}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        // Could add more details modal
                      }}
                    >
                      View Details
                    </Button>
                    {booking.status !== "cancelled" && isUpcoming(booking.check_in_date) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleCancel(booking.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel Booking
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
