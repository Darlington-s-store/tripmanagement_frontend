import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { hotelsService, Hotel, HotelRoom } from "@/services/hotels";
import { toast } from "sonner";
import Layout from "@/components/layout/Layout";
import {
  ArrowLeft, Star, MapPin, Wifi, UtensilsCrossed, Dumbbell,
  ParkingCircle, Loader, Calendar, Users, CheckCircle2,
  ChevronRight, Info, ShieldCheck, Heart, Share2,
  ChevronLeft
} from "lucide-react";

const amenityIcons: { [key: string]: React.ReactNode } = {
  wifi: <Wifi className="w-5 h-5 text-emerald-500" />,
  restaurant: <UtensilsCrossed className="w-5 h-5 text-emerald-500" />,
  gym: <Dumbbell className="w-5 h-5 text-emerald-500" />,
  parking: <ParkingCircle className="w-5 h-5 text-emerald-500" />,
  "swimming pool": <span className="text-xl">🏊</span>,
  spa: <span className="text-xl">🧖</span>,
  ac: <span className="text-xl">❄️</span>,
};

export default function HotelDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [guests, setGuests] = useState("1");
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (id) {
      loadHotel();
    }
  }, [id]);

  const loadHotel = async () => {
    try {
      setIsLoading(true);
      const data = await hotelsService.getHotelById(id!);
      setHotel(data);
    } catch (error: any) {
      toast.error("Failed to load hotel details");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkInDate || !checkOutDate) {
      toast.error("Please select check-in and check-out dates");
      return;
    }

    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      toast.error("Check-out date must be after check-in date");
      return;
    }

    if (!selectedRoom && hotel?.rooms && hotel.rooms.length > 0) {
      toast.error("Please select a room type");
      const element = document.getElementById("rooms-section");
      element?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24)
    );

    const priceToUse = selectedRoom ? selectedRoom.price_per_night : hotel!.price_per_night;
    const totalPrice = priceToUse * nights * parseInt(guests);

    navigate("/checkout", {
      state: {
        type: 'hotel',
        id: hotel!.id,
        name: hotel!.name,
        roomId: selectedRoom?.id,
        roomType: selectedRoom?.room_type,
        checkInDate,
        checkOutDate,
        nights,
        guests: parseInt(guests),
        price: priceToUse,
        totalPrice,
      },
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-32 flex flex-col items-center justify-center">
          <div className="relative">
            <div className="h-16 w-16 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader className="h-6 w-6 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-muted-foreground font-medium animate-pulse">Designing your stay...</p>
        </div>
      </Layout>
    );
  }

  if (!hotel) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <div className="bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Info className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Hotel Not Found</h1>
          <p className="text-muted-foreground mb-8 text-lg">The destination you're seeking seems to have moved or doesn't exist.</p>
          <Button onClick={() => navigate("/hotels")} size="lg" className="rounded-full px-8">Return to Hotels</Button>
        </div>
      </Layout>
    );
  }

  const amenities = hotel.amenities ? hotel.amenities.split(",").map(a => a.trim()) : [];
  const displayImages = hotel.images && hotel.images.length > 0 ? hotel.images : [hotel.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"];

  return (
    <Layout>
      <div className="bg-muted/30 pb-20">
        {/* Breadcrumb & Quick Actions */}
        <div className="container py-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/hotels")}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-emerald-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Stays
            </button>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-all active:scale-95">
                <Heart className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="rounded-full shadow-sm hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* New Image Gallery Layout */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10 h-[500px]">
            <div className="md:col-span-3 h-full relative group overflow-hidden rounded-3xl shadow-xl">
              <img
                src={displayImages[activeImage]}
                alt={hotel.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-6 left-8 flex items-end gap-6 text-white pointer-events-none">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
                  <h1 className="text-4xl font-extrabold tracking-tight mb-2">{hotel.name}</h1>
                  <div className="flex items-center gap-2 text-white/90">
                    <MapPin className="h-4 w-4 text-emerald-400" />
                    <span className="font-medium">{hotel.location}, {hotel.region}</span>
                  </div>
                </div>
              </div>
              <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-all">
                <Button
                  variant="secondary" size="icon" className="rounded-full"
                  onClick={() => setActiveImage(prev => (prev === 0 ? displayImages.length - 1 : prev - 1))}
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              </div>
              <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-all">
                <Button
                  variant="secondary" size="icon" className="rounded-full"
                  onClick={() => setActiveImage(prev => (prev === displayImages.length - 1 ? 0 : prev + 1))}
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>
            <div className="hidden md:flex flex-col gap-4">
              {displayImages.slice(0, 3).map((img, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-2xl overflow-hidden cursor-pointer border-4 transition-all ${activeImage === idx ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg scale-95' : 'border-transparent hover:scale-[1.02] shadow-sm'}`}
                  onClick={() => setActiveImage(idx)}
                >
                  <img src={img} alt={`${hotel.name} ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Main Details */}
            <div className="lg:col-span-2 space-y-10">
              {/* Stats & Brief */}
              <div className="flex flex-wrap items-center gap-8 py-6 rounded-3xl bg-white p-8 shadow-sm border border-border/50">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Rating</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-yellow-400 text-white px-2 py-0.5 rounded-lg text-sm font-bold">
                      <Star className="w-4 h-4 fill-current mr-1" />
                      {Number(hotel.rating).toFixed(1)}
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">Excellent • {hotel.reviewCount || 0} reviews</span>
                  </div>
                </div>
                <div className="w-px h-10 bg-border hidden md:block" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</p>
                  <p className="font-bold flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-500" /> {hotel.location}</p>
                </div>
                <div className="w-px h-10 bg-border hidden md:block" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Starting Price</p>
                  <p className="font-bold text-emerald-600 text-xl">GH₵ {Number(hotel.price_per_night).toLocaleString()}</p>
                </div>
              </div>

              {/* Description */}
              <section className="space-y-4">
                <h3 className="text-2xl font-bold tracking-tight">Experience Luxury</h3>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  {hotel.description || "Indulge in an unforgettable stay where luxury meets comfort. Our hotel offers premium service, breathtaking views, and modern amenities designed to exceed your expectations."}
                </p>
                <div className="flex flex-wrap gap-2 pt-4">
                  {amenities.map(a => (
                    <Badge key={a} variant="secondary" className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 transition-all font-medium whitespace-nowrap">
                      {a}
                    </Badge>
                  ))}
                </div>
              </section>

              {/* Room Selection */}
              <section id="rooms-section" className="space-y-6 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">Choose Your Sanctuary</h3>
                  <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/20">Best Rates Guaranteed</Badge>
                </div>
                <div className="grid gap-4">
                  {hotel.rooms && hotel.rooms.length > 0 ? (
                    hotel.rooms.map((room) => (
                      <Card
                        key={room.id}
                        className={`transition-all duration-300 overflow-hidden group cursor-pointer border-2 ${selectedRoom?.id === room.id ? 'border-emerald-500 bg-emerald-50/10 ring-4 ring-emerald-500/5' : 'hover:border-emerald-200'}`}
                        onClick={() => setSelectedRoom(room)}
                      >
                        <div className="flex flex-col md:flex-row">
                          <div className="md:w-1/3 bg-muted relative overflow-hidden h-48 md:h-auto">
                            <img
                              src={room.images?.[0] || "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400"}
                              alt={room.room_type}
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            {room.available_count < 5 && (
                              <Badge className="absolute top-3 left-3 bg-rose-500 border-0">Only {room.available_count} left!</Badge>
                            )}
                          </div>
                          <div className="flex-1 p-6 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h4 className="text-xl font-bold mb-1">{room.room_type}</h4>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                  <Users className="h-4 w-4" /> Sleeps up to {room.capacity} adults
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-black text-emerald-600">GH₵ {room.price_per_night}</div>
                                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Per Night</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              {room.amenities ? room.amenities.split(',').map(a => (
                                <span key={a} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">{a.trim()}</span>
                              )) : (
                                <>
                                  <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">En-suite Bath</span>
                                  <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">Room Service</span>
                                  <span className="flex items-center gap-1 bg-muted px-2 py-1 rounded-md text-muted-foreground font-medium">Lake View</span>
                                </>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                className={`rounded-full px-6 transition-all ${selectedRoom?.id === room.id ? 'bg-emerald-600' : 'bg-primary'}`}
                                onClick={(e) => { e.stopPropagation(); setSelectedRoom(room); }}
                              >
                                {selectedRoom?.id === room.id ? <CheckCircle2 className="h-4 w-4 mr-2" /> : null}
                                {selectedRoom?.id === room.id ? "Selected" : "Select Room"}
                              </Button>
                              {selectedRoom?.id === room.id && <span className="text-emerald-600 text-sm font-bold flex items-center gap-1 animate-in fade-in slide-in-from-left-2"><ShieldCheck className="h-4 w-4" /> Reserve this now</span>}
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="bg-white rounded-3xl p-10 text-center border shadow-sm">
                      <Loader className="w-10 h-10 text-emerald-500 mx-auto mb-4 opacity-20" />
                      <h4 className="text-lg font-bold">Standard Room Available</h4>
                      <p className="text-muted-foreground text-sm max-w-xs mx-auto">Specific room types aren't listed, please use our standard booking.</p>
                      <Button variant="secondary" className="mt-6 rounded-full px-8" onClick={() => setSelectedRoom(null)}>Reset Selection</Button>
                    </div>
                  )}
                </div>
              </section>

              {/* Reviews Section Placeholder */}
              <section className="pt-10 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold tracking-tight">Guest Reviews</h3>
                  <Button variant="outline" className="rounded-full gap-2">Write a Review</Button>
                </div>
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                  <div className="flex flex-col md:flex-row gap-8 items-center mb-10">
                    <div className="text-center md:text-left">
                      <div className="text-5xl font-black text-emerald-600 mb-2">{Number(hotel.rating).toFixed(1)}</div>
                      <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className={`h-4 w-4 ${i <= Math.floor(Number(hotel.rating)) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}
                      </div>
                      <p className="text-sm text-muted-foreground font-medium">Based on {hotel.reviewCount || 42} verified stays</p>
                    </div>
                    <div className="flex-1 space-y-3 w-full max-w-xs md:max-w-none">
                      {[
                        { label: 'Excellent', count: 85, color: 'bg-emerald-500' },
                        { label: 'Good', count: 12, color: 'bg-teal-400' },
                        { label: 'Average', count: 3, color: 'bg-yellow-400' }
                      ].map(row => (
                        <div key={row.label} className="flex items-center gap-4">
                          <span className="text-xs font-semibold w-24 text-muted-foreground">{row.label}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${row.color}`} style={{ width: `${row.count}%` }} />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-8">{row.count}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-6 divide-y">
                    {[
                      { name: 'Kweku A.', date: 'Dec 12, 2023', rating: 5, comment: 'Absolutely stunning property. The staff went above and beyond to make our anniversary special.' },
                      { name: 'Ama M.', date: 'Oct 28, 2023', rating: 4, comment: 'Great location near the beach. The breakfast buffet was incredible with lots of local options.' }
                    ].map((rev, i) => (
                      <div key={i} className="pt-6 first:pt-0">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">{rev.name[0]}</div>
                            <div>
                              <p className="font-bold text-sm">{rev.name}</p>
                              <p className="text-xs text-muted-foreground">{rev.date}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map(k => <Star key={k} className={`h-3 w-3 ${k <= rev.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`} />)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky Sidebar Booking */}
            <div className="relative">
              <aside className="sticky top-24 space-y-6">
                <Card className="rounded-[2.5rem] shadow-2xl border-0 overflow-hidden ring-1 ring-border/50">
                  <div className="bg-emerald-600 p-8 text-white relative">
                    <div className="absolute top-0 right-0 p-4 opacity-20"><Calendar className="h-20 w-20" /></div>
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-2xl font-bold flex items-center gap-2">Book Your Sanctuary</CardTitle>
                      <CardDescription className="text-emerald-100 font-medium opacity-90">Secure the best rate for {hotel.name}</CardDescription>
                    </CardHeader>
                  </div>
                  <CardContent className="p-8 space-y-6 bg-white">
                    <form onSubmit={handleBooking} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Check-in</label>
                          <Input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            required
                            className="rounded-2xl border-muted bg-muted/20 focus-visible:ring-emerald-500 h-12"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Check-out</label>
                          <Input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            required
                            className="rounded-2xl border-muted bg-muted/20 focus-visible:ring-emerald-500 h-12"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Guests</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            max="10"
                            value={guests}
                            onChange={(e) => setGuests(e.target.value)}
                            required
                            className="rounded-2xl border-muted bg-muted/20 focus-visible:ring-emerald-500 pl-11 h-12"
                          />
                        </div>
                      </div>

                      {selectedRoom && (
                        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 animate-in zoom-in-95">
                          <div className="text-xs font-bold text-emerald-700 uppercase mb-1">Type Selected</div>
                          <div className="font-bold text-sm text-emerald-900">{selectedRoom.room_type}</div>
                          <div className="text-xs text-emerald-600 mt-1">GH₵ {selectedRoom.price_per_night} / night</div>
                        </div>
                      )}

                      {checkInDate && checkOutDate && (
                        <div className="p-6 rounded-2xl bg-muted/30 space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price × {Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))} nights</span>
                            <span className="font-bold">GH₵ {(selectedRoom?.price_per_night || hotel.price_per_night) * Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24))}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Service Fee</span>
                            <span className="font-bold">GH₵ 0.00</span>
                          </div>
                          <div className="h-px bg-border my-2" />
                          <div className="flex justify-between items-end">
                            <p className="text-sm font-bold">Estimated Total</p>
                            <div className="text-right">
                              <p className="text-2xl font-black text-emerald-600 leading-none">
                                GH₵ {(
                                  (selectedRoom?.price_per_night || hotel.price_per_night) *
                                  Math.ceil(
                                    (new Date(checkOutDate).getTime() -
                                      new Date(checkInDate).getTime()) /
                                    (1000 * 60 * 60 * 24)
                                  ) *
                                  parseInt(guests)
                                ).toLocaleString()}
                              </p>
                              <p className="text-[10px] text-muted-foreground mt-1 uppercase font-bold tracking-widest">including taxes</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <Button type="submit" size="lg" className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 h-14 text-lg font-bold shadow-emerald-200/50 shadow-xl transition-all active:scale-95 group">
                        Confirm & Pay
                        <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-widest flex items-center justify-center gap-1.5"><ShieldCheck className="h-3 w-3" /> Secure Payment Guaranteed</p>
                    </form>
                  </CardContent>
                </Card>

                {/* Help Card */}
                <Card className="rounded-[2rem] border-0 bg-white shadow-sm p-6 flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-2xl text-emerald-700">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">Need Assistance?</p>
                    <p className="text-xs text-muted-foreground">Our support team is available 24/7 at support@tripease.com</p>
                  </div>
                </Card>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

