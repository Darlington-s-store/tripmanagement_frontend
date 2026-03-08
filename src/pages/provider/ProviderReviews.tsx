import { Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/layout/DashboardLayout";

const reviews = [
  { id: 1, user: "Kofi Mensah", service: "Labadi Beach Hotel", rating: 5, comment: "Wonderful stay! Great views and excellent service.", date: "Mar 10, 2026", responded: true, response: "Thank you, Kofi! We look forward to hosting you again." },
  { id: 2, user: "Ama Osei", service: "Cape Coast Tour", rating: 4, comment: "Great tour, very informative. Would recommend to others.", date: "Mar 8, 2026", responded: false, response: "" },
  { id: 3, user: "James Owusu", service: "Labadi Beach Hotel", rating: 5, comment: "Best hotel experience in Ghana. Highly recommend!", date: "Mar 5, 2026", responded: true, response: "Thank you James! Glad you enjoyed your stay." },
];

const ProviderReviews = () => (
  <DashboardLayout role="provider">
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-bold">Reviews</h2>
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-primary text-primary" />
          <span className="font-display text-xl font-bold">4.7</span>
          <span className="text-sm text-muted-foreground">avg rating</span>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-medium text-primary text-xs">
                  {r.user.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-medium">{r.user}</p>
                  <p className="text-xs text-muted-foreground">{r.service} • {r.date}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">"{r.comment}"</p>

            {r.responded ? (
              <div className="mt-3 rounded-lg bg-muted p-3">
                <p className="mb-1 text-xs font-medium">Your response:</p>
                <p className="text-sm text-muted-foreground">{r.response}</p>
              </div>
            ) : (
              <div className="mt-3">
                <Textarea placeholder="Write a response..." rows={2} className="mb-2" />
                <Button size="sm" className="gap-1"><MessageSquare className="h-3 w-3" /> Respond</Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </DashboardLayout>
);

export default ProviderReviews;
