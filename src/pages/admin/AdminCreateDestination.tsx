import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { adminService, Category } from "@/services/admin";
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

const AdminCreateDestination = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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
    const fetchCategories = async () => {
      try {
        const data = await adminService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Please enter a destination name.");
    
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

      await adminService.createDestination(payload);
      toast.success("Destination created successfully.");
      navigate("/admin/destinations");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add destination.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} id="destination-form">
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
                <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">Create Destination</h1>
                <p className="text-sm text-slate-500">Add a new location to the platform registry.</p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/destinations")}
                  className="h-11 rounded-xl px-6 font-medium border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all text-sm"
                >
                  Cancel
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
                  {loading ? "Saving..." : "Save Destination"}
                </Button>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {/* Main Column - "Straight" Layout */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* General Information Section */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">General Information</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Key identification details</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Destination Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Cape Coast Castle"
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
                        placeholder="e.g. Ashanti Region"
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
                      <Label htmlFor="status" className="text-sm font-semibold text-gray-700">Initial Status</Label>
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
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Storytelling & Details</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Describe the location</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Short Summary</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief overview for listing cards..."
                      required
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[100px] resize-none focus:border-primary transition-all p-4"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="full_description" className="text-sm font-semibold text-gray-700">Detailed Description</Label>
                    <Textarea
                      id="full_description"
                      value={formData.full_description}
                      onChange={(e) => setFormData({ ...formData, full_description: e.target.value })}
                      placeholder="Full history, cultural significance, and depth..."
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
                        <h2 className="text-sm font-bold text-gray-900">Pricing</h2>
                      </div>
                      <div className="flex gap-1 p-0.5 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setCurrency("GHS")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currency === "GHS" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                        >
                          GHS
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrency("USD")}
                          className={`px-3 py-1 text-[9px] font-bold rounded-md transition-all ${currency === "USD" ? "bg-white text-gray-900 shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
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
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opening_hours" className="text-xs font-semibold text-gray-600">Opening Hours</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="opening_hours"
                          value={formData.opening_hours}
                          onChange={(e) => setFormData({ ...formData, opening_hours: e.target.value })}
                          placeholder="e.g. 8:00 AM - 5:00 PM"
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                      <MapIcon className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-gray-900">Location Details</h2>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Google Maps Link</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          value={formData.location_map}
                          onChange={(e) => setFormData({ ...formData, location_map: e.target.value })}
                          placeholder="Paste URL here..."
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white text-xs truncate"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-gray-600">Travel Tips</Label>
                      <Textarea
                        value={formData.travel_tips}
                        onChange={(e) => setFormData({ ...formData, travel_tips: e.target.value })}
                        placeholder="Helpful advice for visitors..."
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
                      <h2 className="text-sm font-bold text-gray-900">Media Assets</h2>
                    </div>
                    <div className="flex p-0.5 bg-gray-100 rounded-lg border border-gray-200 shadow-inner">
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
                        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Main Image URL</Label>
                        <div className="relative">
                          <Plus className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                          <Input
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                            placeholder="https://..."
                            className="h-10 pl-9 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white text-xs"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Label className="relative flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-200 rounded-2xl hover:border-primary/50 hover:bg-primary/[0.02] transition-all cursor-pointer group bg-gray-50/30">
                          <Camera className="h-7 w-7 text-gray-300 group-hover:text-primary transition-colors" />
                          <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase tracking-tight group-hover:text-primary">Upload Asset</span>
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
                    <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Gallery Links (CSV)</Label>
                    <Textarea
                      value={formData.gallery}
                      onChange={(e) => setFormData({ ...formData, gallery: e.target.value })}
                      placeholder="image1.jpg, image2.jpg..."
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[100px] text-[10px] resize-none focus:border-primary p-3"
                    />
                    <p className="text-[9px] text-gray-400 italic">Separate URLs with commas to populate the destination gallery.</p>
                  </div>
                </div>

                {/* Status Summary Card */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-4 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Layout className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-800">Publishing Summary</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600/70 font-medium">Visibility</span>
                      <span className="capitalize font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md border border-blue-200">{formData.status}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-blue-600/70 font-medium">Images</span>
                      <span className="font-bold text-blue-700">{formData.image_url ? "1 Main" : "None"} {formData.gallery ? `+ ${formData.gallery.split(',').length} Gallery` : ""}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2 border-t border-blue-100/50">
                      <span className="text-blue-600/70 font-medium">Ready to publish?</span>
                      <span className="flex items-center gap-1.5 font-bold text-green-600">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> 
                        Initial Draft
                      </span>
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

export default AdminCreateDestination;
