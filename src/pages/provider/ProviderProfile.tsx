import { User, Mail, Phone, MapPin, Camera, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ProviderProfile = () => (
  <DashboardLayout role="provider">
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold">Business Profile</h2>

      <div className="rounded-xl border border-border bg-card p-6">
        <div className="mb-6 flex items-center gap-4">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent font-display text-3xl font-bold text-primary">
              <Building className="h-8 w-8" />
            </div>
            <button className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <h3 className="font-display text-xl font-semibold">Akua Sarfo Travel Services</h3>
            <p className="text-sm text-muted-foreground">Service Provider • Verified</p>
          </div>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Business Name</label>
            <Input defaultValue="Akua Sarfo Travel Services" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Contact Name</label>
              <Input defaultValue="Akua Sarfo" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Business Type</label>
              <Select defaultValue="hotel">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotel">Hotel / Accommodation</SelectItem>
                  <SelectItem value="tour">Tour Guide</SelectItem>
                  <SelectItem value="transport">Transport Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input type="email" defaultValue="akua@example.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Phone</label>
            <Input type="tel" defaultValue="+233 20 456 7890" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Location</label>
            <Input defaultValue="Accra, Ghana" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Business Description</label>
            <Textarea defaultValue="Premium travel and accommodation services across Ghana." rows={3} />
          </div>
          <Button>Save Changes</Button>
        </form>
      </div>
    </div>
  </DashboardLayout>
);

export default ProviderProfile;
