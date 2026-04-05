import { useState, useEffect } from "react";
import { Users, Calendar, DollarSign, AlertCircle, CheckCircle, XCircle, Star, Plane, HelpCircle, ArrowRight, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, AdminDashboardStats, User, Listing, AnalyticsStats } from "@/services/admin";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
   LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
   PieChart, Pie, Cell, Legend
} from 'recharts';



const AdminDashboard = () => {
   const [stats, setStats] = useState<AdminDashboardStats | null>(null);
   const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null);
   const [recentUsers, setRecentUsers] = useState<User[]>([]);
   const [pendingApprovals, setPendingApprovals] = useState<Listing[]>([]);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      loadDashboardData();
   }, []);

   const loadDashboardData = async () => {
      setIsLoading(true);
      try {
         const [statsData, analyticsData, usersData, listingsData] = await Promise.all([
            adminService.getDashboardStats(),
            adminService.getAnalytics(),
            adminService.getAllUsers(),
            adminService.getListings()
         ]);
         console.log("Analytics Data:", analyticsData);
         setStats(statsData);
         setAnalytics(analyticsData);
         setRecentUsers(Array.isArray(usersData) ? usersData.slice(0, 5) : []);
         setPendingApprovals(Array.isArray(listingsData) ? listingsData.filter(l => l.status === 'pending').slice(0, 5) : []);
      } catch (error) {
         console.error("Failed to load admin dashboard data:", error);
         toast.error("Failed to load dashboard data");
      } finally {
         setIsLoading(false);
      }
   };

   const handleApprove = async (id: string) => {
      try {
         await adminService.updateListing(id, { status: "approved" });
         setPendingApprovals(pendingApprovals.filter(l => l.id !== id));
         toast.success("Listing approved");
      } catch (error) {
         toast.error("Failed to approve listing");
      }
   };

   const handleReject = async (id: string) => {
      try {
         await adminService.updateListing(id, { status: "rejected" });
         setPendingApprovals(pendingApprovals.filter(l => l.id !== id));
         toast.success("Listing rejected");
      } catch (error) {
         toast.error("Failed to reject listing");
      }
   };

   if (isLoading) {
      return (
         <DashboardLayout role="admin">
            <div className="flex h-[50vh] items-center justify-center">
               <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
         </DashboardLayout>
      );
   }

   return (
      <DashboardLayout role="admin">
         <div className="space-y-8 animate-in fade-in duration-500">
            <div>
               <h2 className="font-display text-3xl font-bold">Admin Dashboard</h2>
               <p className="text-muted-foreground">Platform overview and management at a glance</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
               {[
                  { label: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-orange-500", bg: "bg-orange-50" },
                  { label: "Total Reviews", value: stats?.totalReviews || 0, icon: Star, color: "text-blue-500", bg: "bg-blue-50" },
                  { label: "Total Bookings", value: stats?.totalBookings || 0, icon: Calendar, color: "text-green-500", bg: "bg-green-50" },
                  { label: "Total Trips", value: stats?.totalTrips || 0, icon: Plane, color: "text-purple-500", bg: "bg-purple-50" },
                  { label: "Revenue", value: `GH₵${(stats?.totalRevenue || 0).toLocaleString()}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-50" },
               ].map((s) => {
                  const Icon = s.icon;
                  return (
                     <div key={s.label} className="rounded-2xl border border-border bg-card p-6 shadow-sm ring-1 ring-border shadow-primary-sm transition-all hover:shadow-primary-md">
                        <div className="mb-4 flex items-center justify-between">
                           <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
                        </div>
                        <div className="flex items-center justify-between">
                           <p className="font-display text-3xl font-bold">{s.value}</p>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-3">
               <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <div className="mb-6 flex items-center justify-between">
                     <h3 className="font-display text-lg font-bold">Booking Trends (12 Months)</h3>
                     <div className="flex items-center gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5">
                           <div className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                           <span>Bookings</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                           <div className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                           <span>Projections</span>
                        </div>
                     </div>
                  </div>
                  <div className="h-[300px] w-full">
                     <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={Array.isArray(analytics?.monthlyBookings) ? analytics.monthlyBookings : []}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis
                              dataKey="month"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: '#94a3b8', fontSize: 12 }}
                              dy={10}
                           />
                           <YAxis hide />
                           <Tooltip
                              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                           />
                           <Line
                              type="monotone"
                              dataKey="bookings"
                              stroke="#f97316"
                              strokeWidth={3}
                              dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#fff' }}
                              activeDot={{ r: 6 }}
                           />
                        </LineChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col">
                  <h3 className="mb-6 font-display text-lg font-bold">Inventory Concentration</h3>
                  <div className="relative flex-1 flex items-center justify-center">
                     <ResponsiveContainer width="100%" height={240}>
                        <PieChart>
                           <Pie
                              data={(Array.isArray(analytics?.bookingsByType) ? analytics.bookingsByType : []).map((item, i) => ({
                                 name: item.type ? (item.type.charAt(0).toUpperCase() + item.type.slice(1)) : 'Unknown',
                                 value: item.count || 0,
                                 color: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'][i % 4]
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={70}
                              outerRadius={90}
                              paddingAngle={5}
                              dataKey="value"
                           >
                              {(Array.isArray(analytics?.bookingsByType) ? analytics.bookingsByType : []).map((_, index) => (
                                 <Cell key={`cell-${index}`} fill={['#f97316', '#3b82f6', '#10b981', '#8b5cf6'][index % 4]} />
                              ))}
                           </Pie>
                           <Tooltip />
                        </PieChart>
                     </ResponsiveContainer>
                     <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-2xl font-bold font-display">GH₵{stats?.totalRevenue?.toLocaleString() || '0'}</span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Volume</span>
                     </div>
                  </div>
                  <div className="mt-4 space-y-3">
                     {(Array.isArray(analytics?.bookingsByType) ? analytics.bookingsByType : []).map((item, i) => (
                        <div key={item.type || i} className="flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#f97316', '#3b82f6', '#10b981', '#8b5cf6'][i % 4] }} />
                              <span className="text-sm font-medium text-slate-600 capitalize">{item.type || 'unknown'}</span>
                           </div>
                           <span className="text-sm font-bold">{Math.round(((item.count || 0) / (stats?.totalBookings || 1)) * 100)}%</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Bottom Cards */}
            <div className="grid gap-6 md:grid-cols-2">
               <div className="rounded-3xl bg-orange-50 p-8 border border-orange-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="h-14 w-14 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0">
                     <Lightbulb className="text-white h-7 w-7" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-display text-xl font-bold text-orange-950">Quick Setup Guide</h3>
                     <p className="text-orange-900/70 text-sm leading-relaxed max-w-sm">
                        Configure your platform's main destinations and start adding itineraries for your travelers.
                     </p>
                     <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 px-6 font-semibold" asChild>
                        <Link to="/admin/destinations">Go to Destinations</Link>
                     </Button>
                  </div>
               </div>

               <div className="rounded-3xl bg-blue-50 p-8 border border-blue-100 flex flex-col md:flex-row gap-6 items-start">
                  <div className="h-14 w-14 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                     <HelpCircle className="text-white h-7 w-7" />
                  </div>
                  <div className="space-y-4">
                     <h3 className="font-display text-xl font-bold text-slate-900">Need Help?</h3>
                     <p className="text-slate-600 text-sm leading-relaxed max-w-sm">
                        Access our documentation or contact the support team for technical assistance.
                     </p>
                     <Button variant="outline" className="bg-white border-slate-200 hover:bg-slate-50 text-slate-900 rounded-xl h-12 px-6 font-semibold shadow-sm">
                        Support Center
                     </Button>
                  </div>
               </div>
            </div>

            {/* Secondary Info (Keep original pending/users but in grid) */}
            <div className="grid gap-6 lg:grid-cols-2">
               {/* Recent Users */}
               <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between border-b border-border p-5">
                     <h3 className="font-display text-lg font-semibold">Recent Users</h3>
                     <Button variant="ghost" size="sm" className="gap-1 rounded-lg" asChild>
                        <Link to="/admin/users">
                           View All <ArrowRight className="h-3 w-3" />
                        </Link>
                     </Button>
                  </div>
                  <div className="divide-y divide-border">
                     {recentUsers.map((u) => (
                        <div key={u.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                           <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent font-medium text-primary shadow-sm border border-border">
                                 {u.full_name?.charAt(0).toUpperCase() || '?'}
                              </div>
                              <div>
                                 <p className="font-semibold text-sm">{u.full_name || 'Unknown'}</p>
                                 <p className="text-xs text-muted-foreground">{u.email}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3">
                              <Badge variant="secondary" className="font-normal">{u.role}</Badge>
                              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                 }`}>
                                 {u.status}
                              </span>
                           </div>
                        </div>
                     ))}
                     {recentUsers.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground italic text-sm">
                           No recent users found.
                        </div>
                     )}
                  </div>
               </div>

               {/* Pending Approvals */}
               <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
                  <div className="flex items-center justify-between border-b border-border p-5">
                     <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-amber-600">
                        <AlertCircle className="h-5 w-5" />
                        Pending Listings
                     </h3>
                     <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">{pendingApprovals.length}</Badge>
                  </div>
                  <div className="divide-y divide-border">
                     {pendingApprovals.map((p) => (
                        <div key={p.id} className="p-4 hover:bg-muted/50 transition-colors">
                           <div className="flex items-start justify-between mb-3">
                              <div>
                                 <p className="font-semibold text-sm">{p.name}</p>
                                 <p className="text-xs text-muted-foreground">{p.provider} • {p.type}</p>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-medium">
                                 {new Date(p.submitted || Date.now()).toLocaleDateString()}
                              </p>
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="flex-1 h-8 text-green-600 border-green-200 hover:bg-green-50 rounded-lg" onClick={() => handleApprove(p.id)}>
                                 <CheckCircle className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="flex-1 h-8 text-red-600 border-red-200 hover:bg-red-50 rounded-lg" onClick={() => handleReject(p.id)}>
                                 <XCircle className="h-3 w-3 mr-1" /> Reject
                              </Button>
                           </div>
                        </div>
                     ))}
                     {pendingApprovals.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground italic text-sm">
                           All clear! No pending approvals.
                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>
      </DashboardLayout>
   );
};

export default AdminDashboard;
