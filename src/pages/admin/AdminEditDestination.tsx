import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "@/components/layout/DashboardLayout";
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
import { adminService, Category, Destination } from "@/services/admin";
import { toast } from "sonner";
import { 
  Loader2, 
  MapPin, 
  Info, 
  Clock, 
  Wallet, 
  Map as MapIcon, 
  Save, 
  Building, 
  Image as ImageIcon,
  ArrowLeft,
  Camera,
  Eye,
  Layout,
  Plus
} from "lucide-react";
import { storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { CONVERSION_RATE } from "@/utils/currency";

const AdminEditDestination = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [destination, setDestination] = useState<Destination | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
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
    const loadInitialData = async () => {
      if (!id) return;
      try {
        setInitialLoading(true);
        const [destData, catData] = await Promise.all([
          adminService.getDestinationById(id),
          adminService.getCategories()
        ]);
        
        setDestination(destData);
        setCategories(Array.isArray(catData) ? catData : []);

        // Map data to form
        const feeString = String(destData.entrance_fee || "");
        const numericFee = parseFloat(feeString.replace(/[^0-9.]/g, '')) || 0;
        setFeeAmount(numericFee);
        setCurrency("GHS");

        setFormData({
          name: destData.name,
          region: destData.region,
          category: destData.category || "historical",
          description: destData.description,
          full_description: destData.full_description || "",
          image_url: destData.image_url,
          gallery: Array.isArray(destData.gallery) ? destData.gallery.join(", ") : "",
          entrance_fee: destData.entrance_fee,
          opening_hours: destData.opening_hours,
          location_map: destData.location_map || "",
          travel_tips: destData.travel_tips || "",
          status: destData.status
        });
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load destination data.");
        navigate("/admin/destinations");
      } finally {
        setInitialLoading(false);
      }
    };
    loadInitialData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !formData.name.trim()) return;
    
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

      await adminService.updateDestination(id, payload);
      toast.success("Destination updated successfully.");
      navigate("/admin/destinations");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update destination.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Synchronizing destination data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} id="destination-edit-form">
          <div className="flex flex-col gap-6">
            
            {/* Sticky Header with Actions */}
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-l-4 border-primary bg-white/80 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-6 rounded-r-xl">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 -ml-2 text-gray-500 hover:text-primary transition-colors"
                    onClick={() => navigate("/admin/destinations")}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Destinations
                  </Button>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">Edit: {destination?.name}</h1>
                <p className="text-sm text-slate-500">Update destination details and visibility parameters.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/destinations")}
                  className="h-11 rounded-xl px-6 font-medium border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm"
                >
                  Discard Changes
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 bg-primary hover:bg-primary/90 text-white rounded-xl px-8 gap-2 font-semibold shadow-sm shadow-primary/20 transition-all text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {loading ? "Updating..." : "Update Changes"}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* General Information Section */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Identification</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Destination branding & classification</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Destination name"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="region" className="text-sm font-semibold text-gray-700">Region</Label>
                      <Input
                        id="region"
                        value={formData.region}
                        onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                        placeholder="e.g. Greater Accra"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-sm font-semibold text-gray-700">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200">
                          <SelectItem value="historical">Historical Sites</SelectItem>
                          <SelectItem value="nature">National Parks</SelectItem>
                          <SelectItem value="waterfall">Waterfalls</SelectItem>
                          <SelectItem value="lake">Lakes</SelectItem>
                          <SelectItem value="beach">Beaches</SelectItem>
                          <SelectItem value="mountain">Mountains</SelectItem>
                          <SelectItem value="unique">Unique Attractions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Visibility Status</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200">
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Building className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Descriptions & Narrative</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Narrative content for visitors</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Marketing Summary</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Short catchphrase or summary..."
                      required
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[100px] resize-none focus:border-primary transition-all p-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_description" className="text-sm font-semibold text-gray-700">Full Editorial Content</Label>
                    <Textarea
                      id="full_description"
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      placeholder="Comprehensive article about the location..."
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[240px] resize-none focus:border-primary transition-all p-4"
                    />
                  </div>
                </div>

                {/* Logistics Section */}
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                    <div className="flex items-center justify-between gap-3 pb-2 border-b border-gray-50">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-bold text-gray-900">Commercials</h2>
                      </div>
                      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                        <button
                          type="button"
                          onClick={() => setCurrency("GHS")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currency === "GHS" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                        >
                          GHS
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency("USD")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currency === "USD" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                        >
                          USD
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Entrance Fee</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                          {currency === "USD" ? "$" : "GH₵"}
                        </span>
                        <Input
                          type="number"
                          value={feeAmount || ""}
                          onChange={(e) => setFeeAmount(e.target.value ? parseFloat(e.target.value) : 0)}
                          className="h-11 pl-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white font-semibold"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opening_hours" className="text-xs font-semibold text-gray-600">Schedule</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="opening_hours"
                          value={formData.opening_hours}
                          onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                      <MapIcon className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-gray-900">Logistics</h2>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Maps Provider Link</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.location_map}
                          onChange={(e) => setFormData({ ...formData, location_map: e.target.value })}
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white text-xs truncate"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Travel Advice</Label>
                      <Textarea
                        value={formData.travel_tips}
                        onChange={(e) => setFormData({ ...formData, travel_tips: e.target.value })}
                        className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[44px] text-xs resize-none p-3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                
                {/* Visual Assets Card */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-50">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-gray-900">Imagery</h2>
                    </div>
                    <div className="flex p-0.5 bg-gray-100 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => setUploadMode("link")}
                        className={`px-3 py-1 text-[9px] font-bold rounded-md uppercase transition-all ${uploadMode === "link" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                      >
                        Link
                      </button>
                      <button
                        type="button"
                        onClick={() => setUploadMode("upload")}
                        className={`px-3 py-1 text-[9px] font-bold rounded-md uppercase transition-all ${uploadMode === "upload" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400"}`}
                      >
                        File
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {uploadMode === "link" ? (
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Asset Endpoint</Label>
                        <div className="relative">
                          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            className="h-10 pl-9 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer group bg-gray-50/30">
                          <Plus className="h-7 w-7 text-gray-300 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight group-hover:text-primary">Replace asset</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                setImageFile(file);
                                setFormData({ ...formData, image_url: URL.createObjectURL(file) });
                              }
                            }}
                          />
                        </Label>
                        {uploadProgress > 0 && uploadProgress < 100 && (
                          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary h-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {formData.image_url && (
                      <div className="group relative aspect-[16/10] rounded-xl overflow-hidden border border-gray-100 shadow-md ring-4 ring-white">
                        <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Gallery Distribution (CSV)</Label>
                    <Textarea
                      value={formData.gallery}
                      onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[100px] text-[10px] resize-none focus:border-primary p-3"
                    />
                  </div>
                </div>

                {/* Meta Summary Card */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-blue-800">
                    <Layout className="w-4 h-4" />
                    <h3 className="text-sm font-bold underline underline-offset-4 decoration-blue-200">Sync Status</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600/70 font-medium font-sans italic">Registry Index</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100/50 px-1.5 rounded truncate max-w-[100px]">{id?.substring(0,8)}...</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600/70 font-medium font-sans italic">Visibility Mode</span>
                      <span className="capitalize font-bold text-blue-700">{formData.status}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default AdminEditDestination;
;
