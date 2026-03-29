import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, MoreVertical, Shield, Ban, Eye, CheckCircle2, UserPlus, Key, Trash2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { adminService, User } from "@/services/admin";
import { toast } from "sonner";

const AdminUsers = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog States
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    role: "user"
  });
  const [newPassword, setNewPassword] = useState("");

  useEffect(() => {
    loadUsers();
  }, [searchQuery, roleFilter, statusFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllUsers({
        search: searchQuery,
        role: roleFilter,
        status: statusFilter
      });
      setUsers(data);
    } catch (error) {
      console.error("Failed to load users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminService.updateUser(id, { status: newStatus });
      setUsers(users.map(u => u.id === id ? { ...u, status: newStatus } : u));
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      toast.error("Failed to update user status");
    }
  };

  const handleCreateUser = async () => {
    try {
      await adminService.createUser(formData);
      toast.success("User created successfully");
      setIsAddUserOpen(false);
      setFormData({ email: "", password: "", fullName: "", phone: "", role: "user" });
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUser(selectedUser.id, {
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      });
      toast.success("User updated successfully");
      setIsEditUserOpen(false);
      loadUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;
    try {
      await adminService.resetPassword(selectedUser.id, { password: newPassword });
      toast.success("Password reset successfully");
      setIsResetPasswordOpen(false);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to reset password");
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      await adminService.deleteUser(id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [userActivity, setUserActivity] = useState<{ bookings: any[], reviews: any[] } | null>(null);
  const [isActivityLoading, setIsActivityLoading] = useState(false);

  const handleViewActivity = async (user: User) => {
    setSelectedUser(user);
    setIsActivityOpen(true);
    setIsActivityLoading(true);
    try {
      const activity = await adminService.getUserActivity(user.id);
      setUserActivity(activity);
    } catch (error) {
      toast.error("Failed to load user activity");
    } finally {
      setIsActivityLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold">User Management</h2>
            <p className="text-sm text-muted-foreground text-opacity-70">Manage all registered users, roles, and platform access.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="gap-2 bg-primary hover:bg-primary/90 rounded-xl"
              onClick={() => navigate("/admin/users/new")}
            >
              <UserPlus className="h-4 w-4" /> Add New User
            </Button>
            <Badge variant="secondary" className="px-3 py-1 bg-accent/30">{users.length} Total Users</Badge>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row bg-card p-4 rounded-xl border border-border">
          <div className="flex flex-1 items-center gap-2 rounded-xl border border-border px-3 bg-muted/20">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or phone..."
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent h-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="All Roles" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">Travellers</SelectItem>
                <SelectItem value="provider">Providers</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] rounded-xl"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">User Information</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Role</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Status</th>
                <th className="px-6 py-4 text-left font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Joined Date</th>
                <th className="px-6 py-4 text-right font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground italic">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      Loading platform users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-2 opacity-60">
                      <Users className="h-10 w-10" />
                      No users found matching your criteria.
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {u.full_name ? u.full_name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : u.email.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{u.full_name || 'Anonymous User'}</p>
                          <p className="text-xs text-muted-foreground/80">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={`capitalize rounded-lg px-2 text-[10px] font-bold ${u.role === 'admin' ? 'border-purple-500 text-purple-600 bg-purple-50' :
                        u.role === 'provider' ? 'border-blue-500 text-blue-600 bg-blue-50' :
                          'border-slate-300 text-slate-600 bg-slate-50'
                        }`}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${u.status === "active" ? "bg-success animate-pulse" : "bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.4)]"}`} />
                        <span className={`text-xs font-semibold capitalize ${u.status === "active" ? "text-success" : "text-destructive"}`}>
                          {u.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">{new Date(u.created_at).toLocaleDateString('en-GB')}</td>
                    <td className="px-6 py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0 hover:bg-accent/50"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-xl border-border">
                          <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => {
                            navigate(`/admin/users/${u.id}/edit`);
                          }}>
                            <Edit className="h-3.5 w-3.5" /> Edit Profile
                          </DropdownMenuItem>

                          <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => navigate(`/admin/users/${u.id}/reset-password`)}>
                            <Key className="h-3.5 w-3.5" /> Reset Password
                          </DropdownMenuItem>

                          <DropdownMenuItem className="gap-2 rounded-lg py-2" onClick={() => navigate(`/admin/users/${u.id}/activity`)}>
                            <Eye className="h-3.5 w-3.5" /> View Activity
                          </DropdownMenuItem>

                          <DropdownMenuSeparator className="my-1" />

                          {u.status === "active" ? (
                            <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive rounded-lg py-2" onClick={() => handleUpdateStatus(u.id, "suspended")}>
                              <Ban className="h-3.5 w-3.5" /> Suspend Account
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="gap-2 text-success focus:text-success rounded-lg py-2" onClick={() => handleUpdateStatus(u.id, "active")}>
                              <CheckCircle2 className="h-3.5 w-3.5" /> Reactivate Account
                            </DropdownMenuItem>
                          )}

                          <DropdownMenuItem className="gap-2 text-destructive focus:text-destructive rounded-lg py-2" onClick={() => handleDeleteUser(u.id)}>
                            <Trash2 className="h-3.5 w-3.5" /> Permanent Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User: {selectedUser?.full_name}</DialogTitle>
            <DialogDescription>Update user profile information and account role.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input id="edit-email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Traveller</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>Force a password reset for <b>{selectedUser?.email}</b></DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-password">New Password</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] gap-1"
                  onClick={() => {
                    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
                    let pass = "";
                    for (let i = 0; i < 12; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
                    setNewPassword(pass);
                  }}
                >
                  <Key className="h-3 w-3" /> Generate
                </Button>
              </div>
              <Input id="new-password" type="text" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter or generate password" />
              <p className="text-[10px] text-muted-foreground">* The user will receive an email with this password.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordOpen(false)}>Cancel</Button>
            <Button onClick={handleResetPassword} className="bg-destructive hover:bg-destructive/90">Confirm Reset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Activity Dialog */}
      <Dialog open={isActivityOpen} onOpenChange={setIsActivityOpen}>
        <DialogContent className="sm:max-w-[600px] h-[70vh] flex flex-col p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary" /> User Activity: {selectedUser?.full_name}
            </DialogTitle>
            <DialogDescription className="text-xs">{selectedUser?.email}</DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="bookings" className="flex-1 flex flex-col px-6">
            <TabsList className="grid w-full grid-cols-2 rounded-xl h-10 mb-4">
              <TabsTrigger value="bookings" className="rounded-lg">Bookings ({Array.isArray(userActivity?.bookings) ? userActivity.bookings.length : 0})</TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">Reviews ({Array.isArray(userActivity?.reviews) ? userActivity.reviews.length : 0})</TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0 pb-6">
              <TabsContent value="bookings" className="h-full m-0">
                <ScrollArea className="h-full pr-4 border-r border-transparent">
                  {isActivityLoading ? (
                    <div className="flex justify-center p-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : !Array.isArray(userActivity?.bookings) || userActivity.bookings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">No bookings found for this user.</div>
                  ) : (
                    <div className="space-y-3">
                      {userActivity.bookings.map((b: any) => (
                        <div key={b.id} className="p-3 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline" className="capitalize text-[10px]">{b.booking_type}</Badge>
                            <span className={`text-[10px] font-bold uppercase rounded px-1.5 py-0.5 ${b.status === 'confirmed' ? 'bg-success/10 text-success' :
                              b.status === 'pending' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                              }`}>{b.status}</span>
                          </div>
                          <p className="font-semibold text-sm">Booking ID: {b.id.substring(0, 8)}...</p>
                          <div className="flex justify-between items-end mt-2">
                            <span className="text-xs text-muted-foreground">{new Date(b.created_at).toLocaleDateString()}</span>
                            <span className="font-bold text-primary">${b.total_price}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="reviews" className="h-full m-0">
                <ScrollArea className="h-full pr-4 border-r border-transparent">
                  {isActivityLoading ? (
                    <div className="flex justify-center p-12">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : !Array.isArray(userActivity?.reviews) || userActivity.reviews.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-xl">No reviews found for this user.</div>
                  ) : (
                    <div className="space-y-3">
                      {userActivity.reviews.map((r: any) => (
                        <div key={r.id} className="p-3 rounded-xl border border-border bg-card">
                          <div className="flex items-center gap-1 mb-1">
                            {[1, 2, 3, 4, 5].map(star => (
                              <div key={star} className={`h-2.5 w-2.5 rounded-full ${star <= r.rating ? "bg-yellow-400" : "bg-muted"}`} />
                            ))}
                          </div>
                          <p className="text-xs italic text-foreground/90">"{r.comment}"</p>
                          <span className="text-[10px] text-muted-foreground mt-2 block">{new Date(r.created_at).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AdminUsers;
