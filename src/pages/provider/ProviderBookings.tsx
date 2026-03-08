import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerService, ProviderBooking } from "@/services/provider";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  confirmed: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  cancelled: "bg-destructive/10 text-destructive",
  completed: "bg-info/10 text-info",
};

const ProviderBookings = () => {
  const [bookings, setBookings] = useState<ProviderBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const data = await providerService.getBookings();
      setBookings(data);
    } catch (error) {
      console.error("Failed to load provider bookings:", error);
      toast.error("Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="provider">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="provider">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Bookings</h2>
          <Badge variant="secondary">{bookings.length} bookings</Badge>
        </div>

        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">#{b.id.substring(0, 8)}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>
                    {b.status}
                  </span>
                </div>
                <p className="font-semibold">{b.guest}</p>
                <p className="text-sm text-muted-foreground">
                  {b.service_name} • {b.check_in_date ? new Date(b.check_in_date).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-primary">GH₵{Number(b.amount).toFixed(2)}</span>
                {b.status === "pending" && (
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline" className="gap-1 text-success hover:bg-success/10">
                      <CheckCircle className="h-3 w-3" /> Accept
                    </Button>
                    <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10">
                      <XCircle className="h-3 w-3" /> Decline
                    </Button>
                  </div>
                )}
                <Button size="sm" variant="outline">Details</Button>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-20 text-center text-muted-foreground">
              No bookings found yet.
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderBookings;
