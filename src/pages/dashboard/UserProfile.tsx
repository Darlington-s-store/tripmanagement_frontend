import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Loader, Calendar, Shield, Map, Bookmark, Star, Key, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    bio: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateProfile(formData.full_name, formData.phone, formData.bio);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const initials = formData.full_name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  const memberSince = user?.created_at ? format(new Date(user.created_at), "MMMM yyyy") : "N/A";

  return (
    <DashboardLayout role="user">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Profile Settings</h2>
            <p className="text-slate-500">Manage your personal information and travel preferences.</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-primary hover:bg-primary/90">
                  {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} className="bg-primary hover:bg-primary/90">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Quick Info */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <div className="relative mb-4">
                    <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center border-4 border-white shadow-md">
                      <span className="text-3xl font-display font-bold text-primary">{initials}</span>
                    </div>
                    {isEditing && (
                      <Button size="icon" variant="ghost" className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-sm border border-slate-200 hover:bg-slate-50">
                        <Camera className="h-4 w-4 text-slate-600" />
                      </Button>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{formData.full_name || "Traveller"}</h3>
                  <p className="text-sm text-slate-500 mb-6 capitalize">{user?.role || "Member"}</p>

                  <div className="w-full grid grid-cols-3 gap-4 border-y border-slate-100 py-6 my-2">
                    <div className="text-center">
                      <p className="text-xl font-bold text-primary">0</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Trips</p>
                    </div>
                    <div className="text-center border-x border-slate-100 px-2">
                      <p className="text-xl font-bold text-primary">0</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Reviews</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-emerald-500">Explorer</p>
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Level</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail className="h-4 w-4 mr-3 text-slate-400" />
                    {formData.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                    Member since {memberSince}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Shield className="h-4 w-4 mr-3 text-emerald-500" />
                    Verified Account
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  <span className="font-semibold text-primary">Pro Tip</span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Completing your profile helps TripEase tailor the best travel experiences in Ghana for you!
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Personal Details</CardTitle>
                <CardDescription>Update your basic information and bio.</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-slate-400" /> Full Name
                    </label>
                    <Input
                      name="full_name"
                      placeholder="e.g. Ama Serwaa"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-slate-50 border-slate-100 disabled:opacity-80"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5 text-slate-400" /> Email Address
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      disabled={true}
                      className="bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-slate-400" /> Phone Number
                    </label>
                    <Input
                      name="phone"
                      type="tel"
                      placeholder="+233 XX XXX XXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="bg-slate-50 border-slate-100 disabled:opacity-80"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="h-3.5 w-3.5 text-slate-400" /> About You (Bio)
                    </label>
                    <Textarea
                      name="bio"
                      placeholder="Tell us about your travel philosophy..."
                      value={formData.bio}
                      onChange={handleChange}
                      disabled={!isEditing}
                      rows={3}
                      className="bg-slate-50 border-slate-100 disabled:opacity-80 resize-none"
                    />
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
              <CardHeader>
                <CardTitle className="text-lg">Security & Privacy</CardTitle>
                <CardDescription>Keep your account secure.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <Key className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Account Password</h4>
                      <p className="text-xs text-slate-500">Change your password at any time.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Update</Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Privacy Settings</h4>
                      <p className="text-xs text-slate-500">Manage what others see about you.</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
