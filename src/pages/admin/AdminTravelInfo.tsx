import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Bell,
    CheckCircle,
    AlertCircle,
    Plane,
    Shield,
    FileText
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { adminService, TravelInfo } from "@/services/admin";
import TravelInfoDialog from "@/components/admin/TravelInfoDialog";

const AdminTravelInfo = () => {
    const [travelInfo, setTravelInfo] = useState<TravelInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedInfo, setSelectedInfo] = useState<TravelInfo | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllTravelInfo();
            setTravelInfo(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to load travel info:", error);
            toast.error("Failed to load travel info");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setSelectedInfo(null);
        setIsDialogOpen(true);
    };

    const handleEdit = (info: TravelInfo) => {
        setSelectedInfo(info);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this travel information?")) return;
        try {
            await adminService.deleteTravelInfo(id);
            toast.success("Travel information deleted");
            loadData();
        } catch (error) {
            toast.error("Failed to delete travel information");
        }
    };

    const filtered = travelInfo.filter(info =>
        info.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        info.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'transport': return <Plane className="h-4 w-4" />;
            case 'safety': return <Shield className="h-4 w-4" />;
            case 'visa': return <FileText className="h-4 w-4" />;
            default: return <Bell className="h-4 w-4" />;
        }
    };

    return (
        <DashboardLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Travel Information</h2>
                        <p className="text-muted-foreground">
                            Manage travel tips, safety guidelines, and essential info for travellers.
                        </p>
                    </div>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Information
                    </Button>
                </div>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search travel info..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>

                <div className="rounded-md border bg-card">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Added</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        Loading travel information...
                                    </TableCell>
                                </TableRow>
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No travel information found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((info) => (
                                    <TableRow key={info.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                                    {getCategoryIcon(info.category)}
                                                </div>
                                                <div className="font-medium">{info.title}</div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="capitalize">
                                                {info.category}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {info.is_featured ? (
                                                <Badge className="bg-success text-success-foreground">
                                                    Featured
                                                </Badge>
                                            ) : (
                                                <Badge variant="secondary">Standard</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(info.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEdit(info)}>
                                                        <Edit2 className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => handleDelete(info.id)}
                                                    >
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <TravelInfoDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                info={selectedInfo}
                onSuccess={loadData}
            />
        </DashboardLayout>
    );
};

export default AdminTravelInfo;
