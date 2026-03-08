import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Calendar,
    FileText,
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
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService, SuggestedItinerary, Destination } from "@/services/admin";
import ItineraryDialog from "@/components/admin/ItineraryDialog";

const AdminSuggestedItineraries = () => {
    const [itineraries, setItineraries] = useState<SuggestedItinerary[]>([]);
    const [destinations, setDestinations] = useState<Destination[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedItinerary, setSelectedItinerary] = useState<SuggestedItinerary | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [itinerariesData, destinationsData] = await Promise.all([
                adminService.getSuggestedItineraries(),
                adminService.getAllDestinations()
            ]);
            setItineraries(Array.isArray(itinerariesData) ? itinerariesData : []);
            setDestinations(Array.isArray(destinationsData) ? destinationsData : []);
        } catch (error) {
            console.error("Failed to load data:", error);
            toast.error("Failed to load suggested itineraries");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedItinerary(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (itinerary: SuggestedItinerary) => {
        setSelectedItinerary(itinerary);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this itinerary?")) return;
        try {
            await adminService.deleteSuggestedItinerary(id);
            toast.success("Itinerary deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete itinerary");
        }
    };

    const filtered = itineraries.filter(it =>
        it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        it.destination_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Suggested Itineraries</h2>
                        <p className="text-muted-foreground">
                            Manage pre-built trip plans for travellers.
                        </p>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Itinerary
                    </Button>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search itineraries..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Itinerary</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Loading itineraries...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        No itineraries found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((it) => (
                                    <TableRow key={it.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                    {it.image_url ? (
                                                        <img
                                                            src={it.image_url}
                                                            alt={it.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <FileText className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium">{it.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{it.destination_name}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center text-sm">
                                                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                                                {it.duration_days} Days
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(it)}>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(it.id)}
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

            <ItineraryDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                itinerary={selectedItinerary}
                destinations={destinations}
                onSuccess={loadData}
            />
        </DashboardLayout>
    );
};

export default AdminSuggestedItineraries;
