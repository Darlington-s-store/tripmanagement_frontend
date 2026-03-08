import { useState, useEffect } from "react";
import { Building, Plus, Edit, Trash2, Eye, Star, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { providerService, ProviderListing } from "@/services/provider";
import { toast } from "sonner";
import { Link } from "react-router-dom";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  inactive: "bg-muted text-muted-foreground",
  approved: "bg-success/10 text-success",
};

const ProviderListings = () => {
  const [listings, setListings] = useState<ProviderListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const data = await providerService.getListings();
      setListings(data);
    } catch (error) {
      console.error("Failed to load listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="provider">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="provider">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">My Listings</h2>
          <Button className="gap-1">
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
        </div>

        <div className="space-y-4">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                  <Building className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{l.name}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <Badge variant="secondary">{l.type}</Badge>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[l.status] || "bg-muted text-muted-foreground"}`}>
                      {l.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold">{l.booking_count}</p>
                  <p className="text-xs text-muted-foreground">Bookings</p>
                </div>
                {Number(l.rating) > 0 && (
                  <div className="text-center">
                    <p className="flex items-center gap-1 font-semibold"><Star className="h-3 w-3 fill-primary text-primary" /> {Number(l.rating).toFixed(1)}</p>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                )}
                <div className="text-center">
                  <p className="font-semibold text-primary">GH₵{Number(l.price || 0).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Price</p>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/hotels/${l.id}`}><Eye className="h-4 w-4" /></Link>
                  </Button>
                  <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </div>
          ))}
          {listings.length === 0 && (
            <div className="rounded-xl border border-dashed border-border py-20 text-center">
              <p className="text-muted-foreground mb-4">You don't have any listings yet.</p>
              <Button variant="outline">Create Your First Listing</Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProviderListings;
