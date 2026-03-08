import { useState, useEffect } from "react";
import { Building, Search, Eye, MoreVertical, Ban, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Listing } from "@/services/admin";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  active: "bg-success/10 text-success",
  approved: "bg-success/10 text-success",
  pending: "bg-warning/10 text-warning",
  suspended: "bg-destructive/10 text-destructive",
};

const AdminListings = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getListings();
      setListings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load listings:", error);
      toast.error("Failed to load listings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateListing(id, { status: newStatus });
      setListings(listings.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast.success(`Listing status updated to ${newStatus}`);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update listing status");
    }
  };

  const filtered = listings.filter((l) => {
    const matchesSearch = l.name?.toLowerCase().includes(searchQuery.toLowerCase()) || l.provider?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || l.type?.toLowerCase() === typeFilter;
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">All Listings</h2>
            <p className="text-muted-foreground">Manage all service provider listings</p>
          </div>
          <Badge variant="secondary">{listings.length} listings</Badge>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search listings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
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
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active/Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Listing</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Provider</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Bookings</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    <div className="flex justify-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">No listings found.</td>
                </tr>
              ) : filtered.map((l) => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{l.name}</td>
                  <td className="px-4 py-3"><Badge variant="secondary">{l.type}</Badge></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.provider}</td>
                  <td className="px-4 py-3 text-muted-foreground">{l.location}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[l.status] || "bg-secondary text-secondary-foreground"}`}>
                      {l.status === 'approved' ? 'active' : l.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">{l.bookings || 0}</td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2"><Eye className="h-3 w-3" /> View</DropdownMenuItem>
                        {l.status !== 'approved' && l.status !== 'active' && (
                          <DropdownMenuItem className="gap-2" onClick={() => handleUpdateStatus(l.id, 'approved')}>
                            <CheckCircle className="h-3 w-3 text-success" /> Activate
                          </DropdownMenuItem>
                        )}
                        {l.status !== 'suspended' && (
                          <DropdownMenuItem className="gap-2 text-destructive" onClick={() => handleUpdateStatus(l.id, 'suspended')}>
                            <Ban className="h-3 w-3" /> Suspend
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminListings;
