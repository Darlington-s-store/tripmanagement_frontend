import { useEffect, useState } from "react";
import {
  Calendar, Hotel, MapPin, CreditCard, Star, ArrowUpRight,
  Loader, Plus, Search, TrendingUp, Briefcase, Compass,
  Map, Gift, Bell, Award
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
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";

const statusColors: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  cancelled: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
  completed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
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
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const nextTrip = trips
    .filter(t => new Date(t.start_date) > new Date() && t.status !== 'cancelled')
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0];

  const totalSpent = bookings.reduce((sum, b) => sum + Number(b.total_price || 0), 0);

  const chartData = [
    { name: "Hotels", value: bookings.filter(b => b.booking_type === 'hotel').length },
    { name: "Guides", value: bookings.filter(b => b.booking_type === 'guide').length },
    { name: "Transport", value: bookings.filter(b => b.booking_type === 'transport').length },
  ].filter(d => d.value > 0);

  const spendingData = [
    { month: 'Jan', amount: 450 },
    { month: 'Feb', amount: 1200 },
    { month: 'Mar', amount: 800 },
    { month: 'Apr', amount: totalSpent > 0 ? totalSpent : 0 },
  ];

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'];

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
      <div className="space-y-8 pb-10">
        {/* Welcome Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary p-8 text-white shadow-xl">
          <div className="absolute right-0 top-0 h-64 w-64 -translate-y-12 translate-x-12 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 h-32 w-32 translate-y-8 rounded-full bg-primary/20 blur-2xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-md">
                <Award className="h-3.5 w-3.5 text-amber-400" /> Platinum Explorer
              </div>
              <h2 className="font-display text-4xl font-bold tracking-tight">
                Akwaaba, {user?.full_name?.split(' ')[0] || "Traveller"}!
              </h2>
              <p className="max-w-md text-slate-300">
                You've explored {trips.length} beautiful destinations in Ghana. Where will your next adventure take you?
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="rounded-xl bg-white text-slate-900 hover:bg-slate-100">
                  <Link to="/trips/new" className="gap-2">
                    <Plus className="h-4 w-4" /> Plan a Trip
                  </Link>
                </Button>
                <Button variant="outline" asChild className="rounded-xl border-white/20 bg-white/5 hover:bg-white/10">
                  <Link to="/hotels" className="gap-2">
                    <Search className="h-4 w-4" /> Explore Stays
                  </Link>
                </Button>
              </div>
            </div>

            {nextTrip ? (
              <div className="w-full md:w-80 rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-3">Upcoming Adventure</p>
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg leading-tight">{nextTrip.destination}</h4>
                    <p className="text-sm text-slate-400">Starts {new Date(nextTrip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Preparation</span>
                    <span className="text-emerald-400">75%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: '75%' }} />
                  </div>
                </div>
                <Button asChild variant="link" className="mt-4 p-0 h-auto text-white hover:text-primary transition-colors text-sm font-medium gap-1">
                  <Link to={`/trips/${nextTrip.id}`}>View Itinerary <ArrowUpRight className="h-3 w-3" /></Link>
                </Button>
              </div>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <Map className="h-12 w-12 mb-2 opacity-30" />
                <p className="text-sm">No upcoming trips planned yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "My Bookings", value: bookings.length, sub: "Total reservations", color: "bg-blue-50 text-blue-600", icon: Calendar },
            { label: "Planned Trips", value: trips.length, sub: "Ghana itineraries", color: "bg-emerald-50 text-emerald-600", icon: MapPin },
            { label: "Total Spent", value: `GH₵${totalSpent.toLocaleString()}`, sub: "Travel investment", color: "bg-amber-50 text-amber-600", icon: CreditCard },
            { label: "Rewards", value: "240", sub: "Exp. points", color: "bg-purple-50 text-purple-600", icon: Gift },
          ].map((s, idx) => {
            const Icon = s.icon;
            return (
              <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-xl ${s.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <TrendingUp className="h-3 w-3" /> +12%
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{s.value}</h3>
                    <p className="text-sm font-medium text-slate-900">{s.label}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Activity */}
          <Card className="lg:col-span-2 border-none shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl">Your Travel Activity</CardTitle>
                <CardDescription>Monthly spending & booking distribution</CardDescription>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="rounded-lg">Analytics</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-64">
                <div className="h-full w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={spendingData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                      <YAxis hide />
                      <Tooltip
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="h-full w-full flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height={180}>
                    <PieChart>
                      <Pie
                        data={chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(chartData.length > 0 ? chartData : [{ name: 'Empty', value: 1 }]).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={chartData.length > 0 ? COLORS[index % COLORS.length] : '#f1f5f9'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {chartData.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">{d.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions / Notifications */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Bell className="h-4 w-4 text-primary" /> Recent Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Booking Confirmed", time: "2 hours ago", desc: "Your stay at Royal Senchi Resort is confirmed.", icon: Hotel, color: "bg-blue-50 text-blue-600" },
                  { title: "Review Request", time: "1 day ago", desc: "How was your tour at Cape Coast Castle?", icon: Star, color: "bg-amber-50 text-amber-600" },
                  { title: "System Update", time: "3 days ago", desc: "New destinations added to the Northern regions.", icon: Info, color: "bg-slate-50 text-slate-600" }
                ].map((inv, i) => (
                  <div key={i} className="flex gap-3 items-start group">
                    <div className={`p-2 rounded-lg shrink-0 ${inv.color}`}>
                      <inv.icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-0.5">
                        <h4 className="text-xs font-bold truncate">{inv.title}</h4>
                        <span className="text-[10px] text-slate-400">{inv.time}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{inv.desc}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-primary">
                  View all notifications
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-primary border-none shadow-lg text-white overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                <Map className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <h3 className="font-display font-bold text-lg mb-1">Invite Friends</h3>
                <p className="text-white/70 text-sm mb-4">Refer a friend and get GH₵ 50 off your next hotel booking.</p>
                <Button variant="secondary" size="sm" className="bg-white text-primary border-none hover:bg-white/90 font-bold rounded-xl h-9">
                  Get Referral Link
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity Table style section */}
        <Card className="border-none shadow-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50">
            <div>
              <CardTitle className="text-xl">Recent Bookings</CardTitle>
              <CardDescription>Your last 5 transactions</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild className="rounded-xl">
              <Link to="/dashboard/bookings" className="gap-1.5">
                Manage Bookings <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>
          <div className="overflow-x-auto">
            {bookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                <Briefcase className="h-10 w-10 mb-2 opacity-20" />
                <p>You haven't made any bookings yet.</p>
                <Link to="/hotels" className="text-primary hover:underline text-sm font-medium mt-1">Start exploring</Link>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-[11px] uppercase tracking-wider font-bold">
                    <th className="text-left px-6 py-4">Service</th>
                    <th className="text-left px-6 py-4">Status</th>
                    <th className="text-left px-6 py-4">Booking Date</th>
                    <th className="text-right px-6 py-4">Amount</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {bookings.slice(0, 5).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${b.booking_type === 'hotel' ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'}`}>
                            {b.booking_type === 'hotel' ? <Hotel className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-tight">{b.service_name || `Ref: ${b.id.substring(0, 8)}`}</p>
                            <p className="text-[11px] text-slate-400 capitalize">{b.booking_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${statusColors[b.status]}`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(b.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className="font-bold text-slate-900 truncate">GH₵ {Number(b.total_price).toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
};

// Simple fallback for Info icon if not found in Lucide
const Info = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24" height="24" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
  </svg>
);

export default UserDashboard;
