import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Eye, AlertCircle, Building, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Listing } from "@/services/admin";
import { toast } from "sonner";

const AdminApprovals = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      // Filtering pending listings happens on the frontend for simplicity here, 
      // or we just fetch everything and filter.
      const data = await adminService.getListings();
      const listingsData = Array.isArray(data) ? data : [];
      setListings(listingsData.filter(l => l.status === 'pending'));
    } catch (error) {
      console.error("Failed to load approvals:", error);
      toast.error("Failed to load approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string, action: "approved" | "rejected") => {
    try {
      await adminService.updateListing(id, { status: action });
      setListings(listings.map((l) => l.id === id ? { ...l, status: action } : l));
      toast.success(`Listing ${action} successfully`);
    } catch (error) {
      console.error(`Failed to ${action} listing:`, error);
      toast.error(`Failed to update listing`);
    }
  };

  const filtered = listings.filter((l) => {
    const matchesSearch = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || l.type?.toLowerCase() === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">Listing Approvals</h2>
            <p className="text-muted-foreground">Review and approve service provider listings</p>
          </div>
          <Badge variant="secondary" className="gap-1">
            <AlertCircle className="h-3 w-3" /> {listings.filter((l) => l.status === "pending").length} pending
          </Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings or providers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="hotel">Hotel</SelectItem>
              <SelectItem value="tour">Tour</SelectItem>
              <SelectItem value="transport">Transport</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex justify-center p-8 rounded-xl border border-border bg-card">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground rounded-xl border border-border bg-card">
              No pending approvals found.
            </div>
          ) : (
            filtered.map((l) => (
              <div key={l.id} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
                    <Building className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{l.name}</p>
                    <p className="text-sm text-muted-foreground">{l.provider} • {l.type} • {l.location}</p>
                    <p className="text-xs text-muted-foreground">Submitted: {new Date(l.submitted || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {l.status === "pending" ? (
                    <>
                      <Button variant="ghost" size="sm" className="gap-1"><Eye className="h-3 w-3" /> Preview</Button>
                      <Button size="sm" variant="outline" className="gap-1 text-success hover:bg-success/10" onClick={() => handleAction(l.id, "approved")}>
                        <CheckCircle className="h-3 w-3" /> Approve
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1 text-destructive hover:bg-destructive/10" onClick={() => handleAction(l.id, "rejected")}>
                        <XCircle className="h-3 w-3" /> Reject
                      </Button>
                    </>
                  ) : (
                    <Badge className={l.status === "approved" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}>
                      {l.status === "approved" ? <CheckCircle className="mr-1 h-3 w-3" /> : <XCircle className="mr-1 h-3 w-3" />}
                      {l.status}
                    </Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovals;
