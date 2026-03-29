import { Link } from "react-router-dom";
import {
  Search, MapPin, Hotel, Users, Truck, Star, ArrowRight,
  Shield, CreditCard, Clock, Map, Compass, Camera,
  Zap, Heart, Award, CheckCircle2, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-ghana.jpg";
import kakumPark from "@/assets/kakum-park.jpg";
import elminaCastle from "@/assets/elmina-castle.jpg";
import molePark from "@/assets/mole-park.jpg";

const destinations = [
  { name: "Cape Coast", region: "Central", image: elminaCastle, attractions: 24, price: 150 },
  { name: "Kakum National Park", region: "Central", image: kakumPark, attractions: 8, price: 80 },
  { name: "Mole National Park", region: "Northern", image: molePark, attractions: 12, price: 200 },
];

const features = [
  { icon: Hotel, title: "Curated Hotels", description: "From luxury coastal resorts in Western region to boutique stays in Accra." },
  { icon: Users, title: "Local Experts", description: "Verified local guides who share the untold stories of Ghanaian heritage." },
  { icon: Truck, title: "Seamless Transport", description: "Ready-to-go private rentals, VIP buses, and domestic flight bookings." },
  { icon: MapPin, title: "Iconic Sites", description: "Discover the historic castles, majestic waterfalls, and vibrant festivals." },
];

const stats = [
  { value: "500+", label: "Hotels Listed" },
  { value: "200+", label: "Tour Guides" },
  { value: "150+", label: "Attractions" },
  { value: "50K+", label: "Happy Travellers" },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero Section with Parallax-like feel */}
      <section className="relative flex min-h-[90vh] items-center overflow-hidden bg-slate-900">
        <div className="absolute inset-0 z-0">
          <img
            src={heroImage}
            alt="Ghana coastal landscape"
            className="h-full w-full object-cover opacity-60 scale-105 animate-slow-zoom"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 py-20">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/30 px-4 py-1.5 text-sm font-semibold text-primary backdrop-blur-md animate-fade-in-down">
              <Compass className="h-4 w-4 animate-spin-slow" /> 🇬🇭 Experience the Gold Coast
            </div>

            <h1 className="font-display text-5xl font-extrabold leading-[1.1] text-white md:text-7xl lg:text-8xl tracking-tight animate-fade-in">
              Trip <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">Management.</span>
            </h1>

            <p className="max-w-xl text-lg md:text-xl text-slate-300 animate-fade-in opacity-90 leading-relaxed">
              Your all-in-one travel planning and management companion. Discover destinations, plan custom itineraries, and manage every detail of your journey.
            </p>

            {/* Premium Glassmorphic Search */}
            <div className="flex flex-col gap-3 rounded-3xl bg-white/10 p-3 shadow-2xl backdrop-blur-xl border border-white/20 sm:flex-row group transition-all hover:bg-white/15 animate-fade-in-up">
              <div className="flex flex-[1.5] items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 border border-white/10 focus-within:bg-white/20 transition-all">
                <MapPin className="h-5 w-5 text-primary" />
                <Input
                  placeholder="Where in Ghana?"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-white placeholder:text-white/50 text-base"
                />
              </div>
              <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 border border-white/10 focus-within:bg-white/20 transition-all">
                <Calendar className="h-5 w-5 text-primary" />
                <Input
                  type="date"
                  className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-white placeholder:text-white/50 [color-scheme:dark]"
                />
              </div>
              <Button size="lg" className="gap-2 rounded-2xl h-14 px-8 bg-primary hover:scale-105 transition-transform" asChild>
                <Link to="/hotels">
                  <Search className="h-5 w-5" /> Explore
                </Link>
              </Button>
            </div>

            {/* Trusted Payment partners - more subtle */}
            <div className="flex flex-wrap items-center gap-6 pt-4 opacity-60 animate-fade-in">
              <span className="text-xs font-bold uppercase tracking-widest text-white/50">Trusted Partners</span>
              <div className="flex gap-4">
                <Badge variant="outline" className="text-white border-white/20 bg-white/5">MTN MoMo</Badge>
                <Badge variant="outline" className="text-white border-white/20 bg-white/5">Telecel Cash</Badge>
                <Badge variant="outline" className="text-white border-white/20 bg-white/5">Visa/Mastercard</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Stats Section */}
      <section className="relative z-20 -mt-10 mb-20 container">
        <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-slate-200 border border-slate-200 shadow-xl md:grid-cols-4 dark:bg-slate-800">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white p-8 text-center transition-colors hover:bg-slate-50 dark:bg-slate-900">
              <p className="font-display text-4xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Trip Management - Modern Features Grid */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container">
          <div className="mb-16 text-center max-w-3xl mx-auto space-y-4">
            <h2 className="font-display text-base font-bold uppercase tracking-widest text-primary">The Future of Travel</h2>
            <h3 className="text-4xl font-bold tracking-tight md:text-5xl">Your Complete <span className="italic text-primary">Trip Management</span> Toolkit</h3>
            <p className="text-lg text-slate-500">We've built everything you need to navigate your journeys safely, affordably, and authentically.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="group relative rounded-3xl border border-slate-100 p-8 shadow-sm transition-all hover:-translate-y-2 hover:shadow-xl dark:border-slate-800">
                  <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-7 w-7" />
                  </div>
                  <h4 className="mb-3 text-xl font-bold">{feature.title}</h4>
                  <p className="text-slate-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Destinations - Visual Masterpiece */}
      <section className="py-24 bg-slate-50 dark:bg-slate-900/50">
        <div className="container">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-16">
            <div className="max-w-2xl space-y-4">
              <h2 className="font-display text-4xl font-bold tracking-tight md:text-5xl">Iconic Destinations</h2>
              <p className="text-lg text-slate-500">Discover the places that make Ghana the most welcoming country in Africa.</p>
            </div>
            <Button variant="link" className="text-primary font-bold gap-2 text-lg p-0" asChild>
              <Link to="/destinations">View All Destinations <ArrowRight className="h-5 w-5" /></Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {destinations.map((dest, idx) => (
              <Link key={idx} to="/destinations" className="group relative h-[500px] overflow-hidden rounded-[2.5rem] shadow-lg transition-all hover:shadow-2xl">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-8 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <Badge className="mb-3 bg-white/20 backdrop-blur-md text-white border-white/30">{dest.region} Region</Badge>
                  <h4 className="text-3xl font-bold text-white mb-2">{dest.name}</h4>
                  <div className="flex items-center justify-between text-white/80">
                    <span className="flex items-center gap-1.5 text-sm font-medium"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> 4.9 (2.1k reviews)</span>
                    <span className="font-bold text-xl text-primary">GH₵ {dest.price} <span className="text-xs font-normal opacity-70">/ Day</span></span>
                  </div>
                  <div className="mt-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="sm" className="bg-white text-slate-900 hover:bg-slate-100 rounded-xl">View Details</Button>
                    <Button size="sm" variant="outline" className="border-white/20 text-white bg-white/5 backdrop-blur-sm rounded-xl">Plan Trip</Button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* "How it Works" section for UX clarity */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="container">
          <div className="grid md:grid-cols-2 items-center gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Your Journey, <br /><span className="text-primary italic">Perfectly Managed.</span></h2>
                <p className="text-lg text-slate-500">Trip Management simplifies the complex logistics of cross-region travel, so you can focus on making memories.</p>
              </div>

              <div className="space-y-6">
                {[
                  { title: "Smart Planning", text: "Use our AI-assisted planner to build multi-day itineraries in seconds.", icon: Zap },
                  { title: "Secure Bookings", text: "Every listing is verified. Payments are held in escrow for your safety.", icon: Shield },
                  { title: "Local Insights", text: "Access hidden gems and cultural tips shared by our community of guides.", icon: Heart }
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="mt-1 h-10 w-10 shrink-0 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{item.title}</h4>
                      <p className="text-sm text-slate-500 leading-relaxed">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Button size="lg" className="rounded-2xl px-10 h-14 font-bold text-lg shadow-primary-lg" asChild>
                <Link to="/register">Create Your Account</Link>
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl skew-x-1 -rotate-2 group transition-transform hover:rotate-0">
                <img src={kakumPark} alt="Kakum Walkway" className="h-full w-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 max-w-[240px] animate-bounce-slow">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <span className="font-bold text-sm">Verified Guide</span>
                </div>
                <p className="text-xs text-slate-500">"Kofi knows every corner of Kakum. Highly recommended for bird watchers!"</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action with vibrant gradient */}
      <section className="container py-24">
        <div className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-600 via-primary to-slate-900 p-12 md:p-24 text-center text-white shadow-2xl">
          <div className="absolute top-0 right-0 p-20 opacity-10 blur-3xl bg-white rounded-full translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 p-20 opacity-10 blur-3xl bg-emerald-400 rounded-full -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-4xl font-extrabold md:text-6xl tracking-tight leading-tight">Ready to start your <br />trip management?</h2>
            <p className="text-xl text-white/80">Join 50,000+ travellers who have discovered the power of seamless trip management.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-slate-100 rounded-2xl h-16 px-10 font-bold text-xl shadow-xl w-full sm:w-auto" asChild>
                <Link to="/register">Join the Community</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white/30 bg-white/10 hover:bg-white/20 text-white rounded-2xl h-16 px-10 font-bold text-xl backdrop-blur-sm w-full sm:w-auto" asChild>
                <Link to="/trips/new">Plan Your Trip</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
