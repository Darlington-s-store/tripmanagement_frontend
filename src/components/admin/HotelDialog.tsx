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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { hotelsService, Hotel } from "@/services/hotels";

interface HotelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    hotel: Hotel | null;
    onSuccess: () => void;
}

const HotelDialog = ({ open, onOpenChange, hotel, onSuccess }: HotelDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Hotel>>({
        name: "",
        location: "",
        region: "",
        description: "",
        price_per_night: 0,
        amenities: "",
        image_url: "",
        rating: 5,
        total_rooms: 0,
    });

    useEffect(() => {
        if (hotel) {
            setFormData({
                name: hotel.name,
                location: hotel.location,
                region: hotel.region,
                description: hotel.description,
                price_per_night: hotel.price_per_night,
                amenities: hotel.amenities,
                image_url: hotel.image_url,
                rating: hotel.rating,
                total_rooms: hotel.total_rooms || 0,
            });
        } else {
            setFormData({
                name: "",
                location: "",
                region: "Greater Accra",
                description: "",
                price_per_night: 0,
                amenities: "Wifi, AC, Parking, Restaurant",
                image_url: "",
                rating: 5,
                total_rooms: 0,
            });
        }
    }, [hotel, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (hotel) {
                await hotelsService.updateHotel(hotel.id, formData);
                toast.success("Hotel updated successfully");
            } else {
                await hotelsService.createHotel(
                    formData.name!,
                    formData.location!,
                    formData.price_per_night!,
                    formData.description,
                    formData.amenities,
                    formData.total_rooms || 0,
                    formData.image_url,
                    formData.region
                );
                toast.success("Hotel created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save hotel:", error);
            toast.error("Failed to save hotel. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl overflow-y-auto max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle>{hotel ? "Edit Hotel" : "Add New Hotel"}</DialogTitle>
                    <DialogDescription>
                        {hotel ? "Update the details of the hotel." : "Enter the details for the new hotel listing."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Hotel Name</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Labadi Beach Hotel"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="region">Region</Label>
                            <Select
                                value={formData.region}
                                onValueChange={(value) => setFormData({ ...formData, region: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Region" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Greater Accra">Greater Accra</SelectItem>
                                    <SelectItem value="Ashanti">Ashanti</SelectItem>
                                    <SelectItem value="Central">Central</SelectItem>
                                    <SelectItem value="Western">Western</SelectItem>
                                    <SelectItem value="Eastern">Eastern</SelectItem>
                                    <SelectItem value="Volta">Volta</SelectItem>
                                    <SelectItem value="Northern">Northern</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="location">Location (City/Area)</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                placeholder="e.g. Accra"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="price">Base Price per Night (GH₵)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={formData.price_per_night}
                                onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) })}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image_url">Main Image URL</Label>
                        <Input
                            id="image_url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://images.unsplash.com/..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the hotel experience..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amenities">Amenities (comma separated)</Label>
                        <Input
                            id="amenities"
                            value={formData.amenities}
                            onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                            placeholder="Wifi, AC, Parking, Restaurant, Spa"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rating">Star Rating (1-5)</Label>
                            <Input
                                id="rating"
                                type="number"
                                min="1"
                                max="5"
                                step="0.1"
                                value={formData.rating}
                                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="total_rooms">Total Number of Rooms</Label>
                            <Input
                                id="total_rooms"
                                type="number"
                                min="0"
                                value={formData.total_rooms}
                                onChange={(e) => setFormData({ ...formData, total_rooms: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : hotel ? "Update Hotel" : "Create Hotel"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default HotelDialog;
