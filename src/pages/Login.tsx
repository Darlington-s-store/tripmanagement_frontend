import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, Loader } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const { login, verifyMFA, isLoading } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaCode, setMfaCode] = useState("");
  const [mfaEmail, setMfaEmail] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.mfaRequired) {
        setMfaRequired(true);
        setMfaEmail(result.email || formData.email);
        toast.info("Verification code sent to your email");
        return;
      }

      if (result.user) {
        toast.success("Logged in successfully!");
        if (result.user.requires_password_change) {
          navigate("/change-password-required");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await verifyMFA(mfaEmail, mfaCode);
      toast.success("Verified successfully!");
      if (user.requires_password_change) {
        navigate("/change-password-required");
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code");
    }
  };

  return (
    <Layout>
      <div className="flex min-h-[80vh] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md animate-fade-in text-center px-4">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-primary-sm">
            {!mfaRequired ? (
              <>
                <div className="mb-6 text-center">
                  <h1 className="font-display text-2xl font-bold">Welcome Back</h1>
                  <p className="text-sm text-muted-foreground">Sign in to your TripEase account</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="text-left">
                    <label className="mb-1 block text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <label className="mb-1 block text-sm font-medium">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        type={showPw ? "text" : "password"}
                        name="password"
                        placeholder="••••••••"
                        className="pl-10 pr-10"
                        value={formData.password}
                        onChange={handleChange}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Button className="w-full" size="lg" disabled={isLoading}>
                    {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                    Sign In
                  </Button>
                </form>

                <div className="my-6 flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button variant="outline" className="w-full gap-2" size="lg">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Sign in with Google
                </Button>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link to="/register" className="text-primary hover:underline">Create one</Link>
                </p>
              </>
            ) : (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="mb-6 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <User className="h-6 w-6" />
                  </div>
                  <h1 className="font-display text-2xl font-bold">Shield Active</h1>
                  <p className="text-sm text-muted-foreground px-4">
                    Enter the verification code sent to <br/>
                    <span className="font-medium text-foreground">{mfaEmail}</span>
                  </p>
                </div>

                <form onSubmit={handleMfaSubmit} className="space-y-6">
                  <div>
                    <Input
                      type="text"
                      placeholder="Enter 6-digit code"
                      className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                      required
                      autoFocus
                    />
                  </div>
                  
                  <div className="space-y-3">
                    <Button className="w-full h-12 text-base" disabled={isLoading || mfaCode.length !== 6}>
                      {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                      Verify & Login
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => setMfaRequired(false)}
                      disabled={isLoading}
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>

                <p className="mt-8 text-xs text-muted-foreground">
                  Didn't receive a code? Check your spam folder or contact support.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
