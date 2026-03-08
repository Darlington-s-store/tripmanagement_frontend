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
import { Destination, Category, adminService } from "@/services/admin";
import { toast } from "sonner";

interface DestinationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destination?: Destination | null;
    categories: Category[];
    onSuccess: () => void;
}

const DestinationDialog = ({ open, onOpenChange, destination, categories, onSuccess }: DestinationDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Destination>>({
        name: "",
        region: "",
        category_id: "",
        description: "",
        image_url: "",
        entrance_fee: "",
        opening_hours: "",
        location_map: "",
        status: "published"
    });

    useEffect(() => {
        if (destination) {
            setFormData({
                name: destination.name,
                region: destination.region,
                category_id: destination.category_id,
                description: destination.description,
                image_url: destination.image_url,
                entrance_fee: destination.entrance_fee,
                opening_hours: destination.opening_hours,
                location_map: destination.location_map || "",
                status: destination.status
            });
        } else {
            setFormData({
                name: "",
                region: "",
                category_id: "",
                description: "",
                image_url: "",
                entrance_fee: "",
                opening_hours: "",
                location_map: "",
                status: "published"
            });
        }
    }, [destination, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (destination) {
                await adminService.updateDestination(destination.id, formData);
                toast.success("Destination updated successfully");
            } else {
                await adminService.createDestination(formData);
                toast.success("Destination created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(destination ? "Failed to update destination" : "Failed to create destination");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{destination ? "Edit Destination" : "Add New Destination"}</DialogTitle>
                        <DialogDescription>
                            {destination ? "Update the details for this destination." : "Provide the information for the new tourist destination."}
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
                                <Label htmlFor="region">Region</Label>
                                <Input
                                    id="region"
                                    value={formData.region}
                                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select
                                    value={formData.category_id}
                                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.id} value={cat.id}>
                                                {cat.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                        <div className="space-y-2">
                            <Label htmlFor="location_map">Map Location Embed URL</Label>
                            <Input
                                id="location_map"
                                value={formData.location_map}
                                onChange={(e) => setFormData({ ...formData, location_map: e.target.value })}
                                placeholder="Google Maps Embed URL"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="entrance_fee">Entrance Fee</Label>
                                <Input
                                    id="entrance_fee"
                                    value={formData.entrance_fee}
                                    onChange={(e) => setFormData({ ...formData, entrance_fee: e.target.value })}
                                    placeholder="e.g. GH₵ 50 or Free"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="opening_hours">Opening Hours</Label>
                                <Input
                                    id="opening_hours"
                                    value={formData.opening_hours}
                                    onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                                    placeholder="e.g. 8:00 AM - 5:00 PM"
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
                            {loading ? "Saving..." : "Save Destination"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DestinationDialog;
