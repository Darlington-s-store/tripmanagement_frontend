import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, Loader, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import { authService } from "@/services/auth";
import { toast } from "sonner";

const ForcePasswordChange = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPw, setShowPw] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.newPassword !== formData.confirmPassword) {
            return toast.error("New passwords do not match");
        }

        setIsLoading(true);
        try {
            await authService.changePassword(formData.currentPassword, formData.newPassword);
            toast.success("Password changed successfully! You can now access your account.");
            navigate("/dashboard");
        } catch (error: unknown) {
            toast.error(error.message || "Failed to change password. Please check your current password.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="flex min-h-[80vh] items-center justify-center py-12">
                <div className="mx-auto w-full max-w-md animate-fade-in">
                    <div className="rounded-2xl border border-yellow-200 bg-yellow-50/30 p-8 shadow-sm backdrop-blur-sm dark:border-yellow-900/30 dark:bg-yellow-950/20">
                        <div className="mb-6 text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500">
                                <ShieldCheck className="h-6 w-6" />
                            </div>
                            <h1 className="font-display text-2xl font-bold">Password Change Required</h1>
                            <p className="text-sm text-muted-foreground mt-2">
                                An administrator has reset your password. For security, you must set a new personal password before continuing.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Temporary Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        name="currentPassword"
                                        placeholder="The password sent to your email"
                                        className="pl-10"
                                        value={formData.currentPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="h-px bg-yellow-200 dark:bg-yellow-900/30 my-2" />

                            <div>
                                <label className="mb-1 block text-sm font-medium">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type={showPw ? "text" : "password"}
                                        name="newPassword"
                                        placeholder="Strength: 8+ chars"
                                        className="pl-10 pr-10"
                                        value={formData.newPassword}
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

                            <div>
                                <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Repeat your new password"
                                        className="pl-10"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>

                            <Button className="w-full bg-yellow-600 hover:bg-yellow-700 text-white" size="lg" disabled={isLoading}>
                                {isLoading && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                                Update Password & Continue
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ForcePasswordChange;
