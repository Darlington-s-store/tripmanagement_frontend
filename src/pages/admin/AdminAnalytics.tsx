import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Calendar, MapPin, Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, AdminDashboardStats, AnalyticsStats } from "@/services/admin";
import { toast } from "sonner";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];

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

  const monthlyData = analytics?.monthlyBookings || [];
  const typeData = (analytics?.bookingsByType || []).map(item => ({
    name: item.type.charAt(0).toUpperCase() + item.type.slice(1),
    value: item.count,
    revenue: item.revenue
  }));
  const destinationData = analytics?.topDestinations || [];

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 pb-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">Advanced Analytics</h2>
            <p className="text-muted-foreground text-sm mt-1">Real-time data insights and business performance metrics.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Select defaultValue="30d">
              <SelectTrigger className="w-[160px] h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Summary cards with animated entry style */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Total Revenue", value: `GH₵${Number(stats?.totalRevenue || 0).toLocaleString()}`, change: "+18.2%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
            { label: "Total Bookings", value: Number(stats?.totalBookings || 0).toLocaleString(), change: "+23.1%", icon: Calendar, color: "text-blue-500", bg: "bg-blue-50" },
            { label: "Active Users", value: Number(stats?.totalUsers || 0).toLocaleString(), change: "+12.5%", icon: Users, color: "text-amber-500", bg: "bg-amber-50" },
            { label: "Verified Reviews", value: Number(stats?.totalReviews || 0).toLocaleString(), change: "+5.3%", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50" },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={s.label} 
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`rounded-xl ${s.bg} p-2.5 transition-colors group-hover:scale-110 duration-300`}>
                    <Icon className={`h-6 w-6 ${s.color}`} />
                  </div>
                  <div className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <TrendingUp className="h-3 w-3" />
                    {s.change}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.label}</p>
                  <h3 className="text-2xl font-bold tracking-tight mt-1">
                    {isLoading ? "---" : s.value}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Chart - Revenue Trends */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Revenue & Bookings Trend</h3>
                <p className="text-xs text-muted-foreground">Monitoring growth over the past months</p>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      tickFormatter={(value) => `GH₵${value >= 1000 ? `${value/1000}k` : value}`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      cursor={{ stroke: '#10B981', strokeWidth: 2 }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      name="Revenue (GH₵)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bookings" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none" 
                      name="Bookings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Booking Type Distribution */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight mb-2">Service Breakdown</h3>
            <p className="text-xs text-muted-foreground mb-6">Distribution of bookings by category</p>
            
            <div className="h-[300px] w-full relative">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                    >
                      {typeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
            
            <div className="mt-4 space-y-3">
              {typeData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-semibold text-foreground">{item.value} bookings</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Destinations */}
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Popular Destinations</h3>
                <p className="text-xs text-muted-foreground">Most booked locations in Ghana</p>
              </div>
            </div>

            <div className="h-[300px] w-full">
              {isLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={destinationData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                    <XAxis type="number" hide />
                    <YAxis 
                      dataKey="name" 
                      type="category" 
                      axisLine={false} 
                      tickLine={false} 
                      width={100}
                      tick={{ fontSize: 13, fontWeight: 500, fill: '#334155' }}
                    />
                    <Tooltip 
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Bar 
                      dataKey="bookings" 
                      fill="#10B981" 
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Performance Summary Card */}
          <div className="rounded-2xl border border-border bg-primary/5 p-6 shadow-sm flex flex-col justify-center">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-primary/20 p-3 rounded-full">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Growth Insight</h3>
            </div>
            <p className="text-sm text-balance leading-relaxed mb-6">
              Your business saw a <span className="text-emerald-600 font-bold">23% increase</span> in bookings this month compared to the same period last year. 
              Beach activities in <span className="font-semibold">Cape Coast</span> are currently trending highest.
            </p>
            <div className="space-y-4">
              <div className="w-full bg-background/50 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Conversion Rate</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">4.8%</span>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100">+0.6%</Badge>
                </div>
              </div>
              <div className="w-full bg-background/50 rounded-lg p-3 border border-border/50">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Avg. Booking Value</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">GH₵420.50</span>
                  <Badge variant="outline" className="text-emerald-600 bg-emerald-50 border-emerald-100">+GH₵35</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminAnalytics;
