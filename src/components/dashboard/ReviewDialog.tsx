import React, { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Star, Loader2 } from "lucide-react";
import { reviewsService } from "@/services/reviews";
import { toast } from "sonner";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    bookingId: string;
    serviceName: string;
    onSuccess?: () => void;
}

const ReviewDialog: React.FC<ReviewDialogProps> = ({
    isOpen,
    onClose,
    bookingId,
    serviceName,
    onSuccess,
}) => {
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [title, setTitle] = useState("");
    const [comment, setComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        setIsSubmitting(true);
        try {
            await reviewsService.createReview(bookingId, rating, title, comment);
            toast.success("Review submitted! It will appear after moderation.");
            onSuccess?.();
            onClose();
            // Reset form
            setRating(5);
            setTitle("");
            setComment("");
        } catch (error: any) {
            toast.error(error.message || "Failed to submit review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl overflow-hidden border-none shadow-2xl">
                <DialogHeader className="pt-6 px-6">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-600 bg-clip-text text-transparent">
                        Rate Your Experience
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground mt-2">
                        How was your stay/service at <span className="font-semibold text-foreground">{serviceName}</span>?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6 p-6">
                    <div className="space-y-4">
                        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-100">
                            <Label className="text-sm font-medium mb-4 text-muted-foreground uppercase tracking-wider">
                                Overall Rating
                            </Label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className="focus:outline-none transition-transform hover:scale-125 duration-200"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star
                                            className={`h-10 w-10 transition-colors ${(hover || rating) >= star
                                                    ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]"
                                                    : "text-slate-300"
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            <span className="mt-4 text-lg font-bold text-primary italic">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-sm font-semibold pl-1">Review Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g., Amazing hospitality!"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="rounded-xl border-slate-200 focus:ring-primary/20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="comment" className="text-sm font-semibold pl-1">Detailed Feedback</Label>
                            <Textarea
                                id="comment"
                                placeholder="Tell us more about your experience..."
                                rows={4}
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="rounded-xl border-slate-200 focus:ring-primary/20 resize-none"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="rounded-xl h-12 hover:bg-slate-100 font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-xl h-12 px-8 font-bold gap-2 min-w-[140px] shadow-lg shadow-primary/20 transition-all hover:shadow-primary/30 active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                "Post Review"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ReviewDialog;
