import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, GripVertical, Trash2, Calendar, MapPin, Hotel, Truck, Download, Share2, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";

interface ItineraryItem {
  id: string;
  day: number;
  type: "hotel" | "attraction" | "transport";
  name: string;
  cost: number;
  time: string;
}

const initialItems: ItineraryItem[] = [
  { id: "1", day: 1, type: "hotel", name: "Labadi Beach Hotel, Accra", cost: 450, time: "3:00 PM" },
  { id: "2", day: 1, type: "attraction", name: "Kwame Nkrumah Memorial", cost: 20, time: "10:00 AM" },
  { id: "3", day: 2, type: "transport", name: "Bus: Accra → Cape Coast", cost: 80, time: "7:00 AM" },
  { id: "4", day: 2, type: "attraction", name: "Cape Coast Castle", cost: 40, time: "11:00 AM" },
  { id: "5", day: 2, type: "attraction", name: "Kakum National Park", cost: 60, time: "2:00 PM" },
  { id: "6", day: 3, type: "hotel", name: "Coconut Grove Beach Resort", cost: 280, time: "Check-in" },
];

const typeColors = {
  hotel: "bg-info/10 text-info",
  attraction: "bg-success/10 text-success",
  transport: "bg-warning/10 text-warning",
};

const typeIcons = { hotel: Hotel, attraction: MapPin, transport: Truck };

const ItineraryPlanner = () => {
  const [items, setItems] = useState(initialItems);
  const [tripName, setTripName] = useState("My Ghana Adventure");

  const days = [...new Set(items.map((i) => i.day))].sort();
  const totalCost = items.reduce((sum, i) => sum + i.cost, 0);

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id));

  return (
    <Layout>
      <section className="bg-gradient-primary py-12">
        <div className="container">
          <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Trip Itinerary Planner
          </h1>
          <p className="text-primary-foreground/80">
            Plan your perfect Ghana trip day by day
          </p>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Input
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              className="max-w-sm text-lg font-display font-semibold"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1"><Share2 className="h-4 w-4" /> Share</Button>
              <Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Export PDF</Button>
              <Button size="sm" className="gap-1"><Plus className="h-4 w-4" /> Add Item</Button>
            </div>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              {days.map((day) => (
                <div key={day}>
                  <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-semibold">
                    <Calendar className="h-5 w-5 text-primary" />
                    Day {day}
                  </h3>
                  <div className="space-y-2">
                    {items
                      .filter((i) => i.day === day)
                      .map((item) => {
                        const Icon = typeIcons[item.type];
                        return (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm"
                          >
                            <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground" />
                            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${typeColors[item.type]}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.time}</p>
                            </div>
                            <span className="font-semibold text-primary">GH₵{item.cost}</span>
                            <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            {/* Cost summary */}
            <div>
              <div className="sticky top-20 rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 font-display text-lg font-semibold">Cost Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accommodation</span>
                    <span className="font-medium">GH₵{items.filter(i => i.type === "hotel").reduce((s, i) => s + i.cost, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Attractions</span>
                    <span className="font-medium">GH₵{items.filter(i => i.type === "attraction").reduce((s, i) => s + i.cost, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transport</span>
                    <span className="font-medium">GH₵{items.filter(i => i.type === "transport").reduce((s, i) => s + i.cost, 0)}</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
                    <span>Total</span>
                    <span className="text-primary">GH₵{totalCost}</span>
                  </div>
                </div>
                <Button className="mt-6 w-full" size="lg" asChild>
                  <Link to="/checkout"><DollarSign className="mr-1 h-4 w-4" /> Proceed to Payment</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default ItineraryPlanner;
