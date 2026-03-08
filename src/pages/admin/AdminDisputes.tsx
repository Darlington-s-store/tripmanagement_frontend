import { useState, useEffect } from "react";
import { Search, AlertTriangle, MessageSquare, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Dispute } from "@/services/admin";
import { toast } from "sonner";

interface ExtendedDispute extends Dispute {
    user: string;
    provider: string;
    type: string;
    date: string;
    priority: string;
}

const AdminDisputes = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [disputes, setDisputes] = useState<ExtendedDispute[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadDisputes();
    }, []);

    const loadDisputes = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getDisputes();
            const disputesData = Array.isArray(data) ? data : [];
            // Map visually required fields
            const mapped = disputesData.map(d => ({
                ...d,
                user: "User", // Mock fallback
                provider: "Provider", // Mock fallback
                type: d.description.substring(0, 30) + '...', // We use description as type title if missing
                date: new Date(d.created_at).toLocaleDateString(),
                priority: d.status === 'open' ? 'high' : 'medium'
            }));
            setDisputes(mapped);
        } catch (error) {
            console.error("Failed to load disputes:", error);
            toast.error("Failed to load disputes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResolve = async (id: string) => {
        try {
            await adminService.updateDispute(id, { status: "resolved", adminNotes: "Resolved by Admin via dashboard" });
            setDisputes(disputes.map(d => d.id === id ? { ...d, status: "resolved", priority: "low" } : d));
            toast.success("Dispute marked as resolved");
        } catch (error) {
            console.error("Failed to resolve dispute:", error);
            toast.error("Failed to resolve dispute");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "resolved": return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">Resolved</Badge>;
            case "open": return <Badge variant="secondary" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Open</Badge>;
            case "investigating": return <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20">Investigating</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case "critical": return <Badge variant="destructive">Critical</Badge>;
            case "high": return <Badge className="bg-orange-500 text-white">High</Badge>;
            case "medium": return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Medium</Badge>;
            case "low": return <Badge variant="outline">Low</Badge>;
            default: return <Badge variant="outline">{priority}</Badge>;
        }
    };

    const filtered = disputes.filter(d =>
        (d.description?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.booking_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const activeCount = disputes.filter(d => d.status === 'open' || d.status === 'investigating').length;
    const resolvedCount = disputes.filter(d => d.status === 'resolved').length;

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-bold">Dispute Resolution</h2>
                        <p className="text-muted-foreground">Manage and resolve conflicts between users and providers.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search disputes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Active Disputes</span>
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <p className="font-display text-2xl font-bold">{activeCount}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Resolved (30d)</span>
                            <CheckCircle className="h-5 w-5 text-success" />
                        </div>
                        <p className="font-display text-2xl font-bold">{resolvedCount}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <h3 className="font-display text-lg font-semibold">Current Cases</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No disputes found.
                            </div>
                        ) : (
                            filtered.map((dispute) => (
                                <div key={dispute.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30">
                                    <div className="grid gap-1 sm:w-1/3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-primary">{dispute.id.substring(0, 8)}</span>
                                            {getPriorityBadge((dispute as any).priority)}
                                        </div>
                                        <span className="text-sm text-muted-foreground">Booking: {dispute.booking_id.substring(0, 8)}</span>
                                        <div className="mt-1 text-sm text-foreground overflow-hidden text-ellipsis whitespace-nowrap" title={dispute.description}>
                                            "{dispute.description}"
                                        </div>
                                    </div>

                                    <div className="grid gap-1 sm:w-1/3">
                                        <span className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">User:</strong> {dispute.user}
                                        </span>
                                        <span className="text-sm text-muted-foreground">
                                            <strong className="text-foreground">Provider:</strong> {dispute.provider}
                                        </span>
                                        <span className="text-xs text-muted-foreground">Date: {dispute.date}</span>
                                    </div>

                                    <div className="flex items-center gap-4 sm:w-1/3 sm:justify-end">
                                        <div className="hidden sm:block">{getStatusBadge(dispute.status)}</div>
                                        {dispute.status !== 'resolved' && (
                                            <Button size="sm" variant="outline" className="gap-2" onClick={() => handleResolve(dispute.id)}>
                                                <CheckCircle className="h-4 w-4 text-success" /> Resolve
                                            </Button>
                                        )}
                                        <Button size="sm" variant="ghost" className="gap-2">
                                            <MessageSquare className="h-4 w-4" /> Notes
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AdminDisputes;
