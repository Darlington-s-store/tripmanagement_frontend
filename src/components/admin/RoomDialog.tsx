import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { hotelsService, HotelRoom } from "@/services/hotels";

interface RoomDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotelId: string;
    room: HotelRoom | null;
    onSuccess: () => void;
}

const RoomDialog = ({ open, onOpenChange, hotelId, room, onSuccess }: RoomDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<HotelRoom>>({
        room_type: "",
        price_per_night: 0,
        capacity: 2,
        available_count: 5,
        description: "",
        amenities: "",
    });

    useEffect(() => {
        if (room) {
            setFormData({
                room_type: room.room_type,
                price_per_night: room.price_per_night,
                capacity: room.capacity,
                available_count: room.available_count,
                description: room.description,
                amenities: room.amenities,
            });
        } else {
            setFormData({
                room_type: "",
                price_per_night: 0,
                capacity: 2,
                available_count: 5,
                description: "",
                amenities: "King Bed, TV, AC, Minibar",
            });
        }
    }, [room, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const data = { ...formData, hotel_id: hotelId };
            if (room) {
                await hotelsService.updateRoom(room.id, data);
                toast.success("Room updated successfully");
            } else {
                await hotelsService.createRoom(data);
                toast.success("Room created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save room:", error);
            toast.error("Failed to save room. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>{room ? "Edit Room" : "Add New Room"}</DialogTitle>
                    <DialogDescription>
                        {room ? "Update the details of the room type." : "Enter the details for the new room type."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="room_type">Room Type</Label>
                        <Input
                            id="room_type"
                            value={formData.room_type}
                            onChange={(e) => setFormData({ ...formData, room_type: e.target.value })}
                            placeholder="e.g. Deluxe Ocean View"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="room_price">Price per Night (GH₵)</Label>
                            <Input
                                id="room_price"
                                type="number"
                                value={formData.price_per_night}
                                onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="capacity">Capacity (Persons)</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="available_count">Units Available</Label>
                        <Input
                            id="available_count"
                            type="number"
                            value={formData.available_count}
                            onChange={(e) => setFormData({ ...formData, available_count: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="room_desc">Description</Label>
                        <Textarea
                            id="room_desc"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Briefly describe this room type..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="room_amenities">Amenities (comma separated)</Label>
                        <Input
                            id="room_amenities"
                            value={formData.amenities || ""}
                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            placeholder="King Bed, TV, AC, Minibar"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : room ? "Update Room" : "Create Room"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default RoomDialog;
