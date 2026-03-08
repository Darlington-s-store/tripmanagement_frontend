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
import { TravelInfo, adminService } from "@/services/admin";
import { toast } from "sonner";

interface TravelInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    info?: TravelInfo | null;
    onSuccess: () => void;
}

const TravelInfoDialog = ({ open, onOpenChange, info, onSuccess }: TravelInfoDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TravelInfo>>({
        title: "",
        category: "visa",
        content: "",
        last_updated: new Date().toISOString()
    });

    useEffect(() => {
        if (info) {
            setFormData({
                title: info.title,
                category: info.category,
                content: info.content,
                last_updated: info.last_updated
            });
        } else {
            setFormData({
                title: "",
                category: "visa",
                content: "",
                last_updated: new Date().toISOString()
            });
        }
    }, [info, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (info) {
                await adminService.updateTravelInfo(info.id, formData);
                toast.success("Travel info updated successfully");
            } else {
                await adminService.createTravelInfo(formData);
                toast.success("Travel info created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(info ? "Failed to update travel info" : "Failed to create travel info");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{info ? "Edit Travel Information" : "Add Travel Information"}</DialogTitle>
                        <DialogDescription>
                            {info ? "Make changes to this travel advisory information." : "Publish a new travel information guide for travellers."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Visa Requirements for Ghana"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Select
                                value={formData.category}
                                onValueChange={(value) => setFormData({ ...formData, category: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="visa">Visa & Entry</SelectItem>
                                    <SelectItem value="health">Health & Safety</SelectItem>
                                    <SelectItem value="currency">Currency & Money</SelectItem>
                                    <SelectItem value="transport">Transportation</SelectItem>
                                    <SelectItem value="culture">Culture & Etiquette</SelectItem>
                                    <SelectItem value="weather">Weather & Best Time</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea
                                id="content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="min-h-[200px]"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Information"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default TravelInfoDialog;
