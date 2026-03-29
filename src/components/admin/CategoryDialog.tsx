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
import { Tag, X, Info, Layout, Save, Loader2 } from "lucide-react";

interface CategoryDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category?: Category | null;
    onSuccess: () => void;
    inline?: boolean;
}

const CategoryDialog = ({ open, onOpenChange, category, onSuccess, inline = false }: CategoryDialogProps) => {
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

    const dialogContent = (
        <div className={inline ? "bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full overflow-hidden" : "bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full overflow-hidden"}>
            {/* Premium Header */}
            <div className={`px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent ${!inline && "sticky top-0"} z-10 flex flex-row justify-between items-start`}>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/20">
                            <Tag className="w-5 h-5" />
                        </div>
                        {category ? "Refine Category" : "New Taxonomy"}
                    </h2>
                    <p className="text-slate-500 mt-2 text-base max-w-md font-medium">
                        {category ? "Update destination classification details" : "Create a new category for content organization"}
                    </p>
                </div>
                {!inline && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-full hover:bg-slate-100 transition-colors mt-2">
                        <X className="w-5 h-5 text-slate-400" />
                    </Button>
                )}
            </div>

            <form id="category-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-8 custom-scrollbar space-y-8">
                {/* Name & Icon Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <Label htmlFor="category-name" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                            <Layout className="w-4 h-4 text-indigo-500" />
                            Category Name
                        </Label>
                        <Input
                            id="category-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            placeholder="e.g. Luxury Escape"
                            className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base font-semibold"
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="category-icon" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-500" />
                            Icon Identifier
                        </Label>
                        <Input
                            id="category-icon"
                            value={formData.icon}
                            onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                            placeholder="e.g. Compass"
                            className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base font-mono"
                        />
                    </div>
                </div>

                {/* Description Section */}
                <div className="space-y-3">
                    <Label htmlFor="category-description" className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                        <Info className="w-4 h-4 text-indigo-500" />
                        Classification Description
                    </Label>
                    <Textarea
                        id="category-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        required
                        placeholder="Describe the characteristics of this travel category..."
                        className="min-h-[140px] rounded-[1.5rem] border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-base leading-relaxed py-4"
                    />
                </div>

                {/* Preview Card */}
                <div className="p-6 rounded-[2rem] bg-indigo-50/30 border border-indigo-100/50 border-dashed flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600">
                        <Tag className="w-7 h-7" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{formData.name || 'Category Preview'}</h4>
                        <p className="text-xs text-slate-500 font-medium">This will appear in destination filters and search results.</p>
                    </div>
                </div>
            </form>

            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3 rounded-b-[2.5rem] z-10 sticky bottom-0">
                <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => onOpenChange(false)}
                    className="rounded-xl h-11 px-6 text-slate-600 font-bold hover:bg-slate-100 transition-all"
                >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                </Button>
                <Button 
                    type="submit" 
                    form="category-form"
                    disabled={loading}
                    className="rounded-xl h-11 px-10 bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Synchronizing...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {category ? "Commit Updates" : "Initialize Category"}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );

    if (inline) {
        return dialogContent;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:ring-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{category ? "Edit Category" : "Add Category"}</DialogTitle>
                    <DialogDescription>
                        Manage content classifications.
                    </DialogDescription>
                </DialogHeader>
                {dialogContent}
            </DialogContent>
        </Dialog>
    );
};

export default CategoryDialog;
