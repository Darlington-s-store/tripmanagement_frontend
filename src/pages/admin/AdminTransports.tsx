import { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Bus, MapPin, Clock, DollarSign, Loader2, Plane, Train, Filter, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Transport } from "@/services/admin";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const transportTypeIcons: Record<string, React.ElementType> = {
  Bus: Bus,
  Flight: Plane,
  Train: Train,
  Shuttle: Bus,
  Private: Bus,
};

const AdminTransports = () => {
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadTransports();
  }, []);

  const loadTransports = async () => {
    try {
      setLoading(true);
      const data = await adminService.getAllTransports();
      setTransports(data);
    } catch (error) {
      console.error("Failed to load transports:", error);
      toast.error("Failed to load transport services");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await adminService.deleteTransport(id);
      setTransports(transports.filter(t => t.id !== id));
      toast.success("Transport service deleted");
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete service");
    }
  };

  const handleEdit = (transport: Transport) => {
    navigate(`/admin/transports/${transport.id}/edit`);
  };

  const handleCreate = () => {
    navigate("/admin/transports/new");
  };

  const filteredTransports = transports.filter((t) => {
    const matchesSearch = 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.from_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.to_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.operator.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = typeFilter === "all" || t.type.toLowerCase() === typeFilter.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Transport Management</h1>
            <p className="text-sm text-slate-500">Manage all intercity and local transport options</p>
          </div>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" /> Add Service
          </Button>
        </div>

        <div className="bg-white border rounded-lg shadow-sm">
          <div className="p-4 border-b flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search services, routes or operators..." 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Bus">Bus</SelectItem>
                  <SelectItem value="Flight">Flight</SelectItem>
                  <SelectItem value="Car">Car</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={loadTransports}>
                <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Schedule</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading services...
                      </div>
                    </td>
                  </tr>
                ) : filteredTransports.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                      No transport services found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransports.map((t) => {
                    const Icon = transportTypeIcons[t.type] || Bus;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-100 rounded text-slate-600">
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{t.name}</div>
                              <div className="text-xs text-slate-500 uppercase tracking-tight">{t.operator}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-slate-600">
                            {t.from_location} <span className="mx-1 text-slate-300">→</span> {t.to_location}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-xs space-y-0.5">
                            <div className="text-slate-600">Dep: {t.departure_time}</div>
                            <div className="text-slate-400">Arr: {t.arrival_time}</div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-semibold text-slate-900">₵{t.price}</div>
                        </td>
                        <td className="px-4 py-4">
                          <Badge variant={t.status === 'active' ? 'default' : 'secondary'} className="capitalize font-normal">
                            {t.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(t)} className="h-8 w-8 text-slate-400 hover:text-slate-900">
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(t.id, t.name)} className="h-8 w-8 text-slate-400 hover:text-red-600">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTransports;
