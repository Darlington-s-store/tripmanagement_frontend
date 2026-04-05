import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Destination, Category, adminService } from "@/services/admin";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, UploadCloud, Link as LinkIcon, Image as ImageIcon, MapPin, Info, Sparkles, Clock, Wallet, Map as MapIcon, X, Save, Building, Tags, Lightbulb } from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CONVERSION_RATE } from "@/utils/currency";

interface DestinationDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    destination?: Destination | null;
    categories: Category[];
    onSuccess: () => void;
    inline?: boolean;
}

const DestinationDialog = ({ open, onOpenChange, destination, categories, onSuccess, inline }: DestinationDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<any /* eslint-disable-line @typescript-eslint/no-explicit-any */>({
        name: "",
        region: "",
        category: "historical",
        description: "",
        full_description: "",
        image_url: "",
        gallery: "",
        entrance_fee: "",
        opening_hours: "",
        location_map: "",
        travel_tips: "",
        status: "published"
    });
    
    const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
    const [feeAmount, setFeeAmount] = useState<number>(0);
    const [uploadMode, setUploadMode] = useState<"link" | "upload">("link");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (open) {
            if (destination) {
                // Extract numeric value from entrance_fee safely
                const feeString = String(destination.entrance_fee || "");
                const numericFee = parseFloat(feeString.replace(/[^0-9.]/g, '')) || 0;
                setFeeAmount(numericFee);
                setCurrency("GHS");

                setFormData({
                    name: destination.name,
                    region: destination.region,
                    category: destination.category,
                    description: destination.description,
                    full_description: destination.full_description || "",
                    image_url: destination.image_url,
                    gallery: Array.isArray(destination.gallery) ? destination.gallery.join(", ") : "",
                    entrance_fee: destination.entrance_fee,
                    opening_hours: destination.opening_hours,
                    location_map: destination.location_map || "",
                    travel_tips: destination.travel_tips || "",
                    status: destination.status
                });
            } else {
                setFeeAmount(0);
                setCurrency("GHS");
                setFormData({
                    name: "",
                    region: "",
                    category: "historical",
                    description: "",
                    full_description: "",
                    image_url: "",
                    gallery: "",
                    entrance_fee: "",
                    opening_hours: "",
                    location_map: "",
                    travel_tips: "",
                    status: "published"
                });
            }
        }
    }, [destination, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalImageUrl = formData.image_url;

            if (uploadMode === "upload" && imageFile) {
                const storageRef = ref(storage, `destinations/${Date.now()}_${imageFile.name}`);
                const uploadTask = uploadBytesResumable(storageRef, imageFile);
                
                finalImageUrl = await new Promise((resolve, reject) => {
                    uploadTask.on(
                        "state_changed",
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            setUploadProgress(progress);
                        },
                        (error) => {
                            console.error("Upload failed", error);
                            reject(new Error("Image upload failed"));
                        },
                        async () => {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                            resolve(downloadURL);
                        }
                    );
                });
            }

            // Convert and format entrance fee
            let calculatedFee = feeAmount;
            if (currency === "USD") {
                calculatedFee = feeAmount * CONVERSION_RATE;
            }
            const finalEntranceFee = `GHS ${calculatedFee.toFixed(2)}`;

            const payload = {
                ...formData,
                image_url: finalImageUrl,
                entrance_fee: finalEntranceFee,
                gallery: typeof formData.gallery === 'string' 
                    ? formData.gallery.split(',').map((s: string) => s.trim()).filter(Boolean)
                    : formData.gallery
            };

            if (destination) {
                await adminService.updateDestination(destination.id, payload);
                toast.success("Destination identity updated");
            } else {
                await adminService.createDestination(payload);
                toast.success("New destination added to collection");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            toast.error(error instanceof Error ? error.message : "Catalog update failed");
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
        <div className={`bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full overflow-hidden ${!inline && "max-h-[90vh]"}`}>
            {/* Premium Header */}
            <div className={`px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent ${!inline ? "sticky top-0" : ""} z-20 flex flex-row justify-between items-start`}>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-orange-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-orange-500/20">
                            <MapPin className="w-5 h-5" />
                        </div>
                        {destination ? "Refine Destination" : "New Location"}
                    </h2>
                    <p className="text-slate-500 mt-2 text-base max-w-md">
                        {destination 
                            ? "Update the geographical and cultural details for this destination point." 
                            : "Map a new region or city with unique heritage, culture, and attractions."}
                    </p>
                </div>
                {!inline && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <form id="destination-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Section 1: Geographic Identity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Info className="w-5 h-5 text-orange-500" />
                            Geographic Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Building className="w-3.5 h-3.5" />
                                        Location Name
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Input
                                        id="name"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Cape Coast"
                                        required
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="region" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <MapIcon className="w-3.5 h-3.5" />
                                        City / Region
                                    </Label>
                                </div>
                                <CardContent className="p-0 border-0">
                                    <Input
                                        id="region"
                                        value={formData.region || ""}
                                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                        placeholder="e.g. Central Region"
                                        required
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Tags className="w-3.5 h-3.5" />
                                        Category Archetype
                                    </Label>
                                </div>
                                <CardContent className="p-0 border-0">
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                                    >
                                        <SelectTrigger className="border-0 focus:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium bg-transparent">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="historical">Historical Sites</SelectItem>
                                            <SelectItem value="nature">National Parks</SelectItem>
                                            <SelectItem value="waterfall">Waterfalls</SelectItem>
                                            <SelectItem value="lake">Lakes</SelectItem>
                                            <SelectItem value="beach">Beaches</SelectItem>
                                            <SelectItem value="mountain">Mountains</SelectItem>
                                            <SelectItem value="unique">Unique Attractions</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-orange-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        Platform Visibility
                                    </Label>
                                </div>
                                <CardContent className="p-0 border-0">
                                    <Select
                                        value={formData.status}
                                        onValueChange={(value) => setFormData({ ...formData, status: value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ })}
                                    >
                                        <SelectTrigger className="border-0 focus:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium bg-transparent">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="published">Published (Active)</SelectItem>
                                            <SelectItem value="draft">Draft (Hidden)</SelectItem>
                                            <SelectItem value="archived">Archived</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section 2: Narrative Deep Dive */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Narrative & Storytelling
                        </h3>
                        <div className="space-y-5">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Hook Description (Short)
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Textarea
                                        id="description"
                                        value={formData.description || ""}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="A catchy 2-3 sentence overview..."
                                        required
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 min-h-[80px] text-slate-700 font-medium"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="full_description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Detailed Heritage & Culture
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Textarea
                                        id="full_description"
                                        value={formData.full_description || ""}
                                        onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                                        placeholder="Comprehensive history, cultural significance, and travel narrative..."
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 min-h-[160px] text-slate-700 font-medium"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section 3: Commercials & Operations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-emerald-500" />
                                Commercials & Access
                            </h3>
                            
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <Label htmlFor="entrance_fee" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Baseline Entry Fee
                                    </Label>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setCurrency("GHS")}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${currency === "GHS" ? "bg-orange-600 text-white" : "bg-white text-slate-400 border border-slate-200"}`}
                                        >
                                            GHS
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setCurrency("USD")}
                                            className={`px-2 py-0.5 text-[10px] font-bold rounded ${currency === "USD" ? "bg-orange-600 text-white" : "bg-white text-slate-400 border border-slate-200"}`}
                                        >
                                            USD
                                        </button>
                                    </div>
                                </div>
                                <CardContent className="p-0 flex items-center">
                                    <div className="pl-4 text-slate-400 font-semibold">
                                        {currency === "USD" ? "$" : "GH₵"}
                                    </div>
                                    <Input
                                        id="entrance_fee_amount"
                                        type="number"
                                        value={feeAmount || ""}
                                        onChange={(e) => setFeeAmount(e.target.value ? parseFloat(e.target.value) : 0)}
                                        placeholder="0.00"
                                        className="border-0 focus-visible:ring-0 rounded-none px-2 py-3 h-12 font-medium"
                                    />
                                </CardContent>
                            </Card>
                            {currency === "USD" && feeAmount > 0 && (
                                <p className="text-[11px] font-medium text-emerald-600 ml-4">
                                    ≈ GH₵ {(feeAmount * CONVERSION_RATE).toLocaleString()} (Standard Exchange)
                                </p>
                            )}

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-emerald-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="opening_hours" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Standard Operations
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Input
                                        id="opening_hours"
                                        value={formData.opening_hours || ""}
                                        onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                                        placeholder="e.g. 7 AM - 6 PM Daily"
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 font-medium"
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <MapIcon className="w-5 h-5 text-indigo-500" />
                                Logistics & Advice
                            </h3>
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="location_map" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <MapIcon className="w-3 h-3 text-slate-400" /> Map Pointer URL
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Input
                                        id="location_map"
                                        value={formData.location_map || ""}
                                        onChange={(e) => setFormData({ ...formData, location_map: e.target.value })}
                                        placeholder="Google Maps Embed URL..."
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-2 text-xs font-medium h-10"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="travel_tips" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Lightbulb className="w-3 h-3 text-yellow-500" /> Pro Travel Tips
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Textarea
                                        id="travel_tips"
                                        value={formData.travel_tips || ""}
                                        onChange={(e) => setFormData({ ...formData, travel_tips: e.target.value })}
                                        placeholder="Clothing, best times, safety, etiquette..."
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-2 min-h-[60px] text-xs font-medium"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Section 4: Media Gallery */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <ImageIcon className="w-5 h-5 text-purple-500" />
                            Visual Asset Management
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Master Destination Image
                                    </Label>
                                    <div className="flex p-0.5 bg-slate-100 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode("link")}
                                            className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${uploadMode === "link" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            URL
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode("upload")}
                                            className={`px-3 py-1 text-[9px] font-bold uppercase rounded-md transition-all ${uploadMode === "upload" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                                        >
                                            FILE
                                        </button>
                                    </div>
                                </div>
                                <CardContent className="p-4 space-y-4">
                                    {uploadMode === "link" ? (
                                        <Input
                                            value={formData.image_url || ""}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="https://..."
                                            className="h-10 text-xs font-medium border-slate-200"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        const file = e.target.files[0];
                                                        setImageFile(file);
                                                        setFormData({ ...formData, image_url: URL.createObjectURL(file) });
                                                    }
                                                }}
                                                className="border-slate-200 text-[10px] file:bg-orange-50 file:text-orange-700 file:font-bold file:border-0 file:rounded-lg"
                                            />
                                            {uploadProgress > 0 && uploadProgress < 100 && (
                                                <div className="w-full bg-slate-100 rounded-full h-1 mt-2 overflow-hidden">
                                                    <div className="bg-orange-500 h-full" style={{ width: `${uploadProgress}%` }}></div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {formData.image_url && (
                                        <div className="aspect-video rounded-xl overflow-hidden shadow-inner border border-slate-100 bg-slate-50 flex items-center justify-center">
                                            <img src={formData.image_url} alt="Master" className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="gallery" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Gallery Inventory (CSV)
                                    </Label>
                                </div>
                                <CardContent className="p-4 space-y-4">
                                    <Textarea
                                        id="gallery"
                                        value={formData.gallery || ""}
                                        onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                                        placeholder="Comma-separated image links..."
                                        className="min-h-[100px] text-[10px] font-medium border-slate-200 focus:ring-purple-500 rounded-xl"
                                    />
                                    <p className="text-[10px] text-slate-400 font-medium italic italic">
                                        * Enter multiple image URLs separated by commas for the destination gallery.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>

            <div className={`px-8 py-5 border-t border-slate-100 bg-slate-50 shrink-0 flex items-center justify-end gap-3 ${!inline ? "sticky bottom-0" : ""} rounded-b-[2.5rem] z-20`}>
                <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => onOpenChange(false)} 
                    className="rounded-xl h-11 px-6 border-slate-200 text-slate-600 hover:bg-slate-100 font-bold"
                >
                    <X className="w-4 h-4 mr-2" />
                    Discard
                </Button>
                <Button 
                    type="submit" 
                    form="destination-form" 
                    disabled={loading} 
                    className="rounded-xl h-11 px-8 bg-orange-600 hover:bg-orange-700 text-white font-black shadow-lg shadow-orange-500/25 transition-all min-w-[150px] text-sm uppercase tracking-wide"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Synchronizing...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-white">
                            <Save className="h-4 w-4" />
                            <span>{destination ? "Commit Archive" : "Publish Location"}</span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    );

    if (inline) {
        return formContent;
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl p-0 border-none shadow-none bg-transparent overflow-hidden">
                <DialogHeader className="sr-only">
                    <DialogTitle>{destination ? "Edit Destination" : "Create Destination"}</DialogTitle>
                    <DialogDescription>
                        {destination ? "Modify destination details and photographic evidence." : "Initialize a new geographic destination in the regional atlas."}
                    </DialogDescription>
                </DialogHeader>
                {formContent}
            </DialogContent>
        </Dialog>
    );
};

export default DestinationDialog;
