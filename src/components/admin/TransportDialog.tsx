import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { adminService, Transport } from "@/services/admin";
import { toast } from "sonner";
import { Loader2, Bus } from "lucide-react";

interface TransportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transport?: Transport;
  onSuccess: () => void;
}

export const TransportDialog = ({ open, onOpenChange, transport, onSuccess }: TransportDialogProps) => {
  const [loading, setLoading] = useState(false);
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
  });

  useEffect(() => {
    if (transport) {
      setFormData(transport);
    } else {
      setFormData({
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
      });
    }
  }, [transport, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (transport) {
        await adminService.updateTransport(transport.id, formData);
        toast.success("Transport service updated successfully");
      } else {
        await adminService.createTransport(formData);
        toast.success("New transport service created");
      }
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Submission failed:", error);
      toast.error("Failed to save transport service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            {transport ? "Edit Transport Service" : "Add New Transport"}
          </DialogTitle>
          <DialogDescription>
            Enter the details for this transport connection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1 uppercase tracking-wider text-muted-foreground">Service Information</h3>
              
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input 
                  placeholder="e.g. VIP Executive Coach" 
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select 
                    value={formData.type?.toLowerCase()} 
                    onValueChange={(val) => setFormData({ ...formData, type: val as "Bus" | "Flight" | "Car" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bus">Bus</SelectItem>
                      <SelectItem value="flight">Flight</SelectItem>
                      <SelectItem value="car">Car</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Operator</Label>
                  <Input 
                    placeholder="e.g. STC" 
                    value={formData.operator} 
                    onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₵)</Label>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    value={formData.price} 
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capacity</Label>
                  <Input 
                    type="number" 
                    placeholder="Total seats" 
                    value={formData.capacity} 
                    onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Image URL</Label>
                <Input 
                  placeholder="https://..." 
                  value={formData.image_url} 
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                />
              </div>
            </div>

            {/* Route & Schedule */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b pb-1 uppercase tracking-wider text-muted-foreground">Route & Schedule</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input 
                    placeholder="Source location" 
                    value={formData.from_location} 
                    onChange={(e) => setFormData({ ...formData, from_location: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input 
                    placeholder="Destination" 
                    value={formData.to_location} 
                    onChange={(e) => setFormData({ ...formData, to_location: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Departure Time</Label>
                  <Input 
                    placeholder="e.g. 08:00 AM" 
                    value={formData.departure_time} 
                    onChange={(e) => setFormData({ ...formData, departure_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Arrival Time</Label>
                  <Input 
                    placeholder="e.g. 01:00 PM" 
                    value={formData.arrival_time} 
                    onChange={(e) => setFormData({ ...formData, arrival_time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(val) => setFormData({ ...formData, status: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {transport ? "Update Transport" : "Create Transport"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
