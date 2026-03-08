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
    MapPin,
    Image as ImageIcon,
    DollarSign,
    Clock,
    Landmark,
    Eye
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
import { adminService, Attraction, Destination } from "@/services/admin";
import AttractionDialog from "@/components/admin/AttractionDialog";

const AdminAttractions = () => {
    const [attractions, setAttractions] = useState<Attraction[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [destFilter, setDestFilter] = useState("all");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [attrData, destData] = await Promise.all([
                adminService.getAllAttractions(),
                adminService.getAllDestinations()
            ]);
            setAttractions(Array.isArray(attrData) ? attrData : []);
            setDestinations(Array.isArray(destData) ? destData : []);
        } catch (error) {
            console.error("Failed to load attractions:", error);
            toast.error("Failed to load attractions");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedAttraction(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (attraction: Attraction) => {
        setSelectedAttraction(attraction);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this attraction?")) return;
        try {
            await adminService.deleteAttraction(id);
            toast.success("Attraction deleted successfully");
            loadData();
        } catch (error) {
            toast.error("Failed to delete attraction");
        }
    };

    const filteredAttractions = attractions.filter(attr => {
        const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attr.category.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDest = destFilter === "all" || attr.destination_id === destFilter;
        return matchesSearch && matchesDest;
    });

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Tourist Attractions</h2>
                        <p className="text-muted-foreground">
                            Manage specific points of interest within destinations.
                        </p>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Attraction
                    </Button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search attractions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <select
                            value={destFilter}
                            onChange={(e) => setDestFilter(e.target.value)}
                            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                            <option value="all">All Destinations</option>
                            {destinations.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Attraction</TableHead>
                                <TableHead>Destination/Category</TableHead>
                                <TableHead>Fee/Hours</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Loading attractions...
                                    </TableCell>
                                </TableRow>
                            ) : filteredAttractions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No attractions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttractions.map((attr) => (
                                    <TableRow key={attr.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                    {attr.image_url ? (
                                                        <img
                                                            src={attr.image_url}
                                                            alt={attr.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Landmark className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium">{attr.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">{attr.destination_name}</div>
                                                <Badge variant="outline" className="text-[10px] uppercase">
                                                    {attr.category}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center">
                                                    <DollarSign className="mr-1 h-3 w-3" />
                                                    {attr.entrance_fee || "Free"}
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="mr-1 h-3 w-3" />
                                                    {attr.opening_hours}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={attr.status === "published" ? "default" : "secondary"}
                                            >
                                                {attr.status}
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
                                                    <DropdownMenuItem onClick={() => handleEdit(attr)}>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(attr.id)}
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

            <AttractionDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                attraction={selectedAttraction}
                destinations={destinations}
                onSuccess={loadData}
            />
        </DashboardLayout>
    );
};

export default AdminAttractions;
