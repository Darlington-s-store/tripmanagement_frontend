import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth";

const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!token) {
            setError("Invalid reset link. The token is missing.");
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            setIsSuccess(true);
            toast.success("Password reset successfully!");

            // Auto redirect after 3 seconds
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            const error = err as Error;
            toast.error(error.message || "Failed to reset password. Link may be expired.");
            setError(error.message || "Something went wrong.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Password Reset!</h2>
                    <p className="text-muted-foreground">
                        Your password has been successfully updated. You will be redirected to the login page momentarily.
                    </p>
                    <div className="space-y-4 pt-4">
                        <Button onClick={() => navigate("/login")} className="w-full">
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !isSuccess) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Issue with Reset Link</h2>
                    <p className="text-muted-foreground">{error}</p>
                    <div className="space-y-4 pt-4">
                        <Link to="/forgot-password">
                            <Button variant="outline" className="w-full">
                                Request New Link
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
            <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight">Set New Password</h2>
                    <p className="mt-2 text-muted-foreground">
                        Please enter your new password below to regain access to your account.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="new-password" style={{ color: "black" }} className="text-sm font-medium leading-none">
                                New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="new-password"
                                    type="password"
                                    placeholder="At least 8 characters"
                                    className="pl-10"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="confirm-password" style={{ color: "black" }} className="text-sm font-medium leading-none">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="confirm-password"
                                    type="password"
                                    placeholder="Repeat your new password"
                                    className="pl-10"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Resetting password...
                            </>
                        ) : (
                            "Update Password"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
