import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { authService } from "@/services/auth";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email address");
            return;
        }

        setIsLoading(true);
        try {
            await authService.forgotPassword(email);
            setIsSubmitted(true);
            toast.success("Requested successfully");
        } catch (error: any) {
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-12">
                <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
                        <CheckCircle2 className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">Check your email</h2>
                    <p className="text-muted-foreground">
                        We've sent a password reset link to <span className="font-semibold text-foreground">{email}</span>.
                        Please check your inbox and follow the instructions.
                    </p>
                    <div className="space-y-4 pt-4">
                        <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:underline">
                            <ArrowLeft className="h-4 w-4" /> Back to Login
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
                    <Link to="/login" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
                        <ArrowLeft className="h-4 w-4" /> Back to Login
                    </Link>
                    <h2 className="mt-4 text-3xl font-bold tracking-tight">Forgot Password?</h2>
                    <p className="mt-2 text-muted-foreground">
                        No worries, it happens! Enter your email and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium leading-none">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="pl-10"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending link...
                            </>
                        ) : (
                            "Send Reset Link"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
