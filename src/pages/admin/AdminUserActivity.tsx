import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft, Eye, Star, Calendar, MapPin,
  BookOpen, MessageSquare, Clock, CircleDollarSign,
  CheckCircle2, XCircle, AlertCircle, Edit,
  TrendingUp, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, User } from "@/services/admin";
import { toast } from "sonner";

/* ── Helpers ── */
function statusStyle(status: string) {
  switch (status?.toLowerCase()) {
    case "confirmed": return "bg-green-50 text-green-700 border-green-200";
    case "pending":   return "bg-amber-50 text-amber-700 border-amber-200";
    case "cancelled": return "bg-red-50 text-red-600 border-red-200";
    case "completed": return "bg-blue-50 text-blue-700 border-blue-200";
    default:          return "bg-gray-50 text-gray-600 border-gray-200";
  }
}

function statusIcon(status: string) {
  switch (status?.toLowerCase()) {
    case "confirmed": return <CheckCircle2 className="h-3.5 w-3.5" />;
    case "cancelled": return <XCircle className="h-3.5 w-3.5" />;
    case "pending":   return <Clock className="h-3.5 w-3.5" />;
    default:          return <AlertCircle className="h-3.5 w-3.5" />;
  }
}

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="font-display text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-0.5 text-sm font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function AdminUserActivity() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [activity, setActivity] = useState<{ bookings: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[]; reviews: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("bookings");

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const [u, act] = await Promise.all([
          adminService.getUserById(id),
          adminService.getUserActivity(id),
        ]);
        setUser(u);
        setActivity(act);
      } catch {
        toast.error("Failed to load user activity.");
        navigate("/admin/users");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const bookings: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] = Array.isArray(activity?.bookings) ? activity.bookings : [];
  const reviews: any /* eslint-disable-line @typescript-eslint/no-explicit-any */[] = Array.isArray(activity?.reviews) ? activity.reviews : [];

  const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0);
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length).toFixed(1)
    : "—";

  const initials = user?.full_name
    ? user.full_name.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading user activity...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-500 hover:text-gray-900 -ml-2"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>

        {/* ── User profile header ── */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-2xl">
                {initials}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-gray-900">{user?.full_name}</h1>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold ${
                      user?.role === "admin" ? "border-orange-200 bg-orange-50 text-orange-700" :
                      user?.role === "provider" ? "border-blue-200 bg-blue-50 text-blue-700" :
                      "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    {user?.role === "user" ? "Traveller" : user?.role === "provider" ? "Provider" : "Admin"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      user?.status === "active"
                        ? "border-green-200 bg-green-50 text-green-700"
                        : "border-red-200 bg-red-50 text-red-600"
                    }`}
                  >
                    <div className={`h-1.5 w-1.5 rounded-full ${user?.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    {user?.status === "active" ? "Active" : "Suspended"}
                  </Badge>
                  {user?.created_at && (
                    <span className="flex items-center gap-1 text-[11px] text-gray-400">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="self-start gap-2 rounded-xl sm:self-auto"
              asChild
            >
              <Link to={`/admin/users/${id}/edit`}>
                <Edit className="h-4 w-4" />
                Edit Profile
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={BookOpen}         label="Total Bookings"   value={bookings.length} />
          <StatCard icon={CircleDollarSign} label="Total Spent"      value={bookings.length ? `GH₵ ${totalSpent.toLocaleString()}` : "—"} />
          <StatCard icon={MessageSquare}    label="Reviews Written"  value={reviews.length} />
          <StatCard icon={Star}             label="Avg. Rating Given" value={avgRating} sub={reviews.length ? `from ${reviews.length} review${reviews.length !== 1 ? "s" : ""}` : undefined} />
        </div>

        {/* ── Activity tabs ── */}
        <div className="rounded-2xl border border-gray-200 bg-white">
          <Tabs value={tab} onValueChange={setTab}>
            <div className="border-b border-gray-100 px-6 pt-5">
              <TabsList className="h-10 gap-1 rounded-xl bg-gray-100 p-1">
                <TabsTrigger value="bookings" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <BookOpen className="h-3.5 w-3.5" />
                  Bookings ({bookings.length})
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg gap-2 data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm">
                  <Star className="h-3.5 w-3.5" />
                  Reviews ({reviews.length})
                </TabsTrigger>
              </TabsList>
            </div>

            {/* ── Bookings ── */}
            <TabsContent value="bookings" className="m-0 p-6">
              {bookings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <Receipt className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium text-sm">No bookings yet</p>
                  <p className="text-xs mt-1">This user hasn't made any bookings on the platform.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings.map((b: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <div
                      key={b.id}
                      className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-5 hover:border-gray-200 transition-colors sm:flex-row sm:items-start sm:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-[11px] font-semibold capitalize border-gray-200 bg-white">
                            {b.booking_type?.replace("_", " ")}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`flex items-center gap-1 text-[11px] font-semibold capitalize ${statusStyle(b.status)}`}
                          >
                            {statusIcon(b.status)}
                            {b.status}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-gray-800">
                          Booking #{b.id?.substring(0, 8).toUpperCase()}
                        </p>
                        {b.check_in_date && (
                          <p className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(b.check_in_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                            {b.check_out_date && (
                              <> — {new Date(b.check_out_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</>
                            )}
                          </p>
                        )}
                        {b.special_requests && (
                          <p className="text-xs text-gray-400 italic">"{b.special_requests}"</p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xl font-bold text-primary">GH₵ {parseFloat(b.total_price || 0).toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(b.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* ── Reviews ── */}
            <TabsContent value="reviews" className="m-0 p-6">
              {reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <MessageSquare className="h-10 w-10 mb-3 opacity-30" />
                  <p className="font-medium text-sm">No reviews yet</p>
                  <p className="text-xs mt-1">This user hasn't written any reviews yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r: any /* eslint-disable-line @typescript-eslint/no-explicit-any */) => (
                    <div
                      key={r.id}
                      className="rounded-xl border border-gray-100 bg-gray-50 p-5 hover:border-gray-200 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${star <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">"{r.comment}"</p>
                      {r.booking_id && (
                        <p className="mt-2 text-[11px] text-gray-400">
                          Booking #{r.booking_id?.substring(0, 8).toUpperCase()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

      </div>
    </DashboardLayout>
  );
}
