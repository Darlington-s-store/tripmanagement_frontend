import { useEffect, useState } from "react";
import {
  Star, Edit, Trash2, Loader, MessageSquare,
  ThumbsUp, Flag, MapPin, Calendar, Camera, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { reviewsService, Review } from "@/services/reviews";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

const UserReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const data = await reviewsService.getUserReviews();
      setReviews(data);
    } catch (error: unknown) {
      toast.error("Failed to load reviews");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await reviewsService.deleteReview(reviewId);
      toast.success("Review deleted successfully");
      loadReviews();
    } catch (error: unknown) {
      toast.error("Failed to delete review");
    }
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++;
    }
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight">My Reviews</h2>
            <p className="text-muted-foreground mt-1">Share your travel experiences and help others explore Ghana.</p>
          </div>
        </div>

        {reviews.length > 0 && (
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-1 border-none shadow-sm bg-primary/5">
              <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                <div className="text-5xl font-bold text-primary mb-2">{avgRating.toFixed(1)}</div>
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < Math.round(avgRating) ? "fill-primary text-primary" : "text-muted"}`}
                    />
                  ))}
                </div>
                <p className="text-sm font-medium text-slate-500">Based on {reviews.length} reviews</p>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 border-none shadow-sm">
              <CardContent className="p-6 space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratingCounts[star - 1];
                  const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-4">
                      <span className="text-xs font-bold w-4">{star}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <Progress value={percentage} className="h-1.5 flex-1" />
                      <span className="text-xs text-slate-400 w-10 text-right">{percentage.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-card py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-amber-50 text-amber-500 flex items-center justify-center mb-6">
              <Star className="h-10 w-10 fill-amber-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">No reviews yet</h3>
            <p className="text-muted-foreground max-w-xs mx-auto mb-8">
              You haven't shared your thoughts on any experiences yet. Your reviews help the local community grow!
            </p>
            <Button variant="outline" className="rounded-xl px-8 h-12">
              Write a Review
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
            {reviews.map((r) => (
              <Card key={r.id} className="border-none shadow-sm hover:shadow-md transition-all group overflow-hidden bg-card">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                        <MessageSquare className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-bold">Service Review</CardTitle>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(r.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                        <Edit className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-rose-50 rounded-full"
                        onClick={() => handleDelete(r.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="relative p-4 rounded-2xl bg-slate-50 italic text-slate-700 text-sm leading-relaxed mb-4">
                    <span className="absolute -top-2 left-4 text-4xl text-slate-200 leading-none select-none">"</span>
                    {r.comment || "No comment provided."}
                    <span className="absolute -bottom-6 right-4 text-4xl text-slate-200 leading-none select-none rotate-180">"</span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <button className="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <ThumbsUp className="h-3.5 w-3.5" /> 12 Helpful
                      </button>
                      <button className="flex items-center gap-1.5 hover:text-destructive transition-colors">
                        <Flag className="h-3.5 w-3.5" /> Report
                      </button>
                    </div>
                    <Badge variant="outline" className="rounded-lg h-6 border-slate-100 text-slate-500 font-medium text-[10px]">
                      Public Review
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserReviews;
