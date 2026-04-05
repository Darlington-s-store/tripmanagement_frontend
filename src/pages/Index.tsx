import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Star, ArrowRight, Phone,
  Shield, Clock, ChevronRight, CheckCircle,
  Hotel, Users, Truck, Compass, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-ghana.jpg";
import kakumPark from "@/assets/kakum-park.jpg";
import elminaCastle from "@/assets/elmina-castle.jpg";
import molePark from "@/assets/mole-park.jpg";
import { reviewsService, PublicReview } from "@/services/reviews";
import { ReviewForm } from "@/components/home/ReviewForm";

import { destinationsService, Destination } from "@/services/destinations";

const whyUs = [
  {
    icon: Shield,
    title: "Verified Listings Only",
    body: "Every hotel, guide, and transport provider is manually screened before going live. No surprises.",
  },
  {
    icon: Phone,
    title: "24/7 Trip Support",
    body: "A real person picks up. Whether it's 6am or midnight, we're here to sort things out for you.",
  },
  {
    icon: Clock,
    title: "Book in Under 5 Minutes",
    body: "No endless forms. Search, confirm, pay — and you'll get your booking details on the spot.",
  },
  {
    icon: CheckCircle,
    title: "Secure Payments",
    body: "Pay via MTN MoMo, Telecel Cash, Visa or Mastercard. Your money is held safely until check-in.",
  },
];

const steps = [
  { num: "01", title: "Pick your destination", body: "Browse by region, activity type, or budget. Filter by what matters to you." },
  { num: "02", title: "Build your itinerary", body: "Add hotels, guides, and transport in one place. See your full trip cost before you confirm." },
  { num: "03", title: "Pay securely", body: "Choose your preferred payment method. Confirmation arrives instantly." },
  { num: "04", title: "Travel with confidence", body: "Your booking details, provider contacts, and support are all in your dashboard." },
];

export default function Index() {
  const [search, setSearch] = useState("");
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [loadingDestinations, setLoadingDestinations] = useState(true);

  const loadDestinations = useCallback(async () => {
    try {
      setLoadingDestinations(true);
      const data = await destinationsService.getPublishedDestinations();
      // Show only top 3 on homepage
      setDestinations(data.slice(0, 3));
    } catch (error) {
      console.error("Failed to load destinations:", error);
    } finally {
      setLoadingDestinations(false);
    }
  }, []);

  const loadPublishedReviews = useCallback(async () => {
    try {
      setLoadingReviews(true);
      const data = await reviewsService.getPublishedReviews();
      setReviews(data);
    } catch (error) {
      console.error("Failed to load reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  }, []);

  const loadContent = useCallback(async () => {
    await Promise.all([
      loadPublishedReviews(),
      loadDestinations()
    ]);
  }, [loadPublishedReviews, loadDestinations]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Ghana landscape"
            className="h-full w-full object-cover"
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gray-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
        </div>

        <div className="container relative z-10 flex min-h-[80vh] items-center justify-center">
          <div className="flex flex-col items-center justify-center text-center max-w-4xl w-full">
            <div className="inline-flex animate-fade-in items-center gap-2 rounded-2xl bg-white/10 px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-white backdrop-blur-md border border-white/20 mb-8 shadow-2xl">
              <MapPin className="h-4 w-4 text-primary" />
              Your Bridge to Ghana's Heritage
            </div>
            
            <h1 className="font-display animate-slide-up text-6xl font-black text-white md:text-8xl leading-[0.95] tracking-tight mb-8">
              Experience <br />
              the <span className="text-primary italic">Soul of West Africa.</span>
            </h1>

            <p className="mb-12 max-w-2xl text-xl text-gray-200 leading-relaxed font-medium animate-slide-up animation-delay-200">
              Your gateway to verified hotels, trusted local guides, and seamless transport. 
              Plan your entire Ghanaian adventure with local expertise and zero stress.
            </p>

            {/* Search bar */}
            <div className="w-full max-w-2xl flex flex-col gap-3 sm:flex-row bg-white/10 p-2 rounded-2xl backdrop-blur-xl border border-white/20 animate-slide-up animation-delay-400 shadow-2xl">
              <div className="flex flex-1 items-center gap-3 px-4 py-3 bg-white/5 rounded-xl border border-white/10 group focus-within:bg-white/15 focus-within:border-primary/50 transition-all">
                <MapPin className="h-5 w-5 shrink-0 text-primary group-focus-within:scale-110 transition-transform" />
                <Input
                  placeholder="Where to? (e.g. Cape Coast, Mole Park, Volta...)"
                  className="border-0 bg-transparent p-0 text-white placeholder:text-gray-400 focus-visible:ring-0 text-lg font-medium"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                size="lg"
                className="h-14 sm:h-auto px-10 gap-3 rounded-xl bg-primary font-bold text-white shadow-xl shadow-primary/40 hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                asChild
              >
                <Link to={`/destinations${search ? `?q=${search}` : ""}`}>
                  <Search className="h-5 w-5" /> Explore
                </Link>
              </Button>
            </div>

            {/* Quick links */}
            <div className="mt-10 flex flex-wrap justify-center gap-3 animate-slide-up animation-delay-600">
              <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest mr-2 self-center">Popular:</span>
              {["Cape Coast", "Mole Park", "Volta", "Kumasi"].map((place) => (
                <Link
                  key={place}
                  to={`/destinations?q=${place}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-gray-100 backdrop-blur-md hover:bg-primary hover:border-primary hover:text-white transition-all hover:translate-y-[-2px] shadow-sm"
                >
                   {place}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="bg-white border-y border-gray-100 py-12 relative overflow-hidden group">
        <div className="container relative z-10">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Verified Stays", icon: Hotel },
              { value: "200+", label: "Expert Guides", icon: Users },
              { value: "150+", label: "Attractions", icon: Compass },
              { value: "50,000+", label: "Happy Travelers", icon: CheckCircle },
            ].map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center">
                <div className="mb-3 rounded-2xl bg-primary/5 p-3 group-hover:bg-primary/10 transition-colors">
                  <s.icon className="h-6 w-6 text-primary" />
                </div>
                <p className="font-display text-4xl font-black text-gray-900 tracking-tight">{s.value}</p>
                <p className="mt-1 text-sm font-bold text-gray-500 uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="py-24 bg-gray-50/50">
        <div className="container">
          <div className="mb-16 flex flex-col md:flex-row items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-primary">Regional Highlights</p>
              <h2 className="font-display text-4xl font-black text-gray-950 md:text-5xl leading-tight">
                Curated experiences across Ghana's golden coast.
              </h2>
            </div>
            <Button size="lg" variant="outline" className="hidden md:flex gap-2 font-bold border-2" asChild>
              <Link to="/destinations">Explore All <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {loadingDestinations ? (
               Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-96 bg-white animate-pulse rounded-[2rem] border border-gray-100" />
              ))
            ) : destinations.length === 0 ? (
               <div className="col-span-3 py-12 text-center bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold uppercase tracking-widest italic">No destinations found.</p>
               </div>
            ) : (
              destinations.map((dest) => (
                <Link
                  key={dest.id}
                  to={`/destinations/${dest.id}`}
                  className="group relative overflow-hidden rounded-[2rem] bg-white shadow-xl hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-500 border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={dest.image_url}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/10 to-transparent" />
                    <div className="absolute left-6 top-6">
                      <span className="rounded-full bg-white/20 backdrop-blur-xl border border-white/30 px-5 py-2 text-xs font-black text-white uppercase tracking-wider">
                        {dest.category_name || "Highlight"}
                      </span>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                      <div>
                        <h3 className="font-display text-3xl font-black text-white leading-none">{dest.name}</h3>
                        <p className="mt-2 text-gray-300 font-medium flex items-center gap-1.5 overflow-hidden">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {dest.region}
                        </p>
                      </div>
                      <div className="bg-primary px-3 py-1 rounded-xl">
                        <span className="text-xs font-bold text-white/80 block leading-none text-center">FROM</span>
                        <span className="font-display text-xl font-black text-white leading-none tracking-tight">₵{dest.entrance_fee || "0"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-6">
                    <p className="text-gray-500 leading-relaxed font-medium line-clamp-2 italic mb-6">"{dest.description}"</p>
                    <div className="flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-gray-900">{dest.rating}</span>
                        <span className="text-gray-400 text-xs font-bold">({dest.reviews_count || 0})</span>
                      </div>
                      <div className="flex items-center gap-1 font-black text-primary uppercase text-xs tracking-widest group-hover:gap-3 transition-all duration-300">
                        View Details <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Button size="lg" className="w-full font-bold h-14 rounded-2xl" asChild>
              <Link to="/destinations">See more destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-24 bg-white">
        <div className="container">
          <div className="mb-20 text-center max-w-3xl mx-auto">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-primary">The Process</p>
            <h2 className="font-display text-4xl font-black text-gray-900 md:text-6xl leading-[1.1]">
              Seamless planning, from <span className="text-primary">start</span> to <span className="italic">finish.</span>
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative group">
                {i < steps.length - 1 && (
                  <div className="absolute top-12 left-full hidden h-[2px] w-full bg-gradient-to-r from-primary/20 to-transparent md:block" style={{ zIndex: 0, width: "calc(100% - 3rem)" }} />
                )}
                <div className="relative z-10 flex flex-col items-center text-center group-hover:translate-y-[-4px] transition-transform">
                  <div className="flex h-24 w-24 items-center justify-center rounded-[2.5rem] bg-gray-50 border-2 border-gray-100 text-primary font-display font-black text-3xl group-hover:border-primary/20 group-hover:bg-primary/5 transition-all duration-300 shadow-sm mb-6">
                    {step.num}
                  </div>
                  <h3 className="font-black text-gray-900 text-xl mb-3">{step.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRIPEASE ── */}
      <section className="py-24 bg-gray-50 border-y border-gray-100">
        <div className="container">
          <div className="mb-16 text-center max-w-2xl mx-auto">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-primary">Our Values</p>
            <h2 className="font-display text-4xl font-black text-gray-900 md:text-5xl">
              Why travellers trust TripEase.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => (
              <div key={item.title} className="group relative rounded-[2rem] border border-white bg-white p-10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <item.icon className="h-32 w-32 text-primary" />
                </div>
                <div className="relative z-10">
                  <div className="mb-8 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <item.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-4 font-black text-gray-900 text-xl tracking-tight">{item.title}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES STRIP ── */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="container">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: Hotel,
                title: "Premium Accommodation",
                body: "From beachfront resorts to cozy mountain cabins — hand-picked for quality and comfort.",
                link: "/hotels",
              },
              {
                icon: Users,
                title: "Expert Local Guides",
                body: "Book professional guides with specialized knowledge in history, nature, or urban exploration.",
                link: "/guides",
              },
              {
                icon: Truck,
                title: "Reliable Transport",
                body: "Air-conditioned intercity coaches and private transfers to get you anywhere comfortably.",
                link: "/transport",
              },
            ].map((s) => (
              <Link
                key={s.title}
                to={s.link}
                className="group relative flex flex-col gap-8 rounded-[2.5rem] border-2 border-gray-50 p-10 hover:border-primary/20 hover:shadow-2xl transition-all duration-500 bg-white"
              >
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-50 text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                  <s.icon className="h-10 w-10" />
                </div>
                <div>
                  <h3 className="mb-3 font-black text-gray-900 text-2xl tracking-tight">{s.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-lg font-medium">{s.body}</p>
                </div>
                <div className="mt-auto flex items-center gap-2 font-black text-primary uppercase text-sm tracking-widest group-hover:gap-4 transition-all duration-300">
                  EXPLORE OPTIONS <ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-gray-50/50 overflow-hidden">
        <div className="container">
          <div className="mb-20 text-center max-w-2xl mx-auto">
            <p className="mb-4 text-sm font-black uppercase tracking-[0.3em] text-primary">Traveler Voices</p>
            <h2 className="font-display text-4xl font-black text-gray-900 md:text-5xl">
              Honest stories from real trips.
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3 mb-20">
            {loadingReviews ? (
              <div className="col-span-3 flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
                <p className="text-gray-500 font-bold uppercase tracking-widest">Loading Testimonials...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="col-span-3 text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-bold text-xl italic font-display">Be the first to share your Ghana travel story!</p>
              </div>
            ) : (
              reviews.map((t) => (
                <div key={t.id} className="group flex flex-col rounded-[2rem] border border-white bg-white p-10 shadow-xl hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px]">
                  <div className="mb-8 flex gap-1">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                    ))}
                  </div>
                  <p className="mb-10 text-gray-600 leading-relaxed text-lg font-medium italic">"{t.comment}"</p>
                  <div className="mt-auto flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20 text-white font-black text-xl">
                      {t.full_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-lg tracking-tight leading-tight">{t.full_name}</p>
                      <p className="text-xs font-black text-primary uppercase tracking-widest mt-1">{t.location}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Review Submission Form */}
          <div className="mt-20">
             <ReviewForm />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary py-32 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[800px] h-[800px] border-[60px] border-white/10 rounded-full" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[600px] h-[600px] border-[40px] border-white/5 rounded-full" />

        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            <h2 className="font-display text-5xl font-black text-white md:text-7xl leading-[1.1] tracking-tight">
              Ready to experience <br />
              the <span className="italic">Gold Coast?</span>
            </h2>
            <p className="mt-8 max-w-2xl text-xl text-orange-50 font-medium leading-relaxed">
              Join thousands of travelers who plan their Ghana journeys with TripEase. 
              Secure bookings, local insights, and 24/7 support.
            </p>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
              <Button
                size="lg"
                className="h-16 px-12 rounded-[1.25rem] bg-white font-black text-primary text-xl hover:bg-orange-50 shadow-2xl hover:scale-105 active:scale-95 transition-all"
                asChild
              >
                <Link to="/register">Get Started Free</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-12 rounded-[1.25rem] border-white/40 bg-white/10 font-black text-white text-xl hover:bg-white/20 backdrop-blur-md hover:scale-105 active:scale-95 transition-all"
                asChild
              >
                <Link to="/destinations">Browse Itineraries</Link>
              </Button>
            </div>
            <div className="mt-10 flex items-center gap-3">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => <div key={i} className="h-10 w-10 rounded-full border-2 border-primary bg-gray-200" />)}
               </div>
               <p className="text-orange-100 font-bold text-sm uppercase tracking-widest">
                 +50k Travelers have explored Ghana with us
               </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
