import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Save, User, Mail, Phone, Shield,
  CheckCircle2, AlertCircle, Clock, Calendar,
  Ban, RefreshCw, Trash2, Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, User as UserType } from "@/services/admin";
import { toast } from "sonner";

const roleConfig = {
  user: {
    label: "Traveller",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    description: "Standard platform user. Can browse, book, and leave reviews.",
    permissions: ["Browse listings", "Make bookings", "Leave reviews", "Manage own profile"],
  },
  provider: {
    label: "Service Provider",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    description: "Hotels, guides, and transport operators managing their own listings.",
    permissions: ["All Traveller permissions", "Publish listings", "Handle incoming bookings", "Earnings dashboard"],
  },
  admin: {
    label: "Administrator",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-primary",
    description: "Full platform access including user management and settings.",
    permissions: ["Full platform access", "Manage all users", "Approve/reject listings", "Analytics & reports"],
  },
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="text-xs font-medium text-gray-700 text-right break-all">{value}</span>
    </div>
  );
}

export default function AdminEditUser() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [original, setOriginal] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "user",
    status: "active",
  });

  const [changed, setChanged] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        // Try getUserById; fall back to listing if endpoint doesn't exist yet
        const user = await adminService.getUserById(id);
        setOriginal(user);
        setForm({
          full_name: user.full_name || "",
          email: user.email || "",
          phone: user.phone || "",
          role: user.role || "user",
          status: user.status || "active",
        });
      } catch {
        toast.error("Could not load user. They may have been deleted.");
        navigate("/admin/users");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setChanged((c) => ({ ...c, [key]: true }));
  };

  const isDirty = Object.keys(changed).length > 0;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !isDirty) return;
    setIsSaving(true);
    try {
      await adminService.updateUser(id, {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        status: form.status,
      });
      toast.success(`${form.full_name}'s profile updated.`);
      navigate("/admin/users");
    } catch (err: any) {
      toast.error(err.message || "Save failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!id || !original) return;
    const newStatus = original.status === "active" ? "suspended" : "active";
    try {
      await adminService.updateUser(id, { status: newStatus });
      setOriginal({ ...original, status: newStatus });
      setForm((f) => ({ ...f, status: newStatus }));
      toast.success(`Account ${newStatus === "active" ? "reactivated" : "suspended"}.`);
    } catch {
      toast.error("Could not update account status.");
    }
  };

  const handleResetPassword = async () => {
    if (!id) return;
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%&*";
    let pw = "";
    for (let i = 0; i < 12; i++) pw += chars.charAt(Math.floor(Math.random() * chars.length));

    setIsResettingPassword(true);
    try {
      await adminService.resetPassword(id, { password: pw });
      toast.success(`Password reset. Temporary password: ${pw}`, { duration: 10000 });
    } catch {
      toast.error("Password reset failed.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !original) return;
    if (!confirm(`Permanently delete ${original.full_name}? This cannot be undone.`)) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User account deleted.");
      navigate("/admin/users");
    } catch {
      toast.error("Delete failed.");
    }
  };

  const role = roleConfig[form.role as keyof typeof roleConfig] ?? roleConfig.user;
  const initials = form.full_name
    ? form.full_name.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading user profile...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* Back nav */}
        <div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-gray-500 hover:text-gray-900 -ml-2"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" /> Back to Users
          </Button>
        </div>

        {/* Page heading */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-gray-900">
              Edit: {original?.full_name}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Modify profile details, role, or account status. Changes save immediately.
            </p>
          </div>
          <Badge
            variant="outline"
            className={`self-start mt-1 sm:mt-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold ${
              original?.status === "active"
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-red-200 bg-red-50 text-red-600"
            }`}
          >
            <div className={`h-1.5 w-1.5 rounded-full ${original?.status === "active" ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
            {original?.status === "active" ? "Active Account" : "Suspended Account"}
          </Badge>
        </div>

        <form onSubmit={handleSave}>
          <div className="grid gap-6 lg:grid-cols-3">

            {/* ── Left: Edit form ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Personal info */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">Personal Information</h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="full_name"
                        value={form.full_name}
                        onChange={(e) => set("full_name", e.target.value)}
                        className={`h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 ${changed.full_name ? "border-primary/50 bg-primary/[0.02]" : ""}`}
                        required
                      />
                      {changed.full_name && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Phone <span className="text-gray-400 font-normal">(optional)</span>
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        placeholder="+233 20 000 0000"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        className={`h-11 pl-9 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 ${changed.phone ? "border-primary/50 bg-primary/[0.02]" : ""}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`h-11 pl-9 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 ${changed.email ? "border-primary/50 bg-primary/[0.02]" : ""}`}
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-400">
                    Changing the email will update their login address. Notify the user separately.
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Shield className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">Platform Role</h2>
                </div>

                <Select value={form.role} onValueChange={(v) => set("role", v)}>
                  <SelectTrigger className="h-11 rounded-xl border-gray-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">
                      <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-slate-400" />Traveller</div>
                    </SelectItem>
                    <SelectItem value="provider">
                      <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-blue-500" />Service Provider</div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2"><div className="h-2 w-2 rounded-full bg-primary" />Administrator</div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {form.role === "admin" && form.role !== original?.role && (
                  <div className="flex gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3.5">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 leading-relaxed">
                      You are <strong>upgrading this user to Admin</strong>. They will gain full platform access. Make sure this is intentional.
                    </p>
                  </div>
                )}

                {form.role !== original?.role && form.role !== "admin" && (
                  <div className="flex gap-2.5 rounded-xl border border-blue-100 bg-blue-50 p-3.5">
                    <RefreshCw className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      Role will change from <strong>{roleConfig[original?.role as keyof typeof roleConfig]?.label ?? original?.role}</strong> to <strong>{role.label}</strong> when you save.
                    </p>
                  </div>
                )}
              </div>

              {/* Save / cancel */}
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl px-6"
                  onClick={() => navigate("/admin/users")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90 rounded-xl px-8 gap-2 font-semibold disabled:opacity-50"
                  disabled={isSaving || !isDirty}
                >
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {isSaving ? "Saving..." : isDirty ? "Save Changes" : "No Changes"}
                </Button>
              </div>
            </div>

            {/* ── Right: Overview ── */}
            <div className="space-y-5">

              {/* User profile card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4">
                <h3 className="font-semibold text-gray-800 text-sm">Account Overview</h3>

                <div className="flex items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-xl">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{form.full_name || "—"}</p>
                    <p className="text-xs text-gray-400">{form.email || "—"}</p>
                  </div>
                </div>

                <div className="space-y-0 border-t border-gray-100 pt-3">
                  <InfoRow label="Role" value={role.label} />
                  <InfoRow label="Phone" value={form.phone || "Not provided"} />
                  <InfoRow label="Status" value={original?.status === "active" ? "Active" : "Suspended"} />
                  <InfoRow
                    label="Member since"
                    value={original?.created_at ? new Date(original.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—"}
                  />
                </div>
              </div>

              {/* Role details */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${role.color}`}>
                  <div className={`h-2 w-2 rounded-full ${role.dot}`} />
                  {role.label}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>
                <div className="space-y-1.5">
                  {role.permissions.map((p) => (
                    <div key={p} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />
                      <span className="text-xs text-gray-600">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <h3 className="font-semibold text-gray-800 text-sm">Account Actions</h3>

                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="w-full flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 hover:border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <span className="flex items-center gap-2.5 font-medium">
                    <Key className="h-4 w-4 text-gray-400" />
                    Reset password
                  </span>
                  {isResettingPassword && <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />}
                </button>

                <button
                  type="button"
                  onClick={handleToggleStatus}
                  className={`w-full flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition-colors ${
                    original?.status === "active"
                      ? "border-amber-100 bg-amber-50 text-amber-700 hover:bg-amber-100"
                      : "border-green-100 bg-green-50 text-green-700 hover:bg-green-100"
                  }`}
                >
                  {original?.status === "active" ? (
                    <><Ban className="h-4 w-4" /> Suspend account</>
                  ) : (
                    <><CheckCircle2 className="h-4 w-4" /> Reactivate account</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDelete}
                  className="w-full flex items-center gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Permanently delete account
                </button>

                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Deleting an account is permanent and cannot be undone. This removes the user, their bookings, and all associated data.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
