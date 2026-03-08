import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Attraction, Destination, adminService } from "@/services/admin";
import { toast } from "sonner";

interface AttractionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    attraction?: Attraction | null;
    destinations: Destination[];
    onSuccess: () => void;
}

const AttractionDialog = ({ open, onOpenChange, attraction, destinations, onSuccess }: AttractionDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Attraction>>({
        name: "",
        destination_id: "",
        category: "",
        description: "",
        image_url: "",
        entrance_fee: "",
        opening_hours: "",
        location_map: "",
        status: "published"
    });

    useEffect(() => {
        if (attraction) {
            setFormData({
                name: attraction.name,
                destination_id: attraction.destination_id,
                category: attraction.category,
                description: attraction.description,
                image_url: attraction.image_url,
                entrance_fee: attraction.entrance_fee,
                opening_hours: attraction.opening_hours,
                location_map: attraction.location_map,
                status: attraction.status
            });
        } else {
            setFormData({
                name: "",
                destination_id: "",
                category: "",
                description: "",
                image_url: "",
                entrance_fee: "",
                opening_hours: "",
                location_map: "",
                status: "published"
            });
        }
    }, [attraction, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (attraction) {
                await adminService.updateAttraction(attraction.id, formData);
                toast.success("Attraction updated successfully");
            } else {
                await adminService.createAttraction(formData);
                toast.success("Attraction created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(attraction ? "Failed to update attraction" : "Failed to create attraction");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{attraction ? "Edit Attraction" : "Add New Attraction"}</DialogTitle>
                        <DialogDescription>
                            {attraction ? "Update the details for this specific attraction site." : "Enter the details for a new tourist attraction site."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="destination">Destination</Label>
                                <Select
                                    value={formData.destination_id}
                                    onValueChange={(value) => setFormData({ ...formData, destination_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select destination" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {destinations.map((dest) => (
                                            <SelectItem key={dest.id} value={dest.id}>
                                                {dest.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="e.g. Beaches, History"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published">Published</SelectItem>
                                        <SelectItem value="draft">Draft</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="image_url">Image URL</Label>
                            <Input
                                id="image_url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="entrance_fee">Entrance Fee</Label>
                                <Input
                                    id="entrance_fee"
                                    value={formData.entrance_fee}
                                    onChange={(e) => setFormData({ ...formData, entrance_fee: e.target.value })}
                                    placeholder="e.g. Free"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="opening_hours">Opening Hours</Label>
                                <Input
                                    id="opening_hours"
                                    value={formData.opening_hours}
                                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                                    placeholder="e.g. 9am - 5pm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="min-h-[100px]"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Attraction"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AttractionDialog;
