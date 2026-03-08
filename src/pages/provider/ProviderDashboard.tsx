import { useState, useEffect } from "react";
import { Building, Calendar, Star, DollarSign, Plus, ArrowUpRight, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerService, ProviderDashboardStats } from "@/services/provider";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  inactive: "bg-muted text-muted-foreground",
  confirmed: "bg-success/10 text-success",
  cancelled: "bg-destructive/10 text-destructive",
};

const ProviderDashboard = () => {
  const [stats, setStats] = useState<ProviderDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const data = await providerService.getDashboard();
      setStats(data);
    } catch (error) {
      console.error("Failed to load provider dashboard:", error);
      toast.error("Failed to load dashboard data");
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
          <div>
            <h2 className="font-display text-2xl font-bold">Provider Dashboard</h2>
            <p className="text-muted-foreground">Manage your listings and bookings</p>
          </div>
          <Button className="gap-1" asChild>
            <Link to="/provider/listings">
              <Plus className="h-4 w-4" /> Add Listing
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Bookings", value: stats?.totalBookings.toString() || "0", icon: Calendar, color: "text-primary" },
            { label: "Active Listings", value: stats?.activeListings.toString() || "0", icon: Building, color: "text-info" },
            { label: "Avg Rating", value: Number(stats?.avgRating || 0).toFixed(1), icon: Star, color: "text-warning" },
            { label: "Revenue", value: `GH₵${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-success" },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{s.label}</span>
                  <Icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <p className="font-display text-2xl font-bold">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Listings */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold">My Listings</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/provider/listings" className="gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {stats?.listings.map((l) => (
              <div key={l.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{l.name}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="secondary">{l.type}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[l.status] || "bg-muted text-muted-foreground"}`}>
                      {l.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="font-semibold">{l.booking_count}</p>
                    <p className="text-xs text-muted-foreground">Bookings</p>
                  </div>
                  {Number(l.rating) > 0 && (
                    <div className="text-center">
                      <p className="flex items-center gap-1 font-semibold"><Star className="h-3 w-3 fill-primary text-primary" /> {Number(l.rating).toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-primary">GH₵{Number(l.price || 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{l.type === 'Hotel' ? 'Per Night' : 'Per Hour'}</p>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </div>
            ))}
            {stats?.listings.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">
                No listings found.
              </div>
            )}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border p-5">
            <h3 className="font-display text-lg font-semibold">Recent Bookings</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/provider/bookings" className="gap-1">
                View All <ArrowUpRight className="h-3 w-3" />
              </Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {stats?.recentBookings.map((b) => (
              <div key={b.id} className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">{b.guest}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.service_name} • {b.check_in_date ? new Date(b.check_in_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[b.status] || "bg-muted text-muted-foreground"}`}>
                    {b.status}
                  </span>
                  <span className="font-semibold text-primary">GH₵{Number(b.amount).toFixed(2)}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/provider/bookings/${b.id}`}>View</Link>
                  </Button>
                </div>
              </div>
            ))}
            {stats?.recentBookings.length === 0 && (
              <div className="p-10 text-center text-muted-foreground">
                No bookings found.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderDashboard;
