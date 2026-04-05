import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, Menu, X, Home, Calendar, BookOpen, User, Settings, LogOut, Star, Building, Users, BarChart3, Shield, CheckCircle, MessageSquare, Search, Landmark, LayoutGrid, FileText, Hotel, Plane, Info, RefreshCcw, Gavel, ClipboardCheck, Bus, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import NotificationBell from "@/components/notifications/NotificationBell";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "user" | "provider" | "admin";
}

const sidebarLinks = {
  user: [
    { label: "Dashboard", href: "/dashboard", icon: Home },
    { label: "Trips", href: "/dashboard/trips", icon: BookOpen },
    { label: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
    { label: "Reviews", href: "/dashboard/reviews", icon: Star },
    { label: "Profile", href: "/dashboard/profile", icon: User },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
  ],
  provider: [
    { label: "Dashboard", href: "/provider/dashboard", icon: Home },
    { label: "My Listings", href: "/provider/listings", icon: Building },
    { label: "Bookings", href: "/provider/bookings", icon: Calendar },
    { label: "Reviews", href: "/provider/reviews", icon: Star },
    { label: "Profile", href: "/provider/profile", icon: User },
  ],
  admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutGrid },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Transports", href: "/admin/transports", icon: Bus },
    { label: "Destinations", href: "/admin/destinations", icon: MapPin },
    { label: "Hotels", href: "/admin/hotels", icon: Hotel },
    { label: "Attractions", href: "/admin/attractions", icon: Landmark },
    { label: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { label: "Itineraries", href: "/admin/itineraries", icon: FileText },
    { label: "Categories", href: "/admin/categories", icon: LayoutGrid },
    { label: "Bookings", href: "/admin/bookings", icon: Calendar },
    { label: "Approvals", href: "/admin/approvals", icon: ClipboardCheck },
    { label: "Notifications", href: "/admin/notifications", icon: Bell },
    { label: "Reports", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

const DashboardLayout = ({ children, role }: DashboardLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const links = sidebarLinks[role];

  const currentLink =
    [...links]
      .sort((left, right) => right.href.length - left.href.length)
      .find((link) => location.pathname === link.href || location.pathname.startsWith(`${link.href}/`));
  const currentPage = currentLink?.label || "Dashboard";

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Fixed Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <MapPin className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-bold">
              Trip<span className="text-primary">Ease</span>
            </span>
          </Link>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {links.map((link, idx) => {
            const Icon = link.icon;
            const isActive = currentLink?.href === link.href;
            return (
              <Link
                key={`${link.href}-${idx}`}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent"
          >
            <LogOut className="h-4 w-4" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content area with left margin for sidebar */}
      <div className="md:ml-64">
        {/* Fixed Topbar */}
        <header className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-lg md:left-64 md:px-6">
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display text-lg font-semibold">{currentPage}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 sm:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search..." className="h-8 w-40 border-0 bg-transparent shadow-none focus-visible:ring-0" />
            </div>
            <NotificationBell />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-medium text-primary-foreground text-sm">
                  {role === "admin" ? "A" : role === "provider" ? "P" : "U"}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild><Link to="/dashboard/profile">Profile</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/dashboard/settings">Settings</Link></DropdownMenuItem>
                <DropdownMenuItem asChild><Link to="/">Sign Out</Link></DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content with top padding for fixed header */}
        <div className="p-4 pt-20 md:p-6 md:pt-24">{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
