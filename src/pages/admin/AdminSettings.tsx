import { Shield, Bell, Globe, CreditCard, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import DashboardLayout from "@/components/layout/DashboardLayout";

const AdminSettings = () => (
  <DashboardLayout role="admin">
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold">Platform Settings</h2>
        <p className="text-muted-foreground">Configure platform-wide settings</p>
      </div>

      <div className="space-y-6">
        {/* General */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Globe className="h-5 w-5 text-primary" /> General
          </h3>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">Platform Name</label>
                <Input defaultValue="TripEase Ghana" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Support Email</label>
                <Input defaultValue="support@tripease.gh" />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Platform Fee (%)</label>
              <Input type="number" defaultValue="5" className="max-w-[200px]" />
            </div>
          </div>
        </div>

        {/* Payment */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Configuration
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium">MTN Mobile Money</p>
                <p className="text-sm text-muted-foreground">Accept MTN MoMo payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium">Vodafone Cash</p>
                <p className="text-sm text-muted-foreground">Accept Vodafone Cash payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium">AirtelTigo Money</p>
                <p className="text-sm text-muted-foreground">Accept AirtelTigo payments</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <p className="font-medium">Paystack (Visa/Mastercard)</p>
                <p className="text-sm text-muted-foreground">Accept card payments via Paystack</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-xl border border-border bg-card p-6">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
            <Bell className="h-5 w-5 text-primary" /> Notifications
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm text-muted-foreground">Receive admin alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS notifications</p>
                <p className="text-sm text-muted-foreground">Receive SMS alerts for urgent issues</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New listing alerts</p>
                <p className="text-sm text-muted-foreground">Notify when new listings need approval</p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        <Button size="lg">Save Settings</Button>
      </div>
    </div>
  </DashboardLayout>
);

export default AdminSettings;
