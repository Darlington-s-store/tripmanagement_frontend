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
import { Category, adminService } from "@/services/admin";
import { toast } from "sonner";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess: () => void;
}

const CategoryDialog = ({ open, onOpenChange, category, onSuccess }: CategoryDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Category>>({
        name: "",
        description: "",
        icon: ""
    });

    useEffect(() => {
        if (category) {
            setFormData({
                name: category.name,
                description: category.description,
                icon: category.icon
            });
        } else {
            setFormData({
                name: "",
                description: "",
                icon: ""
            });
        }
    }, [category, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (category) {
                await adminService.updateCategory(category.id, formData);
                toast.success("Category updated successfully");
            } else {
                await adminService.createCategory(formData);
                toast.success("Category created successfully");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(category ? "Failed to update category" : "Failed to create category");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{category ? "Edit Category" : "Add New Category"}</DialogTitle>
                        <DialogDescription>
                            {category ? "Update the details for this category." : "Define a new category for grouping destinations."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
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
                            <Label htmlFor="icon">Icon Name (Lucide icon name)</Label>
                            <Input
                                id="icon"
                                value={formData.icon}
                                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                placeholder="e.g. Landmark, Tree, Waves"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CategoryDialog;
