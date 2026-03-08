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
    Building,
    MapPin,
    Image as ImageIcon,
    Star,
    Bed,
    Loader2
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
import { hotelsService, Hotel, HotelRoom } from "@/services/hotels";
import HotelDialog from "@/components/admin/HotelDialog";
import RoomDialog from "@/components/admin/RoomDialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

const AdminHotels = () => {
    const [hotels, setHotels] = useState<Hotel[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [regionFilter, setRegionFilter] = useState("all");

    // Hotel Dialog state
    const [isHotelDialogOpen, setIsHotelDialogOpen] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    // Room Dialog & List state
    const [isRoomListOpen, setIsRoomListOpen] = useState(false);
    const [currentHotelRooms, setCurrentHotelRooms] = useState<HotelRoom[]>([]);
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
    const [activeHotelId, setActiveHotelId] = useState<string | null>(null);

    useEffect(() => {
        loadHotels();
    }, []);

    const loadHotels = async () => {
        try {
            setLoading(true);
            const data = await hotelsService.searchHotels({});
            setHotels(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load hotels:", error);
            toast.error("Failed to load hotels.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddHotel = () => {
        setSelectedHotel(null);
        setIsHotelDialogOpen(true);
    };

    const handleEditHotel = (hotel: Hotel) => {
        setSelectedHotel(hotel);
        setIsHotelDialogOpen(true);
    };

    const handleDeleteHotel = async (id: string) => {
        if (!confirm("Are you sure you want to delete this hotel? All associated rooms will also be deleted.")) return;
        try {
            await hotelsService.deleteHotel(id);
            toast.success("Hotel deleted successfully");
            setHotels(hotels.filter(h => h.id !== id));
        } catch (error) {
            toast.error("Failed to delete hotel");
        }
    };

    const handleManageRooms = async (hotel: Hotel) => {
        setActiveHotelId(hotel.id);
        setIsRoomListOpen(true);
        // Rooms are usually sideloaded if using getHotelById, but let's fetch full hotel detail
        try {
            const fullHotel = await hotelsService.getHotelById(hotel.id);
            setCurrentHotelRooms(fullHotel.rooms || []);
        } catch (error) {
            toast.error("Failed to load rooms");
        }
    };

    const handleAddRoom = () => {
        setSelectedRoom(null);
        setIsRoomDialogOpen(true);
    };

    const handleEditRoom = (room: HotelRoom) => {
        setSelectedRoom(room);
        setIsRoomDialogOpen(true);
    };

    const handleDeleteRoom = async (id: string) => {
        if (!confirm("Delete this room type?")) return;
        try {
            await hotelsService.deleteRoom(id);
            toast.success("Room deleted");
            setCurrentHotelRooms(currentHotelRooms.filter(r => r.id !== id));
        } catch (error) {
            toast.error("Failed to delete room");
        }
    };

    const filteredHotels = hotels.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRegion = regionFilter === "all" || h.region === regionFilter;
        return matchesSearch && matchesRegion;
    });

    const regions = Array.from(new Set(hotels.map(h => h.region).filter(Boolean)));

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Hotel Management</h2>
                        <p className="text-muted-foreground">
                            Manage your hotel inventory, room types, and pricing.
                        </p>
                    </div>
                    <Button className="w-full sm:w-auto" onClick={handleAddHotel}>
                        <Plus className="mr-2 h-4 w-4" /> Add Hotel
                    </Button>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search hotels..."
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
                                <option key={r} value={r!}>{r}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hotel</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Starting Price</TableHead>
                                <TableHead>Rooms</TableHead>
                                <TableHead>Rating</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Loading hotels...
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : filteredHotels.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center">
                                        No hotels found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredHotels.map((h) => (
                                    <TableRow key={h.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 overflow-hidden rounded-md bg-muted">
                                                    {h.image_url ? (
                                                        <img
                                                            src={h.image_url}
                                                            alt={h.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <Building className="h-5 w-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="font-medium">{h.name}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm">{h.location}</span>
                                                <span className="text-xs text-muted-foreground">{h.region}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>GH₵ {Number(h.price_per_night).toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="sm" onClick={() => handleManageRooms(h)} className="text-primary font-medium p-0 h-auto hover:bg-transparent">
                                                {h.total_rooms || 0} Rooms / Manage
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                <span>{h.rating}</span>
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
                                                    <DropdownMenuItem onClick={() => handleEditHotel(h)}>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleManageRooms(h)}>
                                                        <Bed className="mr-2 h-4 w-4" /> Manage Rooms
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteHotel(h.id)}
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

            {/* Hotel Edit/Add Dialog */}
            <HotelDialog
                open={isHotelDialogOpen}
                onOpenChange={setIsHotelDialogOpen}
                hotel={selectedHotel}
                onSuccess={loadHotels}
            />

            {/* Room List Dialog */}
            <Dialog open={isRoomListOpen} onOpenChange={setIsRoomListOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between pr-8">
                            <div>
                                <DialogTitle>Manage Room Types</DialogTitle>
                                <DialogDescription>Configure details for each room type available in this hotel.</DialogDescription>
                            </div>
                            <Button size="sm" onClick={handleAddRoom}>
                                <Plus className="h-4 w-4 mr-2" /> Add Room Type
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="mt-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead>Capacity</TableHead>
                                    <TableHead>Availability</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentHotelRooms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                            No room types defined. Add one to start accepting bookings.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentHotelRooms.map((room) => (
                                        <TableRow key={room.id}>
                                            <TableCell className="font-medium">{room.room_type}</TableCell>
                                            <TableCell>GH₵ {room.price_per_night}</TableCell>
                                            <TableCell>{room.capacity} Persons</TableCell>
                                            <TableCell>
                                                <Badge variant={room.available_count > 0 ? "default" : "destructive"}>
                                                    {room.available_count} Available
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEditRoom(room)}>
                                                        <Edit2 className="h-4 w-4 text-muted-foreground" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteRoom(room.id)}>
                                                        <Trash2 className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Individual Room Add/Edit Dialog */}
            <RoomDialog
                open={isRoomDialogOpen}
                onOpenChange={setIsRoomDialogOpen}
                hotelId={activeHotelId!}
                room={selectedRoom}
                onSuccess={() => {
                    if (activeHotelId) {
                        hotelsService.getHotelById(activeHotelId).then(h => setCurrentHotelRooms(h.rooms || []));
                    }
                    loadHotels();
                }}
            />
        </DashboardLayout>
    );
};

export default AdminHotels;
