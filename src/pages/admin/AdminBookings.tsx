import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Search, Eye, MoreVertical, DollarSign, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Booking } from "@/services/admin";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-info/10 text-info",
};

function toDate(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value?: string | null) {
  const parsed = toDate(value);

  return parsed
    ? parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Date not set";
}

function formatDateRange(start?: string | null, end?: string | null) {
  const startLabel = formatDate(start);
  const endLabel = toDate(end) ? formatDate(end) : "";

  if (!endLabel) {
    return startLabel;
  }

  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} to ${endLabel}`;
}

function formatCurrency(value: number | string | undefined) {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `GHS ${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const AdminBookings = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);

    try {
      const data = await adminService.getAllBookings();
      const bookings = Array.isArray(data) ? data : [];
      const mapped = bookings.map((booking) => ({
        ...booking,
        user: booking.customer_name || "Unknown User",
        service:
          booking.service_name ||
          (booking.booking_type === "hotel"
            ? "Hotel Booking"
            : booking.booking_type === "flight"
              ? "Flight Booking"
              : booking.booking_type),
        type: booking.booking_type.charAt(0).toUpperCase() + booking.booking_type.slice(1),
        date: formatDateRange(booking.check_in_date, booking.check_out_date),
        amount:
          typeof booking.total_price === "string"
            ? Number.parseFloat(booking.total_price)
            : booking.total_price,
        paymentMethod: "Card/MoMo",
      }));

      setBookingsList(mapped);
    } catch (error) {
      console.error("Failed to load bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (bookingId: string) => {
    navigate(`/admin/bookings/${bookingId}`);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateBooking(id, { status: newStatus });
      setBookingsList((current) =>
        current.map((booking) => (booking.id === id ? { ...booking, status: newStatus } : booking))
      );
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const filtered = bookingsList.filter((booking) => {
    const matchesSearch =
      booking.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.service?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    const matchesType = typeFilter === "all" || booking.type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = filtered.reduce((sum, booking) => sum + (booking.amount || 0), 0);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Booking Management</h2>
            <p className="text-muted-foreground">Manage all platform bookings</p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="font-display font-bold text-primary">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by user, service, or ID..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 shadow-none focus-visible:ring-0"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Hotel">Hotel</SelectItem>
              <SelectItem value="Guide">Guide</SelectItem>
              <SelectItem value="Transport">Transport</SelectItem>
              <SelectItem value="Attraction">Attraction</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Booking ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">User</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Service</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Payment</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Amount</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <div className="mb-2 flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No bookings found
                  </td>
                </tr>
              ) : (
                filtered.map((booking) => (
                  <tr key={booking.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">
                      {booking.reference_id || booking.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-medium">{booking.user}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{booking.service}</p>
                        <Badge variant="secondary" className="mt-0.5 text-xs">
                          {booking.type}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{booking.date}</td>
                    <td className="px-4 py-3 text-xs">{booking.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[booking.status] || "bg-muted"}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">
                      {formatCurrency(booking.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => handleViewDetails(booking.id)}>
                            <Eye className="h-3 w-3" /> View Details
                          </DropdownMenuItem>
                          {booking.status !== "cancelled" && (
                            <DropdownMenuItem
                              className="gap-2 text-destructive"
                              onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                            >
                              <XCircle className="h-3 w-3" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                          {booking.status === "pending" && (
                            <DropdownMenuItem
                              className="gap-2 text-success"
                              onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                            >
                              <Calendar className="h-3 w-3" /> Confirm Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} bookings found</p>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;
