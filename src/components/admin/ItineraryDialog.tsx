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
import { SuggestedItinerary, Destination, adminService } from "@/services/admin";
import { toast } from "sonner";

interface ItineraryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    itinerary?: SuggestedItinerary | null;
    destinations: Destination[];
    onSuccess: () => void;
}

const ItineraryDialog = ({ open, onOpenChange, itinerary, destinations, onSuccess }: ItineraryDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<SuggestedItinerary>>({
        title: "",
        destination_id: "",
        description: "",
        duration_days: 1,
        image_url: ""
    });

    useEffect(() => {
        if (itinerary) {
            setFormData({
                title: itinerary.title,
                destination_id: itinerary.destination_id,
                description: itinerary.description,
                duration_days: itinerary.duration_days,
                image_url: itinerary.image_url
            });
        } else {
            setFormData({
                title: "",
                destination_id: "",
                description: "",
                duration_days: 1,
                image_url: ""
            });
        }
    }, [itinerary, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (itinerary) {
                await adminService.updateSuggestedItinerary(itinerary.id, formData);
                toast.success("Itinerary updated successfully");
            } else {
                await adminService.createSuggestedItinerary(formData);
                toast.success("Itinerary created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(itinerary ? "Failed to update itinerary" : "Failed to create itinerary");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{itinerary ? "Edit Itinerary" : "Add New Itinerary"}</DialogTitle>
                        <DialogDescription>
                            {itinerary ? "Update the timeline and activities for this suggested itinerary." : "Create a new curated itinerary for users to explore."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
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
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (Days)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={formData.duration_days}
                                    onChange={(e) => setFormData({ ...formData, duration_days: parseInt(e.target.value) })}
                                    required
                                />
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
                            <Label htmlFor="description">Description (Overview)</Label>
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
                            {loading ? "Saving..." : "Save Itinerary"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ItineraryDialog;
