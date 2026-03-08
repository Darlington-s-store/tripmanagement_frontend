import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, AdminDashboardStats, AnalyticsStats } from "@/services/admin";
import { toast } from "sonner";

const topDestinations = [
  { name: "Accra", bookings: 342, revenue: 125000 },
  { name: "Cape Coast", bookings: 218, revenue: 78500 },
  { name: "Kumasi", bookings: 156, revenue: 54000 },
  { name: "Tamale", bookings: 89, revenue: 32000 },
  { name: "Takoradi", bookings: 67, revenue: 24500 },
];

const AdminAnalytics = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [statsData, analyticsData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getAnalytics()
      ]);
      setStats(statsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Failed to load analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyBookings = Array.isArray(analytics?.monthlyBookings) ? analytics.monthlyBookings : [
    { month: "Jan", bookings: 0, revenue: 0 }
  ];

  const maxBookings = Math.max(...monthlyBookings.map((m: any) => Number(m.bookings) || 0), 1);

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Analytics</h2>
          <Select defaultValue="30d">
            <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary cards */}
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Total Revenue", value: `GH₵${Number(stats?.totalRevenue || 0).toLocaleString()}`, change: "+18.2%", icon: DollarSign },
              { label: "Total Bookings", value: Number(stats?.totalBookings || 0).toLocaleString(), change: "+23.1%", icon: Calendar },
              { label: "Total Users", value: Number(stats?.totalUsers || 0).toLocaleString(), change: "+12.5%", icon: Users },
              { label: "Total Reviews", value: Number(stats?.totalReviews || 0).toLocaleString(), change: "+5.3%", icon: TrendingUp },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="rounded-xl border border-border bg-card p-5">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">{s.label}</span>
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-display text-2xl font-bold">{s.value}</p>
                  <p className="mt-1 flex items-center gap-1 text-xs text-success">
                    <TrendingUp className="h-3 w-3" /> {s.change}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly performance */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Monthly Performance</h3>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {monthlyBookings.map((m: any) => (
                  <div key={m.month} className="flex items-center gap-4">
                    <span className="w-8 text-sm font-medium text-muted-foreground">{m.month}</span>
                    <div className="flex-1">
                      <div className="mb-1 h-6 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-primary transition-all duration-500"
                          style={{ width: `${(Number(m.bookings) / maxBookings) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{m.bookings} bookings</p>
                      <p className="text-xs text-muted-foreground">GH₵{Number(m.revenue).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top destinations (Mocked) */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="mb-4 font-display text-lg font-semibold">Top Destinations (Demo)</h3>
            <div className="space-y-3">
              {topDestinations.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">{d.bookings} bookings</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">GH₵{d.revenue.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
