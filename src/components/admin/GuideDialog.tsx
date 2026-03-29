import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { guidesService, Guide } from "@/services/guides";
import { toast } from "sonner";
import { 
    Loader2, 
    User, 
    Clock, 
    Globe, 
    Wallet, 
    X, 
    Save, 
    Camera, 
    ShieldCheck, 
    Sparkles, 
    Award,
    UploadCloud,
    Link as LinkIcon,
    Image as ImageIcon
} from "lucide-react";
import { CONVERSION_RATE, formatGHS } from "@/utils/currency";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

interface GuideDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    guide: Guide | null;
    onSuccess: () => void;
    inline?: boolean;
}

const GuideDialog = ({ open, onOpenChange, guide, onSuccess, inline = false }: GuideDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<Guide>>({
        name: "",
        experience_years: 0,
        languages: "",
        hourly_rate: 0,
        bio: "",
        image_url: "",
    });
    const [currency, setCurrency] = useState<"GHS" | "USD">("GHS");
    const [uploadMode, setUploadMode] = useState<"link" | "upload">("link");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        if (open) {
            if (guide) {
                setFormData(guide);
            } else {
                setFormData({
                    name: "",
                    experience_years: 0,
                    languages: "",
                    hourly_rate: 0,
                    bio: "",
                    image_url: "",
                });
            }
        }
    }, [guide, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            let finalImageUrl = formData.image_url;

            if (uploadMode === "upload" && imageFile) {
                const storageRef = ref(storage, `guides/${Date.now()}_${imageFile.name}`);
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

            let finalPrice = Number(formData.hourly_rate) || 0;
            if (currency === "USD") {
                finalPrice = finalPrice * CONVERSION_RATE;
            }

            const payload = {
                ...formData,
                hourly_rate: finalPrice,
                image_url: finalImageUrl,
            };

            if (guide) {
                await guidesService.updateGuide(guide.id, payload);
                toast.success("Professional profile synchronized");
            } else {
                await guidesService.createGuide(
                    payload.name!,
                    payload.hourly_rate!,
                    payload.experience_years,
                    payload.languages,
                    payload.bio,
                    payload.image_url
                );
                toast.success("New professional guide registered");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save guide:", error);
            toast.error("Protocol failure: Unable to persist guide profile");
        } finally {
            setLoading(false);
        }
    };

    const dialogContent = (
        <div className={inline ? "bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full overflow-hidden" : "w-full max-w-4xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"}>
            {/* Premium Header */}
            <div className={`px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent ${!inline ? "sticky top-0" : ""} z-20 flex flex-row justify-between items-start`}>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-indigo-500/20">
                            <User className="w-5 h-5" />
                        </div>
                        {guide ? "Refine Personnel" : "Onboard Expert"}
                    </h2>
                    <p className="text-slate-500 mt-2 text-base max-w-md">
                        {guide 
                            ? "Modify the professional credentials and operational reach of this tour specialist." 
                            : "Initialize a new professional profile within the expert logistical network."}
                    </p>
                </div>
                {!inline && (
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <form id="guide-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Professional Identity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-indigo-500" />
                            Core Professional Identity
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        Legal Full Name
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Input
                                        id="name"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Samuel Adjetey"
                                        required
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                    />
                                </CardContent>
                            </Card>

                            <div className="grid grid-cols-2 gap-5">
                                <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                        <Label htmlFor="exp" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Award className="w-3.5 h-3.5" />
                                            Tenure (Yrs)
                                        </Label>
                                    </div>
                                    <CardContent className="p-0">
                                        <Input
                                            id="exp"
                                            type="number"
                                            value={formData.experience_years || 0}
                                            onChange={(e) => setFormData({ ...formData, experience_years: parseInt(e.target.value) || 0 })}
                                            required
                                            className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                        />
                                    </CardContent>
                                </Card>

                                <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-indigo-500 transition-all">
                                    <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                        <Label htmlFor="languages" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                            <Globe className="w-3.5 h-3.5" />
                                            Linguistic Range
                                        </Label>
                                    </div>
                                    <CardContent className="p-0">
                                        <Input
                                            id="languages"
                                            value={formData.languages || ""}
                                            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
                                            placeholder="English, Twi..."
                                            required
                                            className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>

                    {/* Operational Dynamics */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Wallet className="w-5 h-5 text-emerald-500" />
                            Commercial Parameters
                        </h3>
                        <div className="max-w-md">
                            <Card className="border-0 shadow-md rounded-[1.5rem] overflow-hidden relative bg-gradient-to-br from-emerald-500 to-teal-700 text-white">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <Wallet className="w-24 h-24" />
                                </div>
                                <div className="px-5 py-4 border-b border-emerald-400/30 relative z-10">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="rate" className="text-xs font-bold uppercase tracking-wider text-emerald-100 flex items-center gap-1.5">
                                            Professional Hourly Rate
                                        </Label>
                                        <div className="flex gap-2">
                                            <button
                                              type="button"
                                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-black transition-all ${currency === 'GHS' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700'}`}
                                              onClick={() => setCurrency('GHS')}
                                            >
                                                GHS
                                            </button>
                                            <button
                                              type="button"
                                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-black transition-all ${currency === 'USD' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-emerald-700/50 text-emerald-100 hover:bg-emerald-700'}`}
                                              onClick={() => setCurrency('USD')}
                                            >
                                                USD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-0 relative z-10">
                                    <div className="flex flex-col px-5 py-4 bg-emerald-600/20 backdrop-blur-sm">
                                        <div className="flex items-center">
                                            <span className="text-2xl font-bold text-emerald-100 mr-2">
                                                {currency === "USD" ? "$" : "GH₵"}
                                            </span>
                                            <Input
                                                id="rate"
                                                type="number"
                                                value={formData.hourly_rate || ""}
                                                onChange={(e) => setFormData({ ...formData, hourly_rate: e.target.value ? parseFloat(e.target.value) : 0 })}
                                                required
                                                className="border-0 bg-transparent text-3xl font-bold text-white placeholder:text-emerald-200/50 p-0 h-auto focus-visible:ring-0 rounded-none w-full"
                                            />
                                        </div>
                                        {currency === "USD" && formData.hourly_rate && (
                                            <p className="text-[10px] font-bold text-emerald-100/80 mt-1 uppercase tracking-wider">
                                                ≈ {formatGHS(Number(formData.hourly_rate) * CONVERSION_RATE)}
                                            </p>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Narrative & Visuals */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" />
                            Expert Profile & Imagery
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <Card className="md:col-span-2 border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                                        Professional Biography
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Textarea
                                        id="bio"
                                        value={formData.bio || ""}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        placeholder="Outline certifications, areas of expertise, and stylistic approach..."
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 min-h-[160px] resize-none text-slate-700 font-medium leading-relaxed"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden flex flex-col">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <Camera className="w-3.5 h-3.5" />
                                        Profile Visual
                                    </Label>
                                    <div className="flex bg-slate-100 p-0.5 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode("link")}
                                            className={`p-1 rounded-md transition-all ${uploadMode === "link" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            <LinkIcon className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setUploadMode("upload")}
                                            className={`p-1 rounded-md transition-all ${uploadMode === "upload" ? "bg-white shadow-sm text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
                                        >
                                            <UploadCloud className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col gap-4">
                                    {uploadMode === "link" ? (
                                        <Input
                                            id="image"
                                            value={formData.image_url || ""}
                                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                            placeholder="Direct Image URL..."
                                            className="h-10 border-slate-200 focus-visible:ring-indigo-500 rounded-xl text-sm"
                                        />
                                    ) : (
                                        <div className="space-y-2">
                                            <Label 
                                                htmlFor="guide-upload" 
                                                className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 rounded-xl hover:bg-slate-50 hover:border-indigo-300 transition-all cursor-pointer group"
                                            >
                                                <div className="flex flex-col items-center justify-center pt-2 pb-2">
                                                    <UploadCloud className="w-6 h-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                                    <p className="text-[10px] text-slate-500 mt-1 font-medium">
                                                        {imageFile ? imageFile.name : "Select Asset"}
                                                    </p>
                                                </div>
                                                <input 
                                                    id="guide-upload" 
                                                    type="file" 
                                                    className="hidden" 
                                                    accept="image/*"
                                                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                                                />
                                            </Label>
                                            {uploadProgress > 0 && uploadProgress < 100 && (
                                                <div className="w-full bg-slate-100 rounded-full h-1">
                                                    <div 
                                                        className="bg-indigo-600 h-1 rounded-full transition-all duration-300" 
                                                        style={{ width: `${uploadProgress}%` }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex-1 bg-slate-50 rounded-xl overflow-hidden border border-slate-200 relative group min-h-[140px]">
                                        {formData.image_url || imageFile ? (
                                            <img 
                                                src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url} 
                                                alt="Guide Preview" 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-300">
                                                <ImageIcon className="w-10 h-10 opacity-20" />
                                                <span className="text-[10px] font-bold uppercase mt-2 opacity-40 italic tracking-widest text-center px-4">Establishing Visual Identity</span>
                                            </div>
                                        )}
                                    </div>
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
                    form="guide-form"
                    disabled={loading}
                    className="rounded-xl h-11 px-8 bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg shadow-indigo-500/25 transition-all text-sm uppercase tracking-wide"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin" />
                             <span>Synchronizing...</span>
                        </div>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {guide ? "Commit Updates" : "Initialize expert"}
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
            <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none focus-visible:ring-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>{guide ? "Edit Expert Profile" : "Onboard New Expert"}</DialogTitle>
                    <DialogDescription>
                        Professional personnel management terminal.
                    </DialogDescription>
                </DialogHeader>
                {dialogContent}
            </DialogContent>
        </Dialog>
    );
};

export default GuideDialog;
