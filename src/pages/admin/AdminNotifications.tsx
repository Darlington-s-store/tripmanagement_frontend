import { useState, useEffect } from "react";
import {
  Bell, Send, Trash2, Users, Info, AlertTriangle, CheckCircle,
  Loader, Search, Filter, Megaphone, Plus, Mail, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { notificationsService, Notification } from "@/services/notifications";

type AdminNotification = Notification & { user_full_name: string; user_email: string };

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");

  // Announcement Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("announcement");

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await notificationsService.getAllNotifications();
      setNotifications(data);
    } catch (error) {
      toast.error("Failed to load notifications");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error("Please fill in both title and message");
      return;
    }

    setIsSending(true);
    try {
      await notificationsService.sendAnnouncement(title, message, type);
      toast.success("Announcement broadcasted successfully to all users");
      setTitle("");
      setMessage("");
      loadNotifications();
    } catch (error) {
      toast.error("Failed to send announcement");
    } finally {
      setIsSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this notification? This cannot be undone.")) return;

    try {
      await notificationsService.deleteNotification(id);
      toast.success("Notification deleted");
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = (n.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (n.user_full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (n.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesFilter = filterType === "all" || n.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'announcement': return { icon: <Megaphone className="h-5 w-5" />, color: "bg-primary/10 text-primary border-primary/20", label: "Announcement" };
      case 'improvement': return { icon: <Info className="h-5 w-5" />, color: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Update" };
      case 'warning': return { icon: <AlertTriangle className="h-5 w-5" />, color: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Alert" };
      case 'booking': return { icon: <CheckCircle className="h-5 w-5" />, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Booking" };
      default: return { icon: <Bell className="h-5 w-5" />, color: "bg-slate-500/10 text-slate-500 border-slate-500/20", label: "System" };
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="max-w-7xl mx-auto space-y-6 py-6 px-4">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Notifications</h1>
          <p className="text-slate-500 dark:text-slate-400">
            Control platform-wide broadcasts and monitor system alerts.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Create Announcement */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="rounded-xl border-slate-200 dark:border-slate-800 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Send Announcement
                </CardTitle>
                <CardDescription>Target all registered users</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSendAnnouncement} className="space-y-4">
                  {/* Type Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category</label>
                    <div className="flex flex-wrap gap-2">
                      {['announcement', 'improvement', 'warning', 'info'].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setType(t)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize border transition-colors ${
                            type === t 
                              ? "bg-primary text-white border-primary shadow-sm" 
                              : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Subject</label>
                    <Input 
                      placeholder="e.g., Scheduled Maintenance" 
                      value={title} 
                      onChange={(e) => setTitle(e.target.value)}
                      className="rounded-lg h-10"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Message Content</label>
                    <Textarea 
                      placeholder="Write your announcement message here..." 
                      className="min-h-[120px] rounded-lg resize-none"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-10 rounded-lg gap-2" 
                    disabled={isSending}
                  >
                    {isSending ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="h-4 w-4" /> Send to All
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Quick Stats Helper - More useful for an admin */}
            <Card className="rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shadow-none border-dashed">
              <CardContent className="pt-6">
                <div className="flex gap-3">
                  <Info className="h-4 w-4 text-slate-400 shrink-0" />
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Announcements are delivered instantly to all user dashboards and stored in their persistent notification history.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Feed */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-3 items-center shadow-sm">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input 
                  placeholder="Filter notifications..." 
                  className="pl-9 h-10 rounded-lg border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <select
                  className="h-10 w-full md:w-40 pl-3 pr-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-medium appearance-none cursor-pointer"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Types</option>
                  <option value="announcement">Announcements</option>
                  <option value="improvement">Updates</option>
                  <option value="warning">Alerts</option>
                  <option value="booking">Bookings</option>
                </select>
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={loadNotifications} 
                  className="h-10 w-10 shrink-0"
                >
                  <Loader className={`h-4 w-4 text-slate-400 ${isLoading ? "animate-spin text-primary" : ""}`} />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Loader className="h-8 w-8 animate-spin text-primary mb-2" />
                  <p className="text-slate-400 text-sm">Fetching notifications...</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="py-20 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <Bell className="h-12 w-12 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No results found</h3>
                  <p className="text-slate-500 text-sm">Adjust your filters or type a search query.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {filteredNotifications.map((n) => {
                    const styles = getTypeStyles(n.type);
                    return (
                      <div 
                        key={n.id} 
                        className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm transition-all"
                      >
                        <div className="flex gap-4">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border ${styles.color}`}>
                            {styles.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-bold text-slate-900 dark:text-white truncate max-w-md">{n.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className={`px-2 py-0 text-[10px] font-bold uppercase ${styles.color} border-none`}>
                                    {styles.label}
                                  </Badge>
                                  <span className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                                    <Calendar className="h-3 w-3" />
                                    {n.created_at ? new Date(n.created_at).toLocaleDateString() : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {n.is_read ? (
                                  <span className="text-[10px] font-bold text-slate-400 px-2 py-0.5 rounded-full border border-slate-100 dark:border-slate-800">READ</span>
                                ) : (
                                  <span className="text-[10px] font-bold text-primary px-2 py-0.5 rounded-full bg-primary/10">NEW</span>
                                )}
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDelete(n.id)}
                                  className="h-7 w-7 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                              {n.message}
                            </p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 dark:border-slate-800">
                              <div className="flex items-center gap-2">
                                <span className="h-6 w-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-medium">
                                  {n.user_full_name?.charAt(0)}
                                </span>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{n.user_full_name}</span>
                                  <span className="text-[10px] text-slate-400">{n.user_email}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminNotifications;
