import { useState } from "react";
import { 
    Star, 
    MessageSquare, 
    ThumbsUp,
    MoreHorizontal,
    Calendar,
    Send,
    X,
    Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Review } from "@/services/reviews";
import { format } from "date-fns";

interface ReviewsSectionProps {
    attractionId: string;
    reviews: Review[];
    onAddReview?: (rating: number, comment: string) => Promise<void>;
    isAuthenticated: boolean;
}

export const ReviewsSection = ({ attractionId, reviews, onAddReview, isAuthenticated }: ReviewsSectionProps) => {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const averageRating = reviews.length > 0 
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : "0.0";

    const ratingCounts = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 
            ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 
            : 0
    }));

    const handleSubmit = async () => {
        if (!onAddReview || rating === 0 || !comment.trim()) return;
        
        try {
            setSubmitting(true);
            await onAddReview(rating, comment);
            setRating(0);
            setComment("");
            setShowForm(false);
        } catch (error) {
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-12">
            {/* Summary Statistics */}
            <div className="grid gap-8 md:grid-cols-3 items-start bg-white p-8 rounded-3xl border border-border shadow-sm">
                <div className="text-center space-y-2">
                    <h3 className="text-5xl font-bold text-primary">{averageRating}</h3>
                    <div className="flex justify-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star 
                                key={star} 
                                className={`h-5 w-5 ${star <= Math.round(Number(averageRating)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'}`} 
                            />
                        ))}
                    </div>
                    <p className="text-muted-foreground font-medium">{reviews.length} total reviews</p>
                </div>

                <div className="md:col-span-2 space-y-3">
                    {ratingCounts.map(({ star, count, percentage }) => (
                        <div key={star} className="flex items-center gap-4 group">
                            <span className="text-sm font-medium w-4 tabular-nums">{star}</span>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 shrink-0" />
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-1000 group-hover:bg-primary/80" 
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="text-sm text-muted-foreground w-8 tabular-nums">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Header & Write Review Toggle */}
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold flex items-center gap-2">
                    <MessageSquare className="h-6 w-6 text-primary" />
                    Guest Reviews
                </h3>
                {isAuthenticated && !showForm && (
                    <Button onClick={() => setShowForm(true)} className="rounded-2xl">
                        Write a Review
                    </Button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="bg-white p-8 rounded-3xl border-2 border-primary/20 shadow-lg animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg">Your Experience</h4>
                        <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} className="rounded-full">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold">How would you rate your visit?</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className="transition-transform active:scale-95 group"
                                    >
                                        <Star 
                                            className={`h-8 w-8 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20 group-hover:text-yellow-400/50'}`} 
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold">Tell us more details</label>
                            <Textarea 
                                placeholder="What did you like the most? Any advice for other travelers?"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="min-h-[120px] rounded-2xl resize-none focus-visible:ring-primary"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setShowForm(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button 
                                onClick={handleSubmit} 
                                disabled={submitting || rating === 0 || !comment.trim()}
                                className="rounded-xl px-8 shadow-lg shadow-primary/20"
                            >
                                {submitting ? "Posting..." : "Post Review"}
                                <Send className="ml-2 h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-6 p-4 rounded-xl bg-primary/5 text-xs text-primary flex gap-2">
                        <Check className="h-4 w-4 shrink-0" />
                        <p>Reviews are moderated to ensure high quality and relevant content for our community.</p>
                    </div>
                </div>
            )}

            {/* Reviews List */}
            <div className="grid gap-6">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-3xl border border-border group transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-12 w-12 border-2 border-primary/10">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${review.reviewer_name}`} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                            {review.reviewer_name?.substring(0, 2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h5 className="font-bold leading-none mb-1">{review.reviewer_name}</h5>
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star 
                                                        key={s} 
                                                        className={`h-3 w-3 ${s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/20'}`} 
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                {format(new Date(review.created_at), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-muted-foreground hover:text-primary transition-colors">
                                    <MoreHorizontal className="h-5 w-5" />
                                </button>
                            </div>

                            <div className="pl-15 ml-15">
                                {review.title && <h6 className="font-bold mb-2">{review.title}</h6>}
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                    {review.comment}
                                </p>
                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                                        <ThumbsUp className="h-3.5 w-3.5" />
                                        Helpful
                                    </button>
                                    <button className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors">
                                        Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 bg-muted/20 rounded-3xl border border-dashed border-muted-foreground/30">
                        <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                        <h4 className="font-semibold text-muted-foreground">No reviews yet</h4>
                        <p className="text-sm text-muted-foreground/70">Be the first to share your experience!</p>
                    </div>
                )}
            </div>
            
            {reviews.length > 5 && (
                <div className="text-center">
                    <Button variant="outline" className="rounded-2xl px-8 border-primary/20 text-primary hover:bg-primary/5">
                        Load More Reviews
                    </Button>
                </div>
            )}
        </div>
    );
};
