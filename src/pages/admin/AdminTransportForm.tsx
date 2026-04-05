import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Bus, 
  MapPin, 
  Clock, 
  Users, 
  Image as ImageIcon, 
  CheckCircle2, 
  Phone, 
  Mail, 
  Info, 
  Truck, 
  ShieldCheck,
  Layout,
  Save as SaveIcon,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Transport } from "@/services/admin";
import { toast } from "sonner";

const AMENITIES_OPTIONS = [
  { id: "wifi", label: "Free Wi-Fi" },
  { id: "ac", label: "Air Conditioning" },
  { id: "charging", label: "Charging Ports" },
  { id: "meal", label: "Refreshments/Meal" },
  { id: "legroom", label: "Extra Legroom" },
  { id: "entertainment", label: "Onboard Entertainment" },
  { id: "water", label: "Bottled Water" },
  { id: "luggage", label: "Standard Luggage Incl." },
];

const AdminTransportForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [formData, setFormData] = useState<Partial<Transport>>({
    name: "",
    type: "Bus",
    operator: "",
    from_location: "",
    to_location: "",
    departure_time: "",
    arrival_time: "",
    price: "",
    capacity: 0,
    image_url: "",
    status: "active",
    description: "",
    amenities: [],
    vehicle_model: "",
    plate_number: "",
    support_phone: "",
    support_email: "",
    terms_conditions: "",
  });

  const loadTransport = useCallback(async () => {
    try {
      setFetching(true);
      const data = await adminService.getAllTransports();
      const transport = data.find(t => t.id === id);
      if (transport) {
        setFormData({
          ...transport,
          amenities: Array.isArray(transport.amenities) ? transport.amenities : [],
        });
      } else {
        toast.error("Transport service not found");
        navigate("/admin/transports");
      }
    } catch (error) {
      console.error("Failed to load transport:", error);
      toast.error("Failed to load transport details");
    } finally {
      setFetching(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (isEdit) {
      loadTransport();
    }
  }, [isEdit, loadTransport]);

  const toggleAmenity = (amenityId: string) => {
    const currentAmenities = Array.isArray(formData.amenities) ? [...formData.amenities] : [];
    if (currentAmenities.includes(amenityId)) {
      setFormData({ ...formData, amenities: currentAmenities.filter(id => id !== amenityId) });
    } else {
      setFormData({ ...formData, amenities: [...currentAmenities, amenityId] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await adminService.updateTransport(id!, formData);
        toast.success("Transport service updated successfully");
      } else {
        await adminService.createTransport(formData);
        toast.success("New transport service created");
      }
      navigate("/admin/transports");
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save transport service");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout role="admin">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col gap-6">
            
            {/* Sticky Header with Actions - Standard Dashboard Style */}
            <div className="sticky top-0 z-10 flex flex-col gap-4 border-l-4 border-primary bg-white/80 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-6 rounded-r-xl">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 -ml-2 text-gray-500 hover:text-primary transition-colors"
                    onClick={() => navigate("/admin/transports")}
                    type="button"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Transports
                  </Button>
                </div>
                <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">
                  {isEdit ? "Modify Transport Service" : "Add New Transport"}
                </h1>
                <p className="text-sm text-slate-500">
                  {isEdit ? `Updating profile for ${formData.name}` : "Configure a new route and connection for the platform"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate("/admin/transports")}
                  className="h-11 rounded-xl px-6 font-medium border-gray-200 hover:bg-gray-50 transition-all text-sm"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading}
                  className="h-11 bg-primary hover:bg-primary/90 text-white rounded-xl px-8 gap-2 font-semibold shadow-sm transition-all text-sm"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    <SaveIcon className="h-4 w-4" />
                  )}
                  {loading ? "Saving..." : isEdit ? "Update Service" : "Create Service"}
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
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Primary Service Details</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Operator and identity</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Display Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Executive Golden Coach"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="operator" className="text-sm font-semibold text-gray-700">Service Operator</Label>
                      <Input
                        id="operator"
                        value={formData.operator}
                        onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                        placeholder="e.g. Intercity STC"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="type" className="text-sm font-semibold text-gray-700">Transport Category</Label>
                      <Select
                        value={formData.type}
                        onValueChange={(value) => setFormData({ ...formData, type: value as "Bus" | "Flight" | "Car" | "Train" })}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-gray-200 bg-gray-50/30">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200">
                          <SelectItem value="Bus">Bus / Coach</SelectItem>
                          <SelectItem value="Flight">Flight / Air</SelectItem>
                          <SelectItem value="Car">Private Hire / Taxi</SelectItem>
                          <SelectItem value="Train">Railway / Train</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="capacity" className="text-sm font-semibold text-gray-700">Max Capacity</Label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="capacity"
                          type="number"
                          value={formData.capacity || ""}
                          onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                          required
                          className="h-12 pl-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-semibold text-gray-700">Service Overview</Label>
                    <Textarea
                      id="description"
                      value={formData.description || ""}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the vehicle comfort, route specializations, or unique selling points..."
                      className="rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white min-h-[120px] resize-none focus:border-primary transition-all p-4"
                    />
                  </div>
                </div>

                {/* Route Logistics Section */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Route & Navigation</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">Logistics and timing</p>
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="from" className="text-sm font-semibold text-gray-700">Departure Hub</Label>
                      <Input
                        id="from"
                        value={formData.from_location}
                        onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                        placeholder="e.g. Accra Central Mall"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="to" className="text-sm font-semibold text-gray-700">Destination Hub</Label>
                      <Input
                        id="to"
                        value={formData.to_location}
                        onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                        placeholder="e.g. Kumasi Kejetia"
                        required
                        className="h-12 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="dep_time" className="text-sm font-semibold text-gray-700">Departure Time</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="dep_time"
                          value={formData.departure_time}
                          onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                          placeholder="e.g. 06:30 AM"
                          required
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="arr_time" className="text-sm font-semibold text-gray-700">Expected Arrival</Label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="arr_time"
                          value={formData.arrival_time}
                          onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                          placeholder="e.g. 02:00 PM"
                          required
                          className="h-11 pl-11 rounded-xl border-gray-200 bg-gray-50/30 focus:bg-white focus:border-primary transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Amenities & Extras */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 md:p-8 space-y-8 shadow-sm">
                  <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 leading-tight">Service Perks & Amenities</h2>
                      <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">On-board comfort features</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {AMENITIES_OPTIONS.map((amenity) => (
                      <div 
                        key={amenity.id} 
                        className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer ${
                          Array.isArray(formData.amenities) && formData.amenities.includes(amenity.id)
                            ? "bg-primary/5 border-primary/20"
                            : "bg-gray-50/50 border-gray-100 hover:border-gray-200"
                        }`}
                        onClick={() => toggleAmenity(amenity.id)}
                      >
                        <Checkbox 
                          id={amenity.id} 
                          checked={Array.isArray(formData.amenities) && formData.amenities.includes(amenity.id)} 
                          onCheckedChange={() => toggleAmenity(amenity.id)}
                          className="rounded-md border-gray-300"
                        />
                        <Label 
                          htmlFor={amenity.id} 
                          className="text-[11px] font-bold text-gray-600 cursor-pointer select-none"
                        >
                          {amenity.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vehicle & Policy Section */}
                <div className="grid gap-6 md:grid-cols-2">
                   <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                      <Truck className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-gray-900">Vehicle Registry</h2>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="model" className="text-[11px] font-bold text-gray-400 uppercase">Model/Version</Label>
                        <Input
                          id="model"
                          value={formData.vehicle_model}
                          onChange={(e) => setFormData({ ...formData, vehicle_model: e.target.value })}
                          placeholder="e.g. Scania G8"
                          className="h-10 rounded-xl border-gray-200 bg-gray-50/30"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="plate" className="text-[11px] font-bold text-gray-400 uppercase">Registration Plate</Label>
                        <Input
                          id="plate"
                          value={formData.plate_number}
                          onChange={(e) => setFormData({ ...formData, plate_number: e.target.value })}
                          placeholder="e.g. GS 1234 - 24"
                          className="h-10 rounded-xl border-gray-200 bg-gray-50/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 pb-2 border-b border-gray-50">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <h2 className="text-sm font-bold text-gray-900">Policies & Rules</h2>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="terms" className="text-[11px] font-bold text-gray-400 uppercase">Booking Policy</Label>
                      <Textarea
                        id="terms"
                        value={formData.terms_conditions || ""}
                        onChange={(e) => setFormData({ ...formData, terms_conditions: e.target.value })}
                        placeholder="Non-refundable within 24h, etc..."
                        className="rounded-xl border-gray-200 bg-gray-50/30 min-h-[95px] text-xs resize-none p-3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Column */}
              <div className="space-y-6">
                
                {/* Visual Assets Card */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-gray-900">Hero Media</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Public Image URL</Label>
                      <Input
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        placeholder="https://..."
                        className="h-10 rounded-xl border-gray-200 bg-gray-50/30 text-xs"
                      />
                    </div>
                    
                    {formData.image_url && (
                      <div className="group relative aspect-video rounded-xl overflow-hidden border border-gray-100 shadow-md ring-4 ring-white">
                        <img 
                          src={formData.image_url} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069")}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Commercial Constraints */}
                <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-6 shadow-sm">
                   <div className="flex items-center gap-2 pb-2 border-b border-gray-50">
                    <Layout className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-bold text-gray-900">Commercial Logic</h2>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Standard Fare (₵)</Label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">₵</span>
                        <Input
                          type="number"
                          step="0.01"
                          value={formData.price || ""}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="h-12 pl-12 rounded-xl border-gray-200 bg-gray-50/30 font-bold text-lg text-primary"
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                       <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Live Status</Label>
                       <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData({ ...formData, status: value })}
                      >
                        <SelectTrigger className="h-11 rounded-xl border-gray-200 bg-gray-50/30">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-gray-200">
                          <SelectItem value="active">
                            <span className="flex items-center gap-2 text-green-600 font-bold">
                              <div className="h-1.5 w-1.5 rounded-full bg-green-500" /> Fully Operational
                            </span>
                          </SelectItem>
                          <SelectItem value="inactive">
                            <span className="flex items-center gap-2 text-gray-500 font-medium">
                              Offline / Repair
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Support Access Card */}
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-5 space-y-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <h3 className="text-sm font-bold text-blue-800">Operational Support</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-blue-600/60 uppercase">Support Phone</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                        <Input
                          value={formData.support_phone}
                          onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                          className="h-10 pl-9 rounded-xl border-blue-100 bg-white/60 focus:bg-white text-xs"
                          placeholder="+233..."
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-blue-600/60 uppercase">Support Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-400" />
                        <Input
                          value={formData.support_email}
                          onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                          className="h-10 pl-9 rounded-xl border-blue-100 bg-white/60 focus:bg-white text-xs"
                          placeholder="ops@operator.com"
                        />
                      </div>
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

export default AdminTransportForm;
