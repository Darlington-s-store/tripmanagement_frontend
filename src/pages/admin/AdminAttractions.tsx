import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { adminService, Attraction, Destination } from "@/services/admin";
import AttractionDialog from "@/components/admin/AttractionDialog";

const AdminAttractions = () => {
    const navigate = useNavigate();
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

                <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="font-bold py-4">Attraction</TableHead>
                                <TableHead className="font-bold">Destination/Category</TableHead>
                                <TableHead className="font-bold">Fee/Hours</TableHead>
                                <TableHead className="font-bold">Status</TableHead>
                                <TableHead className="text-right font-bold pr-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-medium">
                                        Loading attractions...
                                    </TableCell>
                                </TableRow>
                            ) : filteredAttractions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground font-medium">
                                        No attractions found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttractions.map((attr) => (
                                    <TableRow key={attr.id} className="group hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-lg bg-muted ring-1 ring-slate-200">
                                                    {attr.image_url ? (
                                                        <img
                                                            src={attr.image_url}
                                                            alt={attr.name}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Landmark className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div 
                                                    className="font-bold text-slate-800 hover:text-orange-600 transition-colors cursor-pointer"
                                                    onClick={() => navigate(`/admin/attractions/${attr.id}`)}
                                                >
                                                    {attr.name}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="text-sm font-bold text-slate-700">{attr.destination_name}</div>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider py-0 px-2">
                                                    {attr.category}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1 text-xs">
                                                <div className="flex items-center font-medium text-slate-600">
                                                    <DollarSign className="mr-1 h-3 w-3 text-emerald-500" />
                                                    {attr.entrance_fee || "Free"}
                                                </div>
                                                <div className="flex items-center font-medium text-slate-500">
                                                    <Clock className="mr-1 h-3 w-3 text-orange-400" />
                                                    {attr.opening_hours}
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={cn(
                                                    "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                                                    attr.status === 'published' 
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" 
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                                )}
                                            >
                                                {attr.status === 'published' ? 'Active' : 'Inactive'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48 rounded-xl p-2 shadow-xl border-slate-100">
                                                    <DropdownMenuItem 
                                                        className="gap-2 rounded-lg py-2"
                                                        onClick={() => navigate(`/admin/attractions/${attr.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 text-orange-500" /> View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem 
                                                        className="gap-2 rounded-lg py-2"
                                                        onClick={() => handleEdit(attr)}
                                                    >
                                                        <Edit2 className="h-4 w-4 text-slate-500" /> Edit Attraction
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="gap-2 rounded-lg py-2 text-destructive focus:text-destructive focus:bg-red-50"
                                                        onClick={() => handleDelete(attr.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" /> Delete Permanently
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
