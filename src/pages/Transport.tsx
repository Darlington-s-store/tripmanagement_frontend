import { useState, useEffect } from "react";
import { 
  MapPin, Search, Bus, Plane, ArrowRight, Loader2, 
  Clock, Shield, CreditCard, Info, Ticket, Calendar,
  Navigation, CheckCircle2, AlertCircle, Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import Layout from "@/components/layout/Layout";
import { toast } from "sonner";
import { transportService, TransportService as ITransport } from "@/services/transport";
import { cn } from "@/lib/utils";

const Transport = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fromSearch, setFromSearch] = useState("");
  const [toSearch, setToSearch] = useState("");
  const [allTransport, setAllTransport] = useState<ITransport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransport();
  }, []);

  const loadTransport = async () => {
    try {
      setIsLoading(true);
      const data = await transportService.getTransportServices();
      setAllTransport(data);
    } catch (error) {
      console.error("Failed to load transport services:", error);
      toast.error("Failed to load transport options");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBuses = allTransport.filter(r =>
    r.type === 'bus' &&
    (r.from_location.toLowerCase().includes(fromSearch.toLowerCase()) || fromSearch === "") &&
    (r.to_location.toLowerCase().includes(toSearch.toLowerCase()) || toSearch === "")
  );

  const filteredFlights = allTransport.filter(f =>
    f.type === 'flight' &&
    (f.from_location.toLowerCase().includes(fromSearch.toLowerCase()) || fromSearch === "") &&
    (f.to_location.toLowerCase().includes(toSearch.toLowerCase()) || toSearch === "")
  );

  const handleBookTransport = (item: ITransport) => {
    const isFlight = item.type === 'flight';
    const bookingData = {
      type: "transport",
      id: item.id,
      name: `${item.operator}: ${item.from_location} to ${item.to_location}`,
      date: date,
      time: item.departure_time || "N/A",
      guests: 1,
      image: item.image_url || (isFlight
        ? "https://images.unsplash.com/photo-1436491865332-7a61a109c05c?auto=format&fit=crop&q=80&w=800"
        : "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=800"),
      price: item.price,
      totalPrice: item.price
    };

    navigate("/checkout", { state: bookingData });
  };

  return (
    <Layout>
      {/* ── HERO SECTION ── */}
      <section className="relative min-h-[50vh] flex items-center justify-center overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000" 
            alt="Transport in Ghana"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gray-950/70 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 text-center">
          <Badge className="mb-6 bg-primary/20 text-primary border-primary/30 px-4 py-1.5 text-sm font-black uppercase tracking-[0.2em] backdrop-blur-md animate-fade-in">
            Seamless Connections
          </Badge>
          <h1 className="mb-6 font-display text-5xl font-black text-white md:text-7xl leading-tight tracking-tight animate-slide-up">
            Travel Ghana with <br />
            <span className="text-primary italic">Absolute Confidence.</span>
          </h1>
          <p className="max-w-2xl mx-auto mb-12 text-lg text-gray-300 font-medium leading-relaxed animate-slide-up animation-delay-200">
            From luxury intercity coaches to quick domestic flights. 
            Skip the queues and book your seat in seconds.
          </p>

          {/* New floating search box */}
          <div className="max-w-5xl mx-auto bg-white p-2 sm:p-3 rounded-[2.5rem] shadow-2xl border border-white/10 backdrop-blur-xl animate-slide-up animation-delay-400">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-[1.75rem] border border-gray-100 group focus-within:ring-2 ring-primary/20 transition-all">
                <Navigation className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Departure</span>
                  <input
                    placeholder="Where from?"
                    className="w-full bg-transparent border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 font-bold"
                    value={fromSearch}
                    onChange={(e) => setFromSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-[1.75rem] border border-gray-100 group focus-within:ring-2 ring-primary/20 transition-all">
                <MapPin className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Destination</span>
                  <input
                    placeholder="Where to?"
                    className="w-full bg-transparent border-0 p-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 font-bold"
                    value={toSearch}
                    onChange={(e) => setToSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 px-6 py-4 bg-gray-50 rounded-[1.75rem] border border-gray-100 group focus-within:ring-2 ring-primary/20 transition-all">
                <Calendar className="h-5 w-5 text-primary" />
                <div className="flex flex-col items-start w-full">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Travel Date</span>
                  <input
                    type="date"
                    className="w-full bg-transparent border-0 p-0 text-gray-900 focus:ring-0 font-bold"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>

              <Button size="lg" className="h-auto rounded-[1.75rem] bg-primary font-black text-white px-8 gap-3 shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <Search className="h-5 w-5" /> CHECK AVAILABILITY
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── RESULTS SECTION ── */}
      <section className="-mt-16 pb-24 relative z-20">
        <div className="container">
          <Tabs defaultValue="buses" className="w-full">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
              <TabsList className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl border border-gray-100 shadow-xl h-auto">
                <TabsTrigger 
                  value="buses" 
                  className="rounded-xl px-8 py-3.5 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all"
                >
                  <Bus className="h-4 w-4" /> Intercity Coaches
                </TabsTrigger>
                <TabsTrigger 
                  value="flights" 
                  className="rounded-xl px-8 py-3.5 gap-3 data-[state=active]:bg-primary data-[state=active]:text-white font-black uppercase text-xs tracking-widest transition-all"
                >
                  <Plane className="h-4 w-4" /> Domestic Flights
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  Real-time updates
                </div>
                <div className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                  <Shield className="h-4 w-4 text-primary" />
                  Verified Operators
                </div>
              </div>
            </div>

            <TabsContent value="buses" className="mt-0 focus-visible:ring-0">
              <div className="grid gap-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                    <p className="font-black text-gray-400 uppercase tracking-widest">Scanning schedules...</p>
                  </div>
                ) : filteredBuses.length > 0 ? (
                  filteredBuses.map((r) => (
                    <TransportCard key={r.id} item={r} onBook={handleBookTransport} />
                  ))
                ) : (
                  <EmptyState type="bus" />
                )}
              </div>
            </TabsContent>

            <TabsContent value="flights" className="mt-0 focus-visible:ring-0">
               <div className="grid gap-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-32 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                    <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
                    <p className="font-black text-gray-400 uppercase tracking-widest">Finding active flight paths...</p>
                  </div>
                ) : filteredFlights.length > 0 ? (
                  filteredFlights.map((f) => (
                    <TransportCard key={f.id} item={f} onBook={handleBookTransport} />
                  ))
                ) : (
                  <EmptyState type="flight" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── INFO SECTION ── */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col gap-4 p-8 bg-white rounded-[2rem] shadow-sm border border-white">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <Clock className="h-7 w-7" />
              </div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Arrive Early</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                For STC and VIP coaches, we recommend arriving at the terminal 45 minutes before departure to manifest and secure luggage.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-white rounded-[2rem] shadow-sm border border-white">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <CreditCard className="h-7 w-7" />
              </div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Digital Boarding</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                No need for printers. Show your digital voucher code at the boarding gate. Our partners use TripEase-enabled QR scanners.
              </p>
            </div>

            <div className="flex flex-col gap-4 p-8 bg-white rounded-[2rem] shadow-sm border border-white">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h3 className="font-black text-xl text-gray-900 tracking-tight">Luggage Policy</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Standard bus tickets include 1 suitcase up to 20kg. Additional luggage may attract a small fee payable at the terminal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

const TransportCard = ({ item, onBook }: { item: ITransport, onBook: (item: ITransport) => void }) => {
  const isFlight = item.type === "flight";
  
  return (
    <Card className="overflow-hidden border-2 border-gray-50 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 rounded-[2.5rem] group bg-white">
      <CardContent className="p-0">
        <div className="flex flex-col lg:flex-row">
          {/* Logo & Operator Side */}
          <div className={cn(
            "lg:w-64 p-8 flex flex-col items-center justify-center border-b lg:border-b-0 lg:border-r border-gray-50",
            isFlight ? "bg-blue-50/10" : "bg-green-50/10"
          )}>
            <div className="mb-4 h-16 w-16 rounded-2xl bg-white shadow-xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform duration-500">
               {isFlight ? <Plane className="h-8 w-8 text-blue-600" /> : <Bus className="h-8 w-8 text-green-600" />}
            </div>
            <h4 className="font-black text-gray-900 text-lg text-center leading-tight mb-2 uppercase tracking-tighter">{item.operator}</h4>
            <Badge variant="outline" className="rounded-full bg-white font-bold text-[10px] uppercase tracking-[0.15em] border-gray-100 px-3">
              {item.type}
            </Badge>
          </div>

          {/* Route & Timing Side */}
          <div className="flex-1 p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 h-full">
              <div className="flex flex-1 items-center justify-between w-full max-w-xl">
                <div className="text-center md:text-left">
                  <p className="text-2xl font-black text-gray-900 mb-1">{item.departure_time}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.from_location}</p>
                </div>

                <div className="flex flex-col items-center px-4 flex-1">
                   <div className="flex items-center gap-1 w-full text-gray-200">
                      <div className="h-[2px] flex-1 bg-gray-100 rounded-full" />
                      {isFlight ? <Plane className="h-5 w-5 text-primary rotate-90" /> : <Bus className="h-5 w-5 text-primary" />}
                      <div className="h-[2px] flex-1 bg-gray-100 rounded-full" />
                   </div>
                   <span className="mt-2 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Direct</span>
                </div>

                <div className="text-center md:text-right">
                  <p className="text-2xl font-black text-gray-900 mb-1">{item.arrival_time}</p>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.to_location}</p>
                </div>
              </div>

              {/* Pricing & CTA */}
              <div className="w-full md:w-auto flex flex-row md:flex-col items-center justify-between md:justify-center md:items-end gap-4 md:pl-12 md:border-l border-gray-100">
                <div className="flex flex-col md:items-end">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Per Person</span>
                   <div className="flex items-baseline gap-1">
                     <span className="text-sm font-black text-gray-400">GH₵</span>
                     <span className="text-3xl font-black text-gray-900 tracking-tighter">{item.price}</span>
                   </div>
                   <div className="mt-1 flex items-center gap-1.5 text-[10px] font-bold text-green-600 uppercase">
                      <Sparkles className="h-3 w-3" /> 
                      {item.capacity} seats left
                   </div>
                </div>
                
                <Button 
                  onClick={() => onBook(item)}
                  className="h-14 px-10 rounded-2xl bg-gray-900 hover:bg-primary text-white font-black tracking-widest transition-all group-hover:shadow-xl group-hover:shadow-primary/20"
                >
                  SECURE SEAT <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-2 transition-transform" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EmptyState = ({ type }: { type: string }) => (
  <div className="flex flex-col items-center justify-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-gray-200 text-center px-6">
    <div className="h-20 w-20 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-200 mb-6">
      <AlertCircle className="h-10 w-10" />
    </div>
    <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">No {type === 'flight' ? 'flights' : 'coaches'} found</h3>
    <p className="text-gray-400 font-medium max-w-sm mx-auto">
      Try adjusting your search criteria or checking another date. 
      Popular routes sell out fast!
    </p>
    <Button 
      variant="outline" 
      className="mt-8 rounded-xl font-bold px-8 border-gray-200"
      onClick={() => window.location.reload()}
    >
      CLEAR FILTERS
    </Button>
  </div>
);

export default Transport;
