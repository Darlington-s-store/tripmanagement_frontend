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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TravelInfo, adminService } from "@/services/admin";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { 
    Loader2, 
    Info, 
    X, 
    Save, 
    Layout, 
    FileText, 
    Clock, 
    Calendar,
    Globe,
    Shield,
    Wallet,
    Plane,
    Cloud
} from "lucide-react";

interface TravelInfoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    info?: TravelInfo | null;
    onSuccess: () => void;
    inline?: boolean;
}

const TravelInfoDialog = ({ open, onOpenChange, info, onSuccess, inline = false }: TravelInfoDialogProps) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<Partial<TravelInfo>>({
        title: "",
        category: "visa",
        content: "",
        last_updated: new Date().toISOString()
    });

    useEffect(() => {
        if (open) {
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
        }
    }, [info, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (info) {
                await adminService.updateTravelInfo(info.id, formData);
                toast.success("Intelligence profile updated");
            } else {
                await adminService.createTravelInfo(formData);
                toast.success("New travel intelligence published");
            }
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Failed to save travel info:", error);
            toast.error("Security failure: Unable to persist travel advisory");
        } finally {
            setLoading(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "visa": return <Shield className="w-5 h-5" />;
            case "health": return <Shield className="w-5 h-5 text-rose-500" />;
            case "currency": return <Wallet className="w-5 h-5 text-emerald-500" />;
            case "transport": return <Plane className="w-5 h-5 text-sky-500" />;
            case "culture": return <Globe className="w-5 h-5 text-amber-500" />;
            case "weather": return <Cloud className="w-5 h-5 text-blue-400" />;
            default: return <Info className="w-5 h-5 text-indigo-500" />;
        }
    };

    const dialogContent = (
        <div className={inline ? "bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col w-full overflow-hidden" : "w-full max-w-4xl p-0 overflow-hidden bg-white/95 backdrop-blur-xl border-slate-200/60 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh]"}>
            {/* Premium Header */}
            <div className={`px-8 pt-8 pb-4 shrink-0 border-b border-slate-100 bg-gradient-to-b from-slate-50/50 to-transparent ${!inline ? "sticky top-0" : ""} z-20 flex flex-row justify-between items-start`}>
                <div>
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                        <div className="p-2.5 bg-sky-600 text-white flex items-center justify-center rounded-2xl shadow-lg shadow-sky-500/20">
                            <Info className="w-5 h-5" />
                        </div>
                        {info ? "Advisory Intelligence" : "Publish Advisory"}
                    </h2>
                    <p className="text-slate-500 mt-2 text-base max-w-md">
                        {info 
                            ? "Modify the critical travel advisory parameters and logistical guidelines." 
                            : "Broadcast new travel intelligence to the global operative network."}
                    </p>
                </div>
                {!inline && (
                    <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)} className="rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar">
                <form id="travel-info-form" onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Metadata & Classification */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-sky-500" />
                            Security Classification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100">
                                    <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5" />
                                        Intelligence Title
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Input
                                        id="title"
                                        value={formData.title || ""}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="e.g. Protocol: Visa Requirements"
                                        required
                                        className="border-0 focus-visible:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium"
                                    />
                                </CardContent>
                            </Card>

                            <Card className="border-slate-100 shadow-sm rounded-[1.5rem] overflow-hidden group focus-within:ring-2 focus-within:ring-sky-500 transition-all">
                                <div className="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                        {getCategoryIcon(formData.category || "visa")}
                                        Advisory Domain
                                    </Label>
                                </div>
                                <CardContent className="p-0">
                                    <Select
                                        value={formData.category}
                                        onValueChange={(value) => setFormData({ ...formData, category: value as any /* eslint-disable-line @typescript-eslint/no-explicit-any */ })}
                                    >
                                        <SelectTrigger className="border-0 focus:ring-0 rounded-none px-4 py-3 h-12 text-sm md:text-base font-medium bg-transparent">
                                            <SelectValue placeholder="Select classification" />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                            <SelectItem value="visa" className="rounded-xl">Visa & Entry Protocols</SelectItem>
                                            <SelectItem value="health" className="rounded-xl font-bold text-rose-600">Health & Biosecurity</SelectItem>
                                            <SelectItem value="currency" className="rounded-xl">Financial Intelligence</SelectItem>
                                            <SelectItem value="transport" className="rounded-xl">Logistical Systems</SelectItem>
                                            <SelectItem value="culture" className="rounded-xl">Cultural Etiquette</SelectItem>
                                            <SelectItem value="weather" className="rounded-xl">Climatic Intelligence</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Operational Intelligence */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Globe className="w-5 h-5 text-indigo-500" />
                            Advisory Intelligence Data
                        </h3>
                        <Card className="border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden">
                            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                                <Label htmlFor="content" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    Formal Documentation Content
                                </Label>
                                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                                    <Clock className="w-3 h-3" />
                                    Last Updated: {formData.last_updated ? new Date(formData.last_updated).toLocaleDateString() : "Never"}
                                </div>
                            </div>
                            <CardContent className="p-0">
                                <Textarea
                                    id="content"
                                    value={formData.content || ""}
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                    placeholder="Deploy detailed operational guidelines, strategic tips, and critical advisory data for personnel..."
                                    required
                                    className="border-0 focus-visible:ring-0 rounded-none px-6 py-5 min-h-[400px] resize-none text-slate-700 font-medium leading-[1.8] text-base"
                                />
                            </CardContent>
                        </Card>
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
                    Archive
                </Button>
                <Button 
                    type="submit" 
                    form="travel-info-form"
                    disabled={loading}
                    className="rounded-xl h-11 px-8 bg-sky-600 hover:bg-sky-700 text-white font-black shadow-lg shadow-sky-500/25 transition-all text-sm uppercase tracking-wide"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                             <Loader2 className="w-4 h-4 animate-spin" />
                             <span>Synchronizing...</span>
                        </div>
                    ) : (
                        <>
                            <Save className="w-4 h-4 mr-2" />
                            {info ? "Synchronize Intelligence" : "Publish Advisory"}
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
                    <DialogTitle>{info ? "Edit Advisory" : "New Advisory"}</DialogTitle>
                    <DialogDescription>
                        Travel intelligence management terminal.
                    </DialogDescription>
                </DialogHeader>
                {dialogContent}
            </DialogContent>
        </Dialog>
    );
};

export default TravelInfoDialog;
