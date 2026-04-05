import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, UserPlus, User, Mail, Lock, Phone,
  Shield, Eye, EyeOff, Info, CheckCircle2, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService } from "@/services/admin";
import { toast } from "sonner";

const roleInfo = {
  user: {
    label: "Traveller",
    color: "bg-slate-100 text-slate-700 border-slate-200",
    dot: "bg-slate-400",
    description: "Standard registered traveller. Can browse, book, and leave reviews. No administrative access.",
    permissions: ["Browse all listings", "Make bookings", "Leave reviews", "Manage own profile"],
  },
  provider: {
    label: "Service Provider",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    description: "Hotels, guides, and transport operators. Can manage their own listings and handle incoming bookings.",
    permissions: ["All Traveller permissions", "Publish & manage listings", "Respond to bookings", "View earnings dashboard"],
  },
  admin: {
    label: "Administrator",
    color: "bg-orange-50 text-orange-700 border-orange-200",
    dot: "bg-primary",
    description: "Full platform access. Can manage all users, listings, bookings, and platform settings. Assign carefully.",
    permissions: ["Full platform access", "Manage all users", "Approve/reject listings", "View analytics & reports", "Modify platform settings"],
  },
};

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", pass: password.length >= 8 },
    { label: "Contains a number", pass: /\d/.test(password) },
    { label: "Contains uppercase", pass: /[A-Z]/.test(password) },
    { label: "Contains special character", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const strength = score <= 1 ? "Weak" : score <= 2 ? "Fair" : score === 3 ? "Good" : "Strong";
  const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-400"];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-gray-200"}`}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">Password strength</span>
        <span className={`text-xs font-semibold ${score <= 1 ? "text-red-500" : score <= 2 ? "text-amber-500" : score === 3 ? "text-yellow-600" : "text-green-600"}`}>
          {strength}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass
              ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
              : <div className="h-3 w-3 shrink-0 rounded-full border border-gray-300" />
            }
            <span className={`text-[11px] ${c.pass ? "text-green-700" : "text-gray-400"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminCreateUser() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const role = roleInfo[form.role as keyof typeof roleInfo];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.fullName.trim()) return toast.error("Please enter the user's full name.");
    if (!form.email.trim()) return toast.error("Please enter an email address.");
    if (form.password.length < 8) return toast.error("Password must be at least 8 characters.");

    setIsSubmitting(true);
    try {
      await adminService.createUser({
        full_name: form.fullName,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        role: form.role,
      });
      toast.success(`Account created for ${form.fullName}`);
      navigate("/admin/users");
    } catch (err: unknown) {
      toast.error(err.message || "Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePassword = () => {
    const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower = "abcdefghjkmnpqrstuvwxyz";
    const digits = "23456789";
    const special = "!@#$%&*";
    const all = upper + lower + digits + special;
    let pw = upper[Math.floor(Math.random() * upper.length)]
      + lower[Math.floor(Math.random() * lower.length)]
      + digits[Math.floor(Math.random() * digits.length)]
      + special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 14; i++) pw += all[Math.floor(Math.random() * all.length)];
    set("password", pw.split("").sort(() => Math.random() - 0.5).join(""));
    setShowPassword(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex flex-col gap-6">
          {/* Sticky Header with Actions */}
          <div className="sticky top-0 z-10 flex flex-col gap-4 border-l-4 border-primary bg-white/80 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center sm:justify-between sm:p-6 rounded-r-xl">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 -ml-2 text-gray-500 hover:text-primary"
                  onClick={() => navigate("/admin/users")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Users
                </Button>
              </div>
              <h1 className="font-display text-2xl font-bold text-gray-900 leading-tight">Add New User</h1>
              <p className="text-sm text-gray-500 text-slate-500">Create a new platform account and assign access levels.</p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="h-11 rounded-xl px-6 font-medium border-gray-200 hover:bg-gray-50 hover:text-gray-900 transition-all"
                onClick={() => navigate("/admin/users")}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="h-11 bg-primary hover:bg-primary/90 text-white rounded-xl px-8 gap-2 font-semibold shadow-sm shadow-primary/20 transition-all"
                type="submit"
                form="user-form"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                {isSubmitting ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </div>

          <form id="user-form" onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">

            {/* ── Left: Form ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Identity */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <User className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">General Information</h2>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. Kofi Mensah"
                      value={form.fullName}
                      onChange={(e) => set("fullName", e.target.value)}
                      className="h-11 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30"
                      required
                    />
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
                        className="h-11 pl-9 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Credentials */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Mail className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">Login Credentials</h2>
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
                      placeholder="user@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className="h-11 pl-9 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Initial Password <span className="text-red-500">*</span>
                    </Label>
                    <button
                      type="button"
                      className="text-xs font-semibold text-primary hover:underline"
                      onClick={generatePassword}
                    >
                      Generate secure password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      className="h-11 pl-9 pr-10 rounded-xl border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary/30 font-mono"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={form.password} />
                  <p className="text-xs text-gray-400 flex items-start gap-1.5 pt-1">
                    <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                    The user will receive this password via email and should be prompted to change it on first login.
                  </p>
                </div>
              </div>

              {/* Role */}
              <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-5 shadow-sm">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Shield className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">Account Role</h2>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">Role</Label>
                  <Select value={form.role} onValueChange={(v) => set("role", v)}>
                    <SelectTrigger className="h-11 rounded-xl border-gray-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          Traveller
                        </div>
                      </SelectItem>
                      <SelectItem value="provider">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          Service Provider
                        </div>
                      </SelectItem>
                      <SelectItem value="admin">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          Administrator
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {form.role === "admin" && (
                  <div className="flex gap-2.5 rounded-xl border border-orange-200 bg-orange-50 p-3.5">
                    <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-orange-700 leading-relaxed">
                      <strong>Admin access is powerful.</strong> This user will be able to manage all platform data including other user accounts. Only assign this role to trusted personnel.
                    </p>
                  </div>
                )}
              </div>

              {/* Actions removed from bottom, moved to header */}
            </div>

            {/* ── Right: Overview Panel ── */}
            <div className="space-y-5">

              {/* Live preview */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4 shadow-sm">
                <h3 className="font-semibold text-gray-800 text-sm">Role Overview</h3>

                <div className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-semibold ${role.color}`}>
                  <div className={`h-2 w-2 rounded-full ${role.dot}`} />
                  {role.label}
                </div>

                <p className="text-xs text-gray-500 leading-relaxed">{role.description}</p>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</p>
                  {role.permissions.map((p) => (
                    <div key={p} className="flex items-start gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />
                      <span className="text-xs text-gray-600">{p}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tip */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-semibold text-gray-800 text-sm">Account Preview</h3>

                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-lg">
                    {form.fullName
                      ? form.fullName.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
                      : "?"}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {form.fullName || <span className="text-gray-300">Full name</span>}
                    </p>
                    <p className="text-xs text-gray-400">
                      {form.email || <span className="text-gray-300">email@example.com</span>}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 border-t border-gray-100 pt-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Role</span>
                    <Badge variant="outline" className={`text-[10px] py-0 ${role.color}`}>
                      {role.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Phone</span>
                    <span className="font-medium text-gray-700">{form.phone || "—"}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Status</span>
                    <span className="flex items-center gap-1 font-medium text-green-600">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Active on creation
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">MFA</span>
                    <span className="text-gray-500">Disabled by default</span>
                  </div>
                </div>
              </div>

              {/* Tip */}
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <p className="text-xs leading-relaxed text-blue-700">
                  <strong className="block mb-1">After creating this account</strong>
                  Share the email and initial password with the user through a secure channel. They can update their password from their account settings.
                </p>
              </div>
            </div>
          </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
