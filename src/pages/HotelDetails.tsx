import { useParams, Link } from "react-router-dom";
import { MapPin, Star, Wifi, Car, Coffee, UtensilsCrossed, Waves, Calendar, Users, ArrowLeft, Phone, Mail, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/layout/Layout";
import elminaCastle from "@/assets/elmina-castle.jpg";
import kakumPark from "@/assets/kakum-park.jpg";
import molePark from "@/assets/mole-park.jpg";

const rooms = [
  { name: "Standard Room", price: 450, capacity: 2, available: true },
  { name: "Deluxe Room", price: 650, capacity: 2, available: true },
  { name: "Executive Suite", price: 950, capacity: 3, available: true },
  { name: "Presidential Suite", price: 1800, capacity: 4, available: false },
];

const reviews = [
  { user: "Kofi A.", rating: 5, comment: "Wonderful stay! Great views and excellent service.", date: "2 weeks ago" },
  { user: "Ama B.", rating: 4, comment: "Beautiful hotel with good amenities. Food could be better.", date: "1 month ago" },
  { user: "James O.", rating: 5, comment: "Best hotel experience in Ghana. Highly recommend!", date: "2 months ago" },
];

const HotelDetails = () => {
  const { id } = useParams();

  return (
    <Layout>
      <div className="container py-6">
        <Link to="/hotels" className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back to Hotels
        </Link>

        {/* Image gallery */}
        <div className="mb-8 grid gap-2 overflow-hidden rounded-2xl md:grid-cols-3">
          <div className="md:col-span-2 md:row-span-2">
            <img src={elminaCastle} alt="Hotel main" className="h-full w-full object-cover" style={{ minHeight: "300px" }} />
          </div>
          <img src={kakumPark} alt="Hotel 2" className="hidden h-full w-full object-cover md:block" style={{ minHeight: "148px" }} />
          <img src={molePark} alt="Hotel 3" className="hidden h-full w-full object-cover md:block" style={{ minHeight: "148px" }} />
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main info */}
          <div className="lg:col-span-2">
            <div className="mb-1 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary text-primary" />
              ))}
            </div>
            <h1 className="mb-2 font-display text-3xl font-bold">Labadi Beach Hotel</h1>
            <p className="mb-4 flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" /> No. 1 La Bypass, Accra, Ghana
            </p>

            <div className="mb-6 flex flex-wrap gap-2">
              {["WiFi", "Pool", "Restaurant", "Parking", "Spa", "Gym", "Bar", "Room Service"].map((a) => (
                <Badge key={a} variant="secondary">{a}</Badge>
              ))}
            </div>

            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="rooms">Rooms</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <p className="text-muted-foreground leading-relaxed">
                  Labadi Beach Hotel is Accra's premier five-star resort, situated along the beautiful Labadi Beach. The hotel offers world-class amenities including an outdoor swimming pool, spa services, multiple dining options, and direct beach access. Whether you're visiting for business or leisure, Labadi Beach Hotel provides an unforgettable Ghanaian hospitality experience.
                </p>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">+233 30 277 2501</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl border border-border p-4">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">info@labadibeachhotel.com</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="rooms" className="mt-6 space-y-4">
                {rooms.map((room) => (
                  <div key={room.name} className="flex flex-col justify-between gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center">
                    <div>
                      <h4 className="font-semibold">{room.name}</h4>
                      <p className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" /> Up to {room.capacity} guests
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xl font-bold text-primary">GH₵{room.price}</p>
                        <p className="text-xs text-muted-foreground">per night</p>
                      </div>
                      <Button disabled={!room.available} size="sm">
                        {room.available ? "Select" : "Unavailable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6 space-y-4">
                {reviews.map((r, i) => (
                  <div key={i} className="rounded-xl border border-border p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent font-semibold text-primary">
                          {r.user[0]}
                        </div>
                        <span className="font-medium">{r.user}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">{r.date}</span>
                    </div>
                    <div className="mb-2 flex gap-0.5">
                      {Array.from({ length: r.rating }).map((_, j) => (
                        <Star key={j} className="h-3 w-3 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="location" className="mt-6">
                <div className="flex h-64 items-center justify-center rounded-xl bg-muted">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="mx-auto mb-2 h-8 w-8" />
                    <p>Map integration will be displayed here</p>
                    <p className="text-sm">Google Maps API required</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-6 shadow-primary-sm">
              <div className="mb-4 text-center">
                <span className="text-3xl font-bold text-primary">GH₵450</span>
                <span className="text-muted-foreground">/night</span>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Check-in</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Check-out</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Guests</label>
                  <Input type="number" min={1} max={10} defaultValue={2} />
                </div>
              </div>

              <div className="mb-4 rounded-xl bg-secondary p-3 text-sm">
                <div className="flex justify-between"><span>GH₵450 × 3 nights</span><span className="font-medium">GH₵1,350</span></div>
                <div className="flex justify-between"><span>Service fee</span><span className="font-medium">GH₵50</span></div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
                  <span>Total</span><span className="text-primary">GH₵1,400</span>
                </div>
              </div>

              <Button className="w-full" size="lg" asChild>
                <Link to="/checkout">Book Now</Link>
              </Button>

              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="text-xs">MTN MoMo</Badge>
                <Badge variant="outline" className="text-xs">Vodafone Cash</Badge>
                <Badge variant="outline" className="text-xs">Visa/MC</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HotelDetails;
