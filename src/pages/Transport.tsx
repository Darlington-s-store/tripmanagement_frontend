import { useState } from "react";
import { MapPin, Clock, Search, Bus, Plane, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";

const busRoutes = [
  { id: "b1111111-1111-1111-1111-111111111111", operator: "VIP Jeoun", from: "Accra", to: "Kumasi", departure: "6:00 AM", arrival: "11:00 AM", price: 120, seats: 12, type: "VIP" },
  { id: "b2222222-2222-2222-2222-222222222222", operator: "STC", from: "Accra", to: "Cape Coast", departure: "7:30 AM", arrival: "10:00 AM", price: 80, seats: 20, type: "Standard" },
  { id: "b3333333-3333-3333-3333-333333333333", operator: "OA Travel", from: "Accra", to: "Tamale", departure: "5:00 PM", arrival: "5:00 AM", price: 200, seats: 8, type: "VIP" },
  { id: "b4444444-4444-4444-4444-444444444444", operator: "Metro Mass", from: "Kumasi", to: "Takoradi", departure: "8:00 AM", arrival: "1:00 PM", price: 90, seats: 30, type: "Standard" },
];

const flights = [
  { id: "f1111111-1111-1111-1111-111111111111", airline: "Africa World Airlines", from: "Accra", to: "Tamale", departure: "8:00 AM", arrival: "9:15 AM", price: 650, seats: 5 },
  { id: "f2222222-2222-2222-2222-222222222222", airline: "PassionAir", from: "Accra", to: "Kumasi", departure: "10:30 AM", arrival: "11:20 AM", price: 500, seats: 12 },
  { id: "f3333333-3333-3333-3333-333333333333", airline: "Africa World Airlines", from: "Accra", to: "Takoradi", departure: "2:00 PM", arrival: "2:50 PM", price: 550, seats: 8 },
];

const Transport = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");

  const filteredBuses = busRoutes.filter(r =>
    r.from.toLowerCase().includes(fromSearch.toLowerCase()) &&
    r.to.toLowerCase().includes(toSearch.toLowerCase())
  );

  const filteredFlights = flights.filter(f =>
    f.from.toLowerCase().includes(fromSearch.toLowerCase()) &&
    f.to.toLowerCase().includes(toSearch.toLowerCase())
  );

  const handleBookTransport = (item: any, isFlight: boolean) => {
    const bookingData = {
      type: "transport",
      id: item.id,
      name: isFlight ? `${item.airline}: ${item.from} to ${item.to}` : `${item.operator}: ${item.from} to ${item.to}`,
      date: date,
      time: item.departure,
      guests: 1,
      image: isFlight
        ? "https://images.unsplash.com/photo-1436491865332-7a61a109c05c?auto=format&fit=crop&q=80&w=800"
        : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800",
      price: item.price,
      totalPrice: item.price
    };

    navigate("/checkout", { state: bookingData });
  };

  return (
    <Layout>
      <section className="bg-gradient-primary py-16">
        <div className="container">
          <h1 className="mb-2 font-display text-3xl font-bold text-primary-foreground md:text-4xl">
            Transport & Flights
          </h1>
          <p className="mb-8 text-primary-foreground/80">
            Book buses and domestic flights for seamless travel across Ghana
          </p>
          <div className="flex flex-col gap-2 rounded-2xl bg-background p-3 shadow-primary-lg sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3">
              <MapPin className="h-4 w-4 text-primary" />
              <Input
                placeholder="From"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                value={fromSearch}
                onChange={(e) => setFromSearch(e.target.value)}
              />
            </div>
            <div className="flex flex-1 items-center gap-2 rounded-xl bg-muted px-3">
              <MapPin className="h-4 w-4 text-primary" />
              <Input
                placeholder="To"
                className="border-0 bg-transparent shadow-none focus-visible:ring-0"
                value={toSearch}
                onChange={(e) => setToSearch(e.target.value)}
              />
            </div>
            <Input
              type="date"
              className="flex-1 rounded-xl"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <Button size="lg" className="gap-2 rounded-xl">
              <Search className="h-4 w-4" /> Search
            </Button>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container">
          <Tabs defaultValue="buses">
            <TabsList className="mb-6">
              <TabsTrigger value="buses" className="gap-2"><Bus className="h-4 w-4" /> Buses</TabsTrigger>
              <TabsTrigger value="flights" className="gap-2"><Plane className="h-4 w-4" /> Flights</TabsTrigger>
            </TabsList>

            <TabsContent value="buses" className="space-y-4">
              {filteredBuses.length > 0 ? (
                filteredBuses.map((r) => (
                  <div key={r.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <Badge variant="secondary">{r.type}</Badge>
                        <span className="font-semibold">{r.operator}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{r.from}</span>
                        <ArrowRight className="h-3 w-3" />
                        <span>{r.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{r.departure}</p>
                        <p className="text-xs text-muted-foreground">Depart</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{r.arrival}</p>
                        <p className="text-xs text-muted-foreground">Arrive</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{r.seats} seats left</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">GH₵{r.price}</p>
                      </div>
                      <Button size="sm" onClick={() => handleBookTransport(r, false)}>Book</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">No bus routes found for these locations</div>
              )}
            </TabsContent>

            <TabsContent value="flights" className="space-y-4">
              {filteredFlights.length > 0 ? (
                filteredFlights.map((f) => (
                  <div key={f.id} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <p className="mb-1 font-semibold">{f.airline}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{f.from}</span>
                        <Plane className="h-3 w-3" />
                        <span>{f.to}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm font-medium">{f.departure}</p>
                        <p className="text-xs text-muted-foreground">Depart</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-medium">{f.arrival}</p>
                        <p className="text-xs text-muted-foreground">Arrive</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">{f.seats} seats left</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">GH₵{f.price}</p>
                      </div>
                      <Button size="sm" onClick={() => handleBookTransport(f, true)}>Book</Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-muted-foreground">No flights found for these locations</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Transport;
