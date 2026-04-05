import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { reviewsService } from "@/services/reviews";

export const ReviewForm = () => {
    const [loading, setLoading] = useState(false);
    const [rating, setRating] = useState(5);
    const [hover, setHover] = useState(0);
    const [formData, setFormData] = useState({
        full_name: "",
        location: "",
        comment: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.full_name || !formData.comment) {
            toast.error("Please fill in your name and comment.");
            return;
        }

        try {
            setLoading(true);
            await reviewsService.submitReview({
                ...formData,
                rating,
            });
            toast.success("Thank you! Your review has been submitted for approval.");
            setFormData({ full_name: "", location: "", comment: "" });
            setRating(5);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit review. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-2xl border border-orange-100 bg-white p-8 shadow-sm max-w-lg mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Share your experience</h3>
            <p className="text-sm text-gray-500 mb-6">Your feedback helps other travelers explore Ghana better.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <p className="text-sm font-medium text-gray-700 mr-2">Your Rating:</p>
                    <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                className="p-0.5 transition-transform hover:scale-110"
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                onClick={() => setRating(star)}
                            >
                                <Star
                                    className={`h-6 w-6 ${(hover || rating) >= star ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <Input
                            placeholder="Full Name"
                            value={formData.full_name}
                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                            required
                            className="bg-gray-50/50"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Input
                            placeholder="Location (e.g. Accra)"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="bg-gray-50/50"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <Textarea
                        placeholder="Tell us about your trip..."
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        required
                        className="bg-gray-50/50 min-h-[100px]"
                    />
                </div>

                <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Review
                </Button>
            </form>
        </div>
    );
};
