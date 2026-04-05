import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Eye,
  Star
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { toast } from "sonner";
import { adminService, Destination, Category } from "@/services/admin";
import { cn } from "@/lib/utils";

const AdminDestinations = () => {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [destData, catData] = await Promise.all([
        adminService.getAllDestinations(),
        adminService.getCategories()
      ]);
      setDestinations(Array.isArray(destData) ? destData : []);
      setCategories(Array.isArray(catData) ? catData : []);
    } catch (error) {
      console.error("Failed to load destinations:", error);
      toast.error("Failed to load destinations. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this destination?")) return;
    try {
      await adminService.deleteDestination(id);
      toast.success("Destination deleted successfully");
      setDestinations(destinations.filter(d => d.id !== id));
    } catch (error) {
      toast.error("Failed to delete destination");
    }
  };

  const filteredDestinations = destinations.filter(dest => {
    const matchesSearch = dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRegion = regionFilter === "all" || dest.region === regionFilter;
    return matchesSearch && matchesRegion;
  });

  const regions = Array.from(new Set(destinations.map(d => d.region)));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Destination Directory</h1>
            <p className="text-sm text-muted-foreground">Manage and monitor all tourist attractions, fees, and operational status.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 rounded-xl"
              onClick={() => navigate("/admin/destinations/new")}
            >
              <Plus className="h-4 w-4" /> Add Destination
            </Button>
            <Badge variant="secondary" className="px-3 py-1 bg-accent/30">{destinations.length} Total Spots</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row bg-card p-4 rounded-xl border border-border">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 bg-muted/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search destinations by name or location..."
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="All Regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Destination Information</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Region/Category</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Fee/Hours</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Engagement Stats</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Listing Status</TableHead>
                <TableHead className="px-6 py-4 font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Created At</TableHead>
                <TableHead className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Loading destinations...
                  </TableCell>
                </TableRow>
              ) : filteredDestinations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    No destinations found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredDestinations.map((dest) => (
                  <TableRow key={dest.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                          {dest.image_url ? (
                            <img
                              src={dest.image_url}
                              alt={dest.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div>
                          <Link
                            to={`/admin/destinations/${dest.id}`}
                            className="font-semibold text-slate-900 hover:text-primary transition-colors cursor-pointer block"
                          >
                            {dest.name}
                          </Link>
                          <div className="flex items-center text-xs text-muted-foreground mt-0.5">
                            <MapPin className="mr-1 h-3 w-3" />
                            {dest.region}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">{dest.region}</div>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {dest.category_name || "Uncategorized"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center">
                          <DollarSign className="mr-1 h-3 w-3" />
                          {dest.entrance_fee || "Free"}
                        </div>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-3 w-3" />
                          {dest.opening_hours}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{dest.rating || 0}</span>
                        <span className="text-xs text-muted-foreground">
                          ({dest.reviews_count || 0})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider border-none shadow-none",
                          dest.status === 'active'
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        {dest.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-medium text-xs">
                      {dest.created_at ? new Date(dest.created_at).toLocaleDateString('en-GB') : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/destinations/${dest.id}`)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => navigate(`/admin/destinations/${dest.id}/edit`)}>
                            <Edit2 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(dest.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>


    </DashboardLayout>
  );
};

export default AdminDestinations;
