import { useState, useEffect } from "react";
import { Star, Search, Eye, Trash2, Flag, CheckCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Review } from "@/services/admin";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  published: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  flagged: "bg-destructive/10 text-destructive",
  removed: "bg-muted text-muted-foreground",
};

const AdminReviews = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllReviews();
      const reviews = Array.isArray(data) ? data : [];

      // Simulate/map visual fields that backend reviews might lack for dashboard display purposes
      const mappedData = reviews.map(r => ({
        ...r,
        user: r.user || "User " + r.user_id.substring(0, 4),
        service: r.service || "Booking " + r.booking_id.substring(0, 4),
        type: r.type || "Service",
        status: r.status || "published",
        date: new Date(r.created_at).toLocaleDateString()
      }));

      setReviewsList(mappedData);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    if (action === "removed") {
      try {
        await adminService.deleteReview(id);
        setReviewsList(reviewsList.filter(r => r.id !== id));
        toast.success("Review deleted successfully");
      } catch (error) {
        console.error("Failed to delete review:", error);
        toast.error("Failed to delete review");
      }
    } else {
      // Logic to actually flag or update a review could go here if the backend supports it.
      // For now, we update local state.
      setReviewsList(reviewsList.map((r) => r.id === id ? { ...r, status: action } : r));
      toast.success(`Review status updated to ${action}`);
    }
  };

  const filtered = reviewsList.filter((r) => {
    const matchesSearch =
      (r.user?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.service?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.comment.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Review Moderation</h2>
            <p className="text-muted-foreground">Monitor and moderate user reviews</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="secondary" className="gap-1">
              <Flag className="h-3 w-3" /> {reviewsList.filter((r) => r.status === "flagged").length} flagged
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <MessageSquare className="h-3 w-3" /> {reviewsList.filter((r) => r.status === "pending").length} pending
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center rounded-xl border bg-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex h-32 items-center justify-center rounded-xl border bg-card">
              <p className="text-muted-foreground">No reviews found.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r.id} className={`rounded-xl border bg-card p-5 ${r.status === "flagged" ? "border-destructive/30" : "border-border"}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-medium text-primary text-xs">
                        {r.user ? r.user.split(" ").map((n) => n[0]).join("").substring(0, 2) : '?'}
                      </div>
                      <div>
                        <p className="font-medium">{r.user}</p>
                        <p className="text-xs text-muted-foreground">on {r.service} • {(r as any).date}</p>
                      </div>
                    </div>
                    <div className="mb-2 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                        ))}
                      </div>
                      <Badge variant="secondary" className="text-xs">{r.type}</Badge>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[r.status!]}`}>{r.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">"{r.comment}"</p>
                  </div>
                  <div className="flex items-center gap-1">
                    {r.status === "pending" && (
                      <Button size="sm" variant="outline" className="gap-1 text-success hover:bg-success/10" onClick={() => handleAction(r.id, "published")}>
                        <CheckCircle className="h-3 w-3" /> Approve
                      </Button>
                    )}
                    {r.status === "flagged" && (
                      <Button size="sm" variant="outline" className="gap-1 text-success hover:bg-success/10" onClick={() => handleAction(r.id, "published")}>
                        <CheckCircle className="h-3 w-3" /> Unflag
                      </Button>
                    )}
                    {r.status !== "removed" && (
                      <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleAction(r.id, "removed")}>
                        <Trash2 className="h-3 w-3" /> Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminReviews;
