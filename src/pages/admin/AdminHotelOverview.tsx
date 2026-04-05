import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
    ArrowLeft, 
    MapPin, 
    Star, 
    Edit2, 
    Plus,
    Trash2,
    Loader2,
    AlertCircle,
    Users,
    ImageIcon,
    Bed,
    Info,
    CheckCircle2
} from "lucide-react";
import { hotelsService, Hotel, HotelRoom } from "@/services/hotels";
import { toast } from "sonner";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import RoomDialog from "@/components/admin/RoomDialog";

const AdminHotelOverview = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState<Hotel | null>(null);
    const [loading, setLoading] = useState(true);
    
    // Room management state
    const [isRoomDialogOpen, setIsRoomDialogOpen] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);

    const loadHotel = useCallback(async (hotelId: string) => {
        try {
            setLoading(true);
            const data = await hotelsService.getHotelById(hotelId);
            setHotel(data);
        } catch (error) {
            console.error("Failed to load hotel:", error);
            toast.error("Failed to load hotel details");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) {
            loadHotel(id);
        }
    }, [id, loadHotel]);

    const handleEditRoom = (room: HotelRoom) => {
        setSelectedRoom(room);
        setIsRoomDialogOpen(true);
    };

    const handleAddRoom = () => {
        setSelectedRoom(null);
        setIsRoomDialogOpen(true);
    };

    const handleDeleteRoom = async (roomId: string) => {
        if (!confirm("Are you sure you want to delete this room type?")) return;
        try {
            await hotelsService.deleteRoom(roomId);
            toast.success("Room type deleted");
            if (id) loadHotel(id);
        } catch (error) {
            toast.error("Failed to delete room");
        }
    };

    const handleDeleteHotel = async () => {
        if (!confirm("Are you sure you want to delete this hotel? This action cannot be undone.")) return;
        try {
            await hotelsService.deleteHotel(id!);
            toast.success("Hotel deleted successfully");
            navigate("/admin/hotels");
        } catch (error) {
            toast.error("Failed to delete hotel");
        }
    };

    if (loading) {
        return (
            <DashboardLayout role="admin">
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    if (!hotel) {
        return (
            <DashboardLayout role="admin">
                <div className="max-w-md mx-auto text-center space-y-4 pt-12">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Property Not Located</h2>
                    <p className="text-muted-foreground text-sm">
                        The hotel you are looking for might have been decommissioned or the ID is invalid.
                    </p>
                    <Button onClick={() => navigate("/admin/hotels")} variant="outline" className="rounded-xl">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
                    </Button>
                </div>
            </DashboardLayout>
        );
    }

    const amenitiesList = hotel.amenities?.split(',').map(a => a.trim()).filter(Boolean) || [];

    return (
        <DashboardLayout role="admin">
            <div className="space-y-8 max-w-[1400px] mx-auto pb-12">
                {/* Clean Navigation & Actions Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                    <div className="space-y-1">
                        <button 
                            onClick={() => navigate("/admin/hotels")}
                            className="text-xs font-bold text-primary flex items-center hover:underline mb-2 uppercase tracking-wider"
                        >
                            <ArrowLeft className="h-3 w-3 mr-1.5" />
                            Return to Directory
                        </button>
                        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tighter">{hotel.name}</h1>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm font-medium text-muted-foreground">
                            <span className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1.5 text-primary" />
                                {hotel.location}, {hotel.region}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-slate-300 hidden sm:block" />
                            <span className="flex items-center">
                                <Star className="h-4 w-4 mr-1.5 fill-amber-400 text-amber-400" />
                                {hotel.rating} Star Property
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate(`/admin/hotels/${id}/edit`)}
                            className="rounded-xl border-border hover:bg-slate-50 font-bold"
                        >
                            <Edit2 className="h-4 w-4 mr-2" />
                            Settings
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleDeleteHotel}
                            className="rounded-xl font-bold bg-red-600 hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Decommission
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        {/* Main Visual Component - Simplified */}
                        <div className="group relative rounded-3xl overflow-hidden border border-border shadow-sm bg-muted aspect-[21/9]">
                            {hotel.image_url ? (
                                <img 
                                    src={hotel.image_url} 
                                    alt={hotel.name}
                                    className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center flex-col gap-3">
                                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                                    <p className="text-sm font-medium text-muted-foreground/60">No primary visual listed</p>
                                </div>
                            )}
                            <div className="absolute top-4 right-4">
                                <Badge className="bg-white/90 backdrop-blur-md text-slate-900 border-none px-3 py-1 text-[10px] font-black uppercase tracking-[0.1em] shadow-sm">
                                    Primary View
                                </Badge>
                            </div>
                        </div>

                        {/* Room Management - The Core Functionality */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                        <Bed className="h-6 w-6 text-primary" />
                                        Room Inventory
                                    </h2>
                                    <p className="text-muted-foreground text-sm font-medium">Manage specific room categories and real-time availability.</p>
                                </div>
                                <Button size="sm" onClick={handleAddRoom} className="rounded-xl font-bold h-10 shadow-primary-sm">
                                    <Plus className="h-4 w-4 mr-2" /> Define New Room Type
                                </Button>
                            </div>

                            <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-slate-50/50">
                                        <TableRow>
                                            <TableHead className="px-6 font-bold py-4 text-slate-800 text-[11px] uppercase tracking-widest leading-none">Categorization</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-widest leading-none">Base Rate</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-widest leading-none">Occupancy</TableHead>
                                            <TableHead className="font-bold text-slate-800 text-[11px] uppercase tracking-widest leading-none">Live Status</TableHead>
                                            <TableHead className="text-right font-bold pr-8 text-slate-800 text-[11px] uppercase tracking-widest leading-none">Ops</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {hotel.rooms && hotel.rooms.length > 0 ? (
                                            hotel.rooms.map((room) => (
                                                <TableRow key={room.id} className="group hover:bg-slate-50/50 transition-colors border-border/50">
                                                    <TableCell className="px-6 py-4 font-bold text-primary text-sm flex items-center gap-2">
                                                        <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                                                        {room.room_type}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-slate-900">
                                                        GH₵ {Number(room.price_per_night).toLocaleString()}
                                                        <span className="text-[10px] text-muted-foreground font-normal ml-0.5">/night</span>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                                                            <Users className="h-4 w-4 text-slate-400" />
                                                            {room.capacity} pax
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge 
                                                            variant="secondary"
                                                            className={`rounded-lg px-2.5 py-0.5 text-[10px] font-black uppercase tracking-tighter shadow-none border-none ${
                                                                room.available_count > 0 ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                                                            }`}
                                                        >
                                                            {room.available_count} UNITS AVAILABLE
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleEditRoom(room)}
                                                                className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-lg"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleDeleteRoom(room.id)}
                                                                className="h-8 w-8 text-destructive hover:bg-red-50 hover:text-red-700 rounded-lg"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="py-12 text-center text-muted-foreground bg-slate-50/30 italic font-medium">
                                                    No inventory defined. Start by adding a room type.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </div>

                    {/* Functional Sidebar */}
                    <div className="space-y-6">
                        {/* Summary Snapshot */}
                        <Card className="rounded-3xl border-border shadow-none overflow-hidden bg-slate-900 border-none text-white font-sans">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Inventory Status</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Global Capacity</div>
                                        <div className="text-4xl font-black tracking-tighter">{hotel.total_rooms || 0}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-[10px] text-emerald-400 uppercase font-black tracking-widest">Available</div>
                                        <div className="text-4xl font-black text-emerald-400 tracking-tighter">{hotel.available_rooms || 0}</div>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-800 space-y-4">
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <Bed className="h-4 w-4" /> Entry Point
                                        </span>
                                        <span className="text-white">GH₵ {Number(hotel.price_per_night).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm font-bold">
                                        <span className="text-slate-400 flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4" /> Reputation
                                        </span>
                                        <span className="text-white">{hotel.reviewCount || 0} Reviews</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Descriptive Info */}
                        <Card className="rounded-3xl border-border shadow-none">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Info className="h-4 w-4 text-primary" />
                                    Property Context
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    {hotel.description || "No property description provided."}
                                </p>
                                {amenitiesList.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-border/50">
                                        {amenitiesList.map((amenity, i) => (
                                            <Badge key={i} variant="outline" className="font-bold uppercase text-[9px] tracking-tighter bg-slate-50 text-slate-600 border-border/50">
                                                {amenity}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Visual Asset Management */}
                        <Card className="rounded-3xl border-border shadow-none">
                            <CardHeader className="flex flex-row items-center justify-between pb-3">
                                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon className="h-4 w-4 text-primary" />
                                    Gallery Assets
                                </CardTitle>
                                <Button variant="ghost" size="sm" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:bg-transparent">Manage</Button>
                            </CardHeader>
                            <CardContent>
                                {hotel.images && hotel.images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {hotel.images.slice(0, 4).map((img, i) => (
                                            <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-border group cursor-pointer">
                                                <img src={img} alt="hotel" className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-10 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                        <ImageIcon className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase">No auxiliary assets</p>
                                    </div>
                                )}
                                <Button variant="outline" className="w-full mt-4 rounded-xl border-border font-bold text-xs h-11" size="sm">
                                    <Plus className="h-3 w-3 mr-2" /> Upload Visuals
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Individual Room Add/Edit Dialog */}
            <RoomDialog
                open={isRoomDialogOpen}
                onOpenChange={setIsRoomDialogOpen}
                hotelId={id!}
                room={selectedRoom}
                onSuccess={() => {
                    if (id) loadHotel(id);
                }}
            />
        </DashboardLayout>
    );
};

export default AdminHotelOverview;
