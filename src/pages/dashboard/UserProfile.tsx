import { useEffect, useState } from "react";
import { User, Mail, Phone, MapPin, Camera, Save, Loader, Calendar, Shield, Map, Bookmark, Star, Key, FileText, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { formatDate } from "@/utils/date";

const UserProfile = () => {
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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
      await updateProfile({
        fullName: formData.full_name,
        phone: formData.phone,
        bio: formData.bio
      });
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploading(true);
    try {
      await uploadAvatar(file);
      toast.success("Profile picture updated");
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const initials = (formData.full_name || user?.full_name || "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2) || "U";

  const memberSince = user?.created_at ? formatDate(user.created_at, "MMMM yyyy") : "N/A";

  return (
    <DashboardLayout role="user">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account and travel preferences</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? <Loader className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Avatar Card */}
            <Card className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center overflow-hidden border-4 border-background">
                      {user?.avatar_url ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001'}${user.avatar_url}`} 
                          alt={formData.full_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-white">{initials}</span>
                      )}
                      
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Loader className="h-8 w-8 text-white animate-spin" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <>
                        <input
                          type="file"
                          id="avatar-upload"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          disabled={isUploading}
                        />
                        <Button 
                          size="icon"
                          className="absolute bottom-0 right-0 h-10 w-10 rounded-full shadow-lg"
                          asChild
                        >
                          <label htmlFor="avatar-upload" className="cursor-pointer flex items-center justify-center">
                            <Camera className="h-5 w-5" />
                          </label>
                        </Button>
                      </>
                    )}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold">{formData.full_name || "Traveller"}</h2>
                    <p className="text-sm text-muted-foreground capitalize">{user?.role || "Member"}</p>
                    <p className="text-xs text-muted-foreground pt-2">Member since {memberSince}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardContent className="pt-6 space-y-2">
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Key className="mr-2 h-4 w-4" /> Change Password
                </Button>
                <Button variant="ghost" className="w-full justify-start" size="sm">
                  <Shield className="mr-2 h-4 w-4" /> Security Settings
                </Button>
                <Button variant="ghost" className="w-full justify-start text-destructive hover:text-destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      name="full_name"
                      placeholder="Your full name"
                      value={formData.full_name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="disabled:opacity-70"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled={true}
                        className="opacity-70 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        name="phone"
                        type="tel"
                        placeholder="+233..."
                        value={formData.phone}
                        onChange={handleChange}
                        disabled={!isEditing}
                        className="disabled:opacity-70"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* About */}
            <Card>
              <CardHeader>
                <CardTitle>About You</CardTitle>
                <CardDescription>Tell travelers a bit about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  name="bio"
                  placeholder="Share your travel interests, favorite destinations, or what makes you a great travel companion..."
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={4}
                  className="disabled:opacity-70 resize-none"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserProfile;
