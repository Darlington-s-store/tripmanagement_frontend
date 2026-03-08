import { useState, useEffect } from "react";
import { Calendar, Search, Eye, MoreVertical, DollarSign, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Booking } from "@/services/admin";
import { toast } from "sonner";
import BookingDialog from "@/components/admin/BookingDialog";

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-info/10 text-info",
};

const AdminBookings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllBookings();
      const bookings = Array.isArray(data) ? data : [];
      const mapped = bookings.map(b => ({
        ...b,
        user: b.customer_name || "Unknown User",
        service: b.service_name || (b.booking_type === 'hotel' ? "Hotel Booking" : b.booking_type === 'flight' ? "Flight Booking" : b.booking_type),
        type: b.booking_type.charAt(0).toUpperCase() + b.booking_type.slice(1),
        date: new Date(b.check_in_date).toLocaleDateString() + (b.check_out_date ? ' - ' + new Date(b.check_out_date).toLocaleDateString() : ''),
        amount: typeof b.total_price === 'string' ? parseFloat(b.total_price) : b.total_price,
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

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDialogOpen(true);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateBooking(id, { status: newStatus });
      setBookingsList(bookingsList.map(b => b.id === id ? { ...b, status: newStatus } : b));
      toast.success(`Booking marked as ${newStatus}`);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Failed to update booking status");
    }
  };

  const filtered = bookingsList.filter((b) => {
    const matchesSearch =
      (b.user?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.service?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (b.id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    const matchesType = typeFilter === "all" || b.type?.toLowerCase() === typeFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalRevenue = filtered.reduce((sum, b) => sum + (b.amount || 0), 0);

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
              <p className="font-display font-bold text-primary">GH₵{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search by user, service, or ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
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
                    <div className="flex justify-center mb-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                    Loading bookings...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">No bookings found</td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{b.reference_id || b.id.substring(0, 8)}</td>
                    <td className="px-4 py-3 font-medium">{b.user}</td>
                    <td className="px-4 py-3">
                      <div>
                        <p>{b.service}</p>
                        <Badge variant="secondary" className="mt-0.5 text-xs">{b.type}</Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{b.date}</td>
                    <td className="px-4 py-3 text-xs">{b.paymentMethod}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[b.status] || "bg-muted"}`}>{b.status}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-primary">GH₵{b.amount}</td>
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="gap-2" onClick={() => handleViewDetails(b)}>
                            <Eye className="h-3 w-3" /> View Details
                          </DropdownMenuItem>
                          {b.status !== 'cancelled' && (
                            <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleUpdateStatus(b.id, 'cancelled')}>
                              <XCircle className="h-3 w-3" /> Cancel Booking
                            </DropdownMenuItem>
                          )}
                          {b.status === 'pending' && (
                            <DropdownMenuItem className="gap-2 text-success" onClick={() => handleUpdateStatus(b.id, 'confirmed')}>
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

      <BookingDialog
        booking={selectedBooking}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onUpdateStatus={handleUpdateStatus}
      />
    </DashboardLayout>
  );
};

export default AdminBookings;
