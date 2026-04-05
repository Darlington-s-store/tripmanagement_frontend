import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Key, Eye, EyeOff, RefreshCw,
  Shield, CheckCircle2, AlertTriangle, Calendar,
  Copy, Check, User, Mail, Phone, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, User as UserType } from "@/services/admin";
import { toast } from "sonner";

/* ── Password strength meter ── */
function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters",    pass: password.length >= 8 },
    { label: "Contains a number",         pass: /\d/.test(password) },
    { label: "Contains uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Contains special character",pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const bar   = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
  const label = ["Weak", "Fair", "Good", "Strong"];
  const col   = ["text-red-500", "text-amber-500", "text-yellow-600", "text-green-600"];

  if (!password) return null;
  return (
    <div className="space-y-2 mt-2">
      <div className="flex gap-1">
        {[0,1,2,3].map((i) => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? bar[score-1] : "bg-gray-200"}`} />
        ))}
      </div>
      <div className="flex justify-between">
        <span className="text-xs text-gray-400">Strength</span>
        <span className={`text-xs font-semibold ${col[score-1] ?? "text-gray-400"}`}>{label[score-1] ?? "—"}</span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            {c.pass
              ? <CheckCircle2 className="h-3 w-3 shrink-0 text-green-500" />
              : <div className="h-3 w-3 shrink-0 rounded-full border border-gray-300" />}
            <span className={`text-[11px] ${c.pass ? "text-green-700" : "text-gray-400"}`}>{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Info row for overview panel ── */
function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <Icon className="h-4 w-4 text-gray-300 shrink-0 mt-0.5" />
      <div className="flex flex-col min-w-0">
        <span className="text-[11px] text-gray-400 uppercase tracking-wide">{label}</span>
        <span className="text-sm font-medium text-gray-700 break-all">{value}</span>
      </div>
    </div>
  );
}

export default function AdminResetPassword() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser]           = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [password, setPassword]   = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [copied, setCopied]       = useState(false);
  const [isSaving, setIsSaving]   = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const u = await adminService.getUserById(id);
        setUser(u);
      } catch {
        toast.error("Could not load user.");
        navigate("/admin/users");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id, navigate]);

  /* Generate a secure random password */
  const generate = () => {
    const upper   = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lower   = "abcdefghjkmnpqrstuvwxyz";
    const digits  = "23456789";
    const special = "!@#$%&*";
    const all     = upper + lower + digits + special;
    let pw =
      upper  [Math.floor(Math.random() * upper.length)]   +
      lower  [Math.floor(Math.random() * lower.length)]   +
      digits [Math.floor(Math.random() * digits.length)]  +
      special[Math.floor(Math.random() * special.length)];
    for (let i = 4; i < 14; i++) pw += all[Math.floor(Math.random() * all.length)];
    setPassword(pw.split("").sort(() => Math.random() - 0.5).join(""));
    setShowPw(true);
  };

  const copyToClipboard = async () => {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setIsSaving(true);
    try {
      await adminService.resetPassword(id, { password });
      toast.success(`Password reset for ${user?.full_name}. Share it securely.`);
      navigate("/admin/users");
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || "Password reset failed.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = user?.full_name
    ? user.full_name.trim().split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "?";

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-sm">Loading user...</span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">

        {/* Back nav */}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2 text-gray-500 hover:text-gray-900 -ml-2"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Users
        </Button>

        {/* Page heading */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="mt-1 text-sm text-gray-500">
            Set a new password for this account. You'll need to share it with the user through a secure channel.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">

            {/* ── Left: Form ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Target user */}
              <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary text-lg">
                  {initials}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.full_name}</p>
                  <p className="text-sm text-gray-400">{user?.email}</p>
                </div>
                <Badge
                  variant="outline"
                  className={`ml-auto text-[11px] font-semibold ${
                    user?.status === "active"
                      ? "border-green-200 bg-green-50 text-green-700"
                      : "border-red-200 bg-red-50 text-red-600"
                  }`}
                >
                  {user?.status === "active" ? "Active" : "Suspended"}
                </Badge>
              </div>

              {/* Password input */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
                <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                  <Key className="h-4 w-4 text-primary" />
                  <h2 className="font-semibold text-gray-800">New Password</h2>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <button
                      type="button"
                      onClick={generate}
                      className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" /> Generate secure password
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPw ? "text" : "password"}
                        placeholder="Enter or generate a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pr-10 rounded-xl border-gray-200 font-mono focus:border-primary focus:ring-1 focus:ring-primary/30"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11 rounded-xl shrink-0"
                      onClick={copyToClipboard}
                      disabled={!password}
                      title="Copy to clipboard"
                    >
                      {copied
                        ? <Check className="h-4 w-4 text-green-500" />
                        : <Copy className="h-4 w-4 text-gray-400" />
                      }
                    </Button>
                  </div>

                  <PasswordStrength password={password} />
                </div>

                {/* Warning */}
                <div className="flex gap-2.5 rounded-xl border border-amber-100 bg-amber-50 p-4">
                  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-700 leading-relaxed space-y-1">
                    <p className="font-semibold">Before you reset:</p>
                    <ul className="list-disc list-inside space-y-0.5 opacity-90">
                      <li>This will immediately invalidate the user's current password.</li>
                      <li>The user will be logged out of all active sessions.</li>
                      <li>Share the new password through a private, secure channel — not email in plain text.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Actions */}
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
                  disabled={isSaving || password.length < 8}
                  className="gap-2 rounded-xl bg-primary px-8 font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {isSaving
                    ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <Key className="h-4 w-4" />}
                  {isSaving ? "Resetting..." : "Confirm Reset"}
                </Button>
              </div>
            </div>

            {/* ── Right: Overview ── */}
            <div className="space-y-5">

              {/* Account details */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-1">
                <h3 className="font-semibold text-gray-800 text-sm mb-3">Account Details</h3>

                <InfoRow icon={User}     label="Full Name"   value={user?.full_name || "—"} />
                <InfoRow icon={Mail}     label="Email"       value={user?.email || "—"} />
                <InfoRow icon={Phone}    label="Phone"       value={user?.phone || "Not provided"} />
                <InfoRow icon={Shield}   label="Role"        value={
                  user?.role === "user" ? "Traveller" :
                  user?.role === "provider" ? "Service Provider" : "Administrator"
                } />
                <InfoRow icon={Clock}    label="Status"      value={user?.status === "active" ? "Active" : "Suspended"} />
                <InfoRow icon={Calendar} label="Joined"      value={
                  user?.created_at
                    ? new Date(user.created_at).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric"
                      })
                    : "—"
                } />
              </div>

              {/* Security notes */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold text-gray-800 text-sm">Security Notes</h3>
                </div>
                {[
                  "Use the Generate button to create a cryptographically strong password.",
                  "Copy the password before confirming — it won't be shown again.",
                  "Advise the user to change their password immediately after login.",
                  "Do not send passwords over public chat apps or unencrypted email.",
                ].map((note, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-green-500 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed">{note}</p>
                  </div>
                ))}
              </div>

              {/* Quick copy reminder */}
              {password && (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="text-xs font-semibold text-primary">Generated password</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 rounded-lg bg-white border border-primary/20 px-3 py-2 text-xs font-mono text-gray-800 break-all">
                      {showPw ? password : "•".repeat(password.length)}
                    </code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-white text-primary hover:bg-primary/5 transition-colors"
                    >
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-primary/70">Copy this before clicking Confirm Reset.</p>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
