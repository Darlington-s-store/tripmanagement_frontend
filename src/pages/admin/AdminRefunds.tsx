import { useState, useEffect } from "react";
import { Search, DollarSign, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Refund } from "@/services/admin";
import { toast } from "sonner";

const AdminRefunds = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [refunds, setRefunds] = useState<Refund[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRefunds();
    }, []);

    const loadRefunds = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getRefunds();
            const refundsData = Array.isArray(data) ? data : [];
            const mapped = refundsData.map(r => ({
                ...r,
                date: new Date(r.created_at).toLocaleDateString(),
                amount: `GH₵${r.amount}`,
            }));
            setRefunds(mapped);
        } catch (error) {
            console.error("Failed to load refunds:", error);
            toast.error("Failed to load refunds");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, newStatus: string) => {
        try {
            await adminService.updateRefund(id, { status: newStatus });
            setRefunds(refunds.map(r => r.id === id ? { ...r, status: newStatus } : r));
            toast.success(`Refund marked as ${newStatus}`);
        } catch (error) {
            console.error("Failed to update refund:", error);
            toast.error("Failed to update refund");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "completed": return <Badge variant="default" className="bg-success/10 text-success hover:bg-success/20">Completed</Badge>;
            case "pending": return <Badge variant="secondary" className="bg-warning/10 text-warning hover:bg-warning/20">Pending</Badge>;
            case "rejected": return <Badge variant="destructive" className="bg-destructive/10 text-destructive hover:bg-destructive/20">Rejected</Badge>;
            default: return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const filtered = refunds.filter(r =>
        (r.user?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.booking_id.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pendingCount = refunds.filter(r => r.status === 'pending').length;
    // We compute the total refunded by removing the "GH₵" and parsing the result.
    const totalRefunded = refunds
        .filter(r => r.status === 'completed')
        .reduce((sum, r) => sum + parseFloat(String(r.amount).replace(/[^0-9.]/g, '') || "0"), 0);

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-display text-2xl font-bold">Refund Management</h2>
                        <p className="text-muted-foreground">Process and track user refund requests.</p>
                    </div>
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search refunds..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                        />
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Total Refunded</span>
                            <DollarSign className="h-5 w-5 text-primary" />
                        </div>
                        <p className="font-display text-2xl font-bold">GH₵{totalRefunded.toLocaleString()}</p>
                    </div>
                    <div className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Pending Requests</span>
                            <Clock className="h-5 w-5 text-warning" />
                        </div>
                        <p className="font-display text-2xl font-bold">{pendingCount}</p>
                    </div>
                </div>

                <div className="rounded-xl border border-border bg-card">
                    <div className="flex items-center justify-between border-b border-border p-5">
                        <h3 className="font-display text-lg font-semibold">Recent Requests</h3>
                    </div>
                    <div className="divide-y divide-border">
                        {isLoading ? (
                            <div className="flex justify-center p-8">
                                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                            </div>
                        ) : filtered.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                No refunds found.
                            </div>
                        ) : (
                            filtered.map((refund) => (
                                <div key={refund.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between hover:bg-muted/30">
                                    <div className="grid gap-1 sm:w-1/3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{refund.user}</span>
                                            <span className="text-xs text-muted-foreground">({refund.id.substring(0, 8)})</span>
                                        </div>
                                        <span className="text-sm text-muted-foreground">Booking: {refund.booking_id.substring(0, 8)}</span>
                                        <span className="text-xs text-muted-foreground">Date: {refund.date}</span>
                                    </div>

                                    <div className="grid gap-1 sm:w-1/3">
                                        <span className="font-bold text-primary">{refund.amount}</span>
                                        <span className="text-sm text-muted-foreground">Reason: {refund.reason}</span>
                                    </div>

                                    <div className="flex items-center gap-4 sm:w-1/3 sm:justify-end">
                                        <div className="hidden sm:block">{getStatusBadge(refund.status)}</div>
                                        {refund.status === "pending" && (
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline" className="text-success hover:bg-success/10" onClick={() => handleAction(refund.id, "completed")}>
                                                    <CheckCircle className="mr-1 h-4 w-4" /> Approve
                                                </Button>
                                                <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleAction(refund.id, "rejected")}>
                                                    <XCircle className="mr-1 h-4 w-4" /> Decline
                                                </Button>
                                            </div>
                                        )}
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

export default AdminRefunds;
