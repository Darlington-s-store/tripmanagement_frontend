import { useState, useEffect } from "react";
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
import { toast } from "sonner";
import { adminService, Destination, Category } from "@/services/admin";
import DestinationDialog from "@/components/admin/DestinationDialog";

const AdminDestinations = () => {
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("all");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

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

    const handleAdd = () => {
        setSelectedDestination(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (destination: Destination) => {
        setSelectedDestination(destination);
        setIsDialogOpen(true);
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
                        <h2 className="text-2xl font-bold tracking-tight">Destinations</h2>
                        <p className="text-muted-foreground">
                            Manage main tourist destinations and locations in Ghana.
                        </p>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Destination
                    </Button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search destinations..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={regionFilter}
                            onChange={(e) => setRegionFilter(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">All Regions</option>
                            {regions.map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Destination</TableHead>
                                <TableHead>Region/Category</TableHead>
                                <TableHead>Fee/Hours</TableHead>
                                <TableHead>Stats</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        Loading destinations...
                                    </TableCell>
                                </TableRow>
                            ) : filteredDestinations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
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
                                                    <div className="font-medium">{dest.name}</div>
                                                    <div className="flex items-center text-xs text-muted-foreground">
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
                                                variant={dest.status === "published" ? "default" : "secondary"}
                                            >
                                                {dest.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(dest)}>
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

            <DestinationDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                destination={selectedDestination}
                categories={categories}
                onSuccess={loadData}
            />
        </DashboardLayout>
    );
};

export default AdminDestinations;
