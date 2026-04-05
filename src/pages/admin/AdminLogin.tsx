import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { user, isLoading: authLoading, adminLogin, verifyMFA } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaEmail, setMfaEmail] = useState("");

  // Redirect if already authenticated as admin
  if (!authLoading && user?.role === "admin") {
    return <Navigate to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await adminLogin(email, password);
      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaEmail(result.email || email);
        toast.info("Admin security code sent to your email");
        return;
      }
      toast.success("Admin login successful!");
      navigate("/admin");
    } catch (error: unknown) {
      toast.error(error.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await verifyMFA(mfaEmail, mfaCode);
      toast.success("Admin verified successfully!");
      navigate("/admin");
    } catch (error: unknown) {
      toast.error(error.message || "Invalid security code");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center py-12 px-4 shadow-2xl">
        <Card className="w-full max-w-md border-slate-700 bg-slate-900/50 backdrop-blur-xl text-white">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30">
              <span className="text-2xl font-bold">A</span>
            </div>
            <CardTitle className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              {mfaRequired ? "Security Verification" : "Admin Portal"}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {mfaRequired 
                ? `Enter the code sent to ${mfaEmail}`
                : "Secure access for TripEase administrators"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!mfaRequired ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Admin Email</label>
                  <Input
                    type="email"
                    placeholder="admin@tripease.com"
                    className="bg-slate-800/50 border-slate-700 focus:ring-primary text-white h-12"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Secret Key</label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className="bg-slate-800/50 border-slate-700 focus:ring-primary text-white h-12"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Authenticating..." : "Access Dashboard"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleMfaSubmit} className="space-y-6">
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="000000"
                    className="text-center text-3xl tracking-[0.6em] font-mono h-16 bg-slate-800/50 border-slate-700 text-primary uppercase"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    required
                    autoFocus
                  />
                  <p className="text-xs text-center text-slate-500">
                    For security, this code is only valid for 10 minutes. 
                    Verify your identity to proceed.
                  </p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-12 text-base font-semibold" 
                    disabled={isSubmitting || mfaCode.length !== 6}
                  >
                    {isSubmitting ? "Verifying..." : "Confirm Identity"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full text-slate-400 hover:text-white" 
                    onClick={() => setMfaRequired(false)}
                    disabled={isSubmitting}
                  >
                    Cancel & Return
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
