import { useState, useEffect } from "react";
import { Star, Search, Trash2, Flag, CheckCircle, MessageSquare, Loader2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Review } from "@/services/admin";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  published: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-amber-100 text-amber-700 border-amber-200",
  flagged: "bg-red-100 text-red-700 border-red-200",
  removed: "bg-gray-100 text-gray-500 border-gray-200",
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
      setReviewsList(data || []);
    } catch (error) {
      console.error("Failed to load reviews:", error);
      toast.error("Failed to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: string) => {
    try {
      if (action === "removed") {
        await adminService.deleteReview(id);
        setReviewsList(reviewsList.filter(r => r.id !== id));
        toast.success("Review deleted successfully");
      } else {
        await adminService.updateReviewStatus(id, action);
        setReviewsList(reviewsList.map((r) => r.id === id ? { ...r, status: action } : r));
        toast.success(`Review ${action === "published" ? "approved" : "updated"}`);
      }
    } catch (error) {
      console.error("Failed to update review:", error);
      toast.error("Operation failed");
    }
  };

  const filtered = reviewsList.filter((r) => {
    const name = r.full_name || r.user || "Anonymous";
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.comment.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6 max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h2 className="font-display text-3xl font-black text-gray-900">Review Moderation</h2>
            <p className="text-gray-500 font-medium">Verify and publish traveler experiences</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 px-3 py-1 text-sm font-bold animate-pulse">
              <MessageSquare className="h-3.5 w-3.5 mr-1.5" /> {reviewsList.filter((r) => r.status === "pending").length} Pending
            </Badge>
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 text-sm font-bold">
              <Flag className="h-3.5 w-3.5 mr-1.5" /> {reviewsList.filter((r) => r.status === "flagged").length} Flagged
            </Badge>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search by reviewer or content..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="pl-11 h-12 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[180px] h-12 bg-gray-50/50 border-gray-100 rounded-xl font-bold">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Reviews</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="flagged">Flagged</SelectItem>
              <SelectItem value="removed">Removed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadReviews} variant="outline" className="h-12 w-12 p-0 rounded-xl">
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="grid gap-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
              <p className="font-bold text-gray-400 tracking-widest uppercase text-sm">Fetching Reviews...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-gray-500 font-bold">No reviews found matching your criteria.</p>
            </div>
          ) : (
            filtered.map((r) => (
              <div 
                key={r.id} 
                className={`group relative bg-white border rounded-3xl p-6 shadow-sm transition-all hover:shadow-md ${
                  r.status === "flagged" ? "border-red-200 bg-red-50/10" : "border-gray-100"
                }`}
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black text-xl">
                          {(r.full_name || r.user || "A").charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-black text-gray-900 text-lg leading-none">
                            {r.full_name || r.user || "Anonymous"}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center bg-gray-50 px-2 py-0.5 rounded">
                              <MapPin className="h-3 w-3 mr-1 text-primary" /> {r.location || "Traveler"}
                            </span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-bold text-gray-400">
                              {new Date(r.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={`rounded-full px-3 py-1 font-bold text-xs uppercase tracking-tighter ${statusColors[r.status]}`}>
                        {r.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 mb-4">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>

                    <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-50 group-hover:bg-white group-hover:border-gray-100 transition-colors">
                      <p className="text-gray-700 leading-relaxed font-medium italic">
                        "{r.comment}"
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-row lg:flex-col items-center justify-end gap-2 sm:self-end lg:self-start lg:pt-2">
                    {r.status === "pending" && (
                      <Button 
                        size="lg" 
                        onClick={() => handleAction(r.id, "published")}
                        className="bg-green-600 hover:bg-green-700 text-white font-black px-6 rounded-2xl shadow-lg shadow-green-100"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Approve
                      </Button>
                    )}
                    {r.status === "flagged" && (
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={() => handleAction(r.id, "published")}
                        className="border-green-200 text-green-700 hover:bg-green-50 font-black px-6 rounded-2xl"
                      >
                         Unflag Review
                      </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      onClick={() => handleAction(r.id, "removed")}
                      className="h-12 w-12 rounded-2xl text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Remove this review"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
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
