import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
   ArrowLeft, User, Mail, Phone, Shield,
   CheckCircle2, AlertCircle, Clock, Calendar,
   Edit, Key, Trash2, Eye, BookOpen, Star,
   TrendingUp, MapPin, Activity, History,
   ShieldCheck, ShieldAlert
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, User as UserType, Booking, Review } from "@/services/admin";
import { toast } from "sonner";

/* ── Components ── */

function InfoTile({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
   return (
      <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
         <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
            <Icon className="h-6 w-6" />
         </div>
         <div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className="text-sm font-bold text-gray-900">{value}</p>
         </div>
      </div>
   );
}

function SectionHeader({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
   return (
      <div className="flex items-center gap-2 mb-4">
         <Icon className="h-5 w-5 text-primary" />
         <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      </div>
   );
}

export default function AdminUserOverview() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();

   const [user, setUser] = useState<UserType | null>(null);
   const [activity, setActivity] = useState<{ bookings: Booking[]; reviews: Review[] } | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   useEffect(() => {
      if (!id) return;
      (async () => {
         setIsLoading(true);
         try {
            const [userData, activityData] = await Promise.all([
               adminService.getUserById(id),
               adminService.getUserActivity(id)
            ]);
            setUser(userData);
            setActivity(activityData);
         } catch (error) {
            console.error("Failed to load user data:", error);
            toast.error("Failed to load user details.");
            navigate("/admin/users");
         } finally {
            setIsLoading(false);
         }
      })();
   }, [id, navigate]);

   if (isLoading) {
      return (
         <DashboardLayout role="admin">
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
               <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
               <p className="text-muted-foreground animate-pulse">Gathering user information...</p>
            </div>
         </DashboardLayout>
      );
   }

   if (!user) return null;

   const initials = user.full_name
      ? user.full_name.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
      : "?";

   const bookings = Array.isArray(activity?.bookings) ? activity.bookings : [];
   const reviews = Array.isArray(activity?.reviews) ? activity.reviews : [];
   const totalSpent = bookings.reduce((sum, b) => sum + parseFloat((b.total_price || 0).toString()), 0);

   return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 py-6 px-4">
        {/* Navigation & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-slate-500 hover:text-slate-900 gap-1"
              onClick={() => navigate("/admin/users")}
            >
              <ArrowLeft className="h-3 w-3" /> Back to Users
            </Button>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Details</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg h-9 border-slate-200"
              onClick={() => navigate(`/admin/users/${id}/edit`)}
            >
              <Edit className="h-4 w-4 mr-2" /> Edit Profile
            </Button>
            <Button
              size="sm"
              className="rounded-lg h-9"
              onClick={() => navigate(`/admin/users/${id}/activity`)}
            >
              <Activity className="h-4 w-4 mr-2" /> Activity Log
            </Button>
          </div>
        </div>

        {/* User Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="h-20 w-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-slate-600">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {user.full_name}
                </h2>
                <Badge variant={user.status === 'active' ? 'secondary' : 'destructive'} className="capitalize text-[10px] font-bold px-2 py-0">
                  {user.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-8">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Mail className="h-3.5 w-3.5" /> {user.email}
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Phone className="h-3.5 w-3.5" /> {user.phone}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar className="h-3.5 w-3.5" /> Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: bookings.length.toString(), icon: BookOpen, color: "text-blue-600 bg-blue-50" },
            { label: "Platform Revenue", value: `GH₵ ${totalSpent.toLocaleString()}`, icon: TrendingUp, color: "text-emerald-600 bg-emerald-50" },
            { label: "Account Role", value: user.role.toUpperCase(), icon: ShieldCheck, color: "text-purple-600 bg-purple-50" },
            { label: "Last Action", value: bookings[0] ? new Date(bookings[0].created_at).toLocaleDateString() : "No Activity", icon: Clock, color: "text-amber-600 bg-amber-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-slate-400" /> Comprehensive Data
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Legal Name</label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.full_name || "N/A"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Primary Email</label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Contact Phone</label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">{user.phone || "None listed"}</p>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Registered On</label>
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-200">
                      {user.created_at ? new Date(user.created_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-slate-400" /> Recent Activity
                </h3>
                <Button variant="link" size="sm" className="h-auto p-0 text-xs text-primary" onClick={() => navigate(`/admin/users/${id}/activity`)}>
                  Full Log
                </Button>
              </div>
              {bookings.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-100 rounded-lg">
                  No recent bookings recorded.
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.slice(0, 3).map((b: Booking) => (
                    <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-md bg-white border border-slate-200 flex items-center justify-center">
                          <BookOpen className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white capitalize">{b.booking_type}</p>
                          <p className="text-[10px] text-slate-400">#...{b.id.substring(b.id.length-6)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">GH₵ {parseFloat(b.total_price.toString()).toLocaleString()}</p>
                        <span className={`text-[9px] font-bold uppercase rounded px-1.5 py-0 ${
                          b.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {b.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-400" /> Account Security
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-between h-10 text-xs font-semibold rounded-lg"
                  onClick={() => navigate(`/admin/users/${id}/reset-password`)}
                >
                  Force Password Reset <Key className="h-3.5 w-3.5 text-slate-400" />
                </Button>
                
                <Button
                  variant="outline"
                  className={`w-full justify-between h-10 text-xs font-semibold rounded-lg ${
                    user.status === 'active' ? 'hover:bg-amber-50 hover:text-amber-600' : 'hover:bg-emerald-50 hover:text-emerald-600'
                  }`}
                  onClick={async () => {
                    const newStatus = user.status === 'active' ? 'suspended' : 'active';
                    try {
                      await adminService.updateUser(user.id, { status: newStatus });
                      setUser({ ...user, status: newStatus });
                      toast.success(`User set to ${newStatus}`);
                    } catch { toast.error("Update failed"); }
                  }}
                >
                  {user.status === 'active' ? 'Suspend User' : 'Restore User'} <Ban className="h-3.5 w-3.5 opacity-50" />
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 text-xs font-bold rounded-lg text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  onClick={async () => {
                    if (!confirm(`Permanently delete ${user.full_name}?`)) return;
                    try {
                      await adminService.deleteUser(user.id);
                      toast.success("User deleted");
                      navigate("/admin/users");
                    } catch { toast.error("Delete failed"); }
                  }}
                >
                  Purge User Data <Trash2 className="h-3.5 w-3.5 opacity-50" />
                </Button>
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-lg text-white shadow-lg overflow-hidden relative">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Clock className="h-20 w-20" />
              </div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Audit Insight</h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                Active for {user.created_at ? Math.floor((new Date().getTime() - new Date(user.created_at).getTime()) / (86400000)) : 'N/A'} days.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-2 text-[11px] font-bold text-primary">
                <CheckCircle2 className="h-3.5 w-3.5" /> Oversight Active
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
   );
}

const Ban = ({ className }: { className?: string }) => (
   <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
   >
      <circle cx="12" cy="12" r="10" /><path d="m4.9 4.9 14.2 14.2" />
   </svg>
);
