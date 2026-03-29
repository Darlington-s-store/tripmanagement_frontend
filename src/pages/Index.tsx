import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search, MapPin, Star, ArrowRight, Phone,
  Shield, Clock, ChevronRight, CheckCircle,
  Hotel, Users, Truck, Compass,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Layout from "@/components/layout/Layout";
import heroImage from "@/assets/hero-ghana.jpg";
import kakumPark from "@/assets/kakum-park.jpg";
import elminaCastle from "@/assets/elmina-castle.jpg";
import molePark from "@/assets/mole-park.jpg";

const destinations = [
  {
    name: "Cape Coast",
    region: "Central Region",
    image: elminaCastle,
    tag: "History & Culture",
    rating: 4.9,
    reviews: 1840,
    price: 150,
    highlight: "Home to Elmina Castle and the oldest European structures in sub-Saharan Africa.",
  },
  {
    name: "Kakum National Park",
    region: "Central Region",
    image: kakumPark,
    tag: "Nature & Wildlife",
    rating: 4.8,
    reviews: 1120,
    price: 80,
    highlight: "Walk the famous canopy walkway 40 metres above the rainforest floor.",
  },
  {
    name: "Mole National Park",
    region: "Northern Region",
    image: molePark,
    tag: "Safari",
    rating: 4.7,
    reviews: 630,
    price: 200,
    highlight: "Ghana's largest wildlife refuge — elephants, antelopes, and over 300 bird species.",
  },
];

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

const testimonials = [
  {
    name: "Ama Owusu",
    location: "Accra",
    text: "I planned an entire Cape Coast trip for my family in one afternoon. The booking process was incredibly straightforward — no back-and-forth emails, no hidden costs.",
    stars: 5,
    avatar: "A",
  },
  {
    name: "James Mensah",
    location: "Kumasi",
    text: "The tour guide I booked through TripEase was knowledgeable and punctual. He took us to spots I'd never have found on my own. Worth every pesewa.",
    stars: 5,
    avatar: "J",
  },
  {
    name: "Diana Appiah",
    location: "Takoradi",
    text: "We needed vehicle hire last minute for a group of 12. TripEase had options available and confirmed within an hour. That kind of reliability matters.",
    stars: 5,
    avatar: "D",
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

  return (
    <Layout>
      {/* ── HERO ── */}
      <section className="relative flex min-h-[88vh] items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Ghana landscape"
            className="h-full w-full object-cover"
          />
          {/* Dark gradient from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-gray-900/20" />
          {/* Subtle orange tint on left */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-950/40 via-transparent to-transparent" />
        </div>

        <div className="container relative z-10 pb-20 pt-32">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-400/30 bg-orange-500/15 px-4 py-1.5 backdrop-blur-sm">
              <span className="text-sm font-semibold text-orange-300">🇬🇭 Ghana's Travel Platform</span>
            </div>

            <h1 className="mb-6 font-display text-5xl font-extrabold leading-[1.1] text-white md:text-6xl">
              Plan your Ghana trip <br />
              <span className="text-primary">the right way.</span>
            </h1>

            <p className="mb-10 max-w-xl text-lg text-gray-300 leading-relaxed">
              Book verified hotels, hire trusted local guides, arrange transport — and manage your entire itinerary from one place. No spreadsheets. No stress.
            </p>

            {/* Search bar */}
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-white/10 bg-white/10 px-4 py-3 backdrop-blur-md focus-within:border-primary/60 focus-within:bg-white/15 transition-all">
                <MapPin className="h-5 w-5 shrink-0 text-primary" />
                <Input
                  placeholder="Where are you going? e.g. Accra, Cape Coast..."
                  className="border-0 bg-transparent p-0 text-white placeholder:text-gray-400 focus-visible:ring-0 text-base"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button
                size="lg"
                className="h-14 gap-2 rounded-xl bg-primary px-8 font-bold text-white shadow-lg shadow-primary/40 hover:bg-primary/90 transition-all"
                asChild
              >
                <Link to={`/destinations${search ? `?q=${search}` : ""}`}>
                  <Search className="h-5 w-5" /> Search
                </Link>
              </Button>
            </div>

            {/* Quick links */}
            <div className="mt-6 flex flex-wrap gap-2">
              {["Cape Coast", "Accra", "Mole Park", "Volta Region", "Kumasi"].map((place) => (
                <Link
                  key={place}
                  to={`/destinations?q=${place}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-gray-300 backdrop-blur-sm hover:border-primary/50 hover:text-primary transition-colors"
                >
                  <Compass className="h-3 w-3" /> {place}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <section className="border-b border-gray-100 bg-white py-10">
        <div className="container">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { value: "500+", label: "Hotels & guesthouses" },
              { value: "200+", label: "Verified tour guides" },
              { value: "150+", label: "Ghana attractions" },
              { value: "50,000+", label: "Trips booked" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-display text-3xl font-extrabold text-primary md:text-4xl">{s.value}</p>
                <p className="mt-1 text-sm text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DESTINATIONS ── */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Where to go</p>
              <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
                Popular destinations
              </h2>
              <p className="mt-2 text-gray-500">
                Places our travellers visit again and again — and keep telling others about.
              </p>
            </div>
            <Button variant="ghost" className="hidden gap-1 font-semibold text-primary md:flex" asChild>
              <Link to="/destinations">All destinations <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {destinations.map((dest) => (
              <Link
                key={dest.name}
                to="/destinations"
                className="group overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                {/* Image */}
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute left-4 top-4 rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                    {dest.tag}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-900">{dest.name}</h3>
                      <p className="text-sm text-gray-400">{dest.region}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-primary">GH₵ {dest.price}</p>
                      <p className="text-xs text-gray-400">from / day</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{dest.highlight}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="font-semibold">{dest.rating}</span>
                      <span className="text-gray-400">({dest.reviews.toLocaleString()} reviews)</span>
                    </div>
                    <span className="flex items-center gap-0.5 text-sm font-semibold text-primary group-hover:gap-2 transition-all">
                      Explore <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Button variant="outline" asChild>
              <Link to="/destinations">View all destinations</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Simple process</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              From idea to itinerary in minutes
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="absolute top-8 left-full hidden h-px w-full bg-orange-100 md:block" style={{ zIndex: 0, width: "calc(100% - 2rem)" }} />
                )}
                <div className="relative z-10 flex flex-col gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-black text-lg">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg">{step.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY TRIPEASE ── */}
      <section className="py-20 bg-orange-50">
        <div className="container">
          <div className="mb-12 max-w-xl">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Why travellers choose us</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              We built what we wished existed when planning a trip in Ghana.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {whyUs.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── SERVICES STRIP ── */}
      <section className="py-16 bg-white border-y border-gray-100">
        <div className="container">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Hotel,
                title: "Hotels & Stays",
                body: "From budget guesthouses to beachside resorts — filtered by your dates, location, and preferences.",
                link: "/hotels",
              },
              {
                icon: Users,
                title: "Local Tour Guides",
                body: "Certified Ghanaian guides with real ratings and verified backgrounds. Book by language or specialty.",
                link: "/guides",
              },
              {
                icon: Truck,
                title: "Transport & Transfers",
                body: "Private vehicles, VIP coaches, and airport transfers — bookable by seat or as private hire.",
                link: "/transport",
              },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.title}
                  to={s.link}
                  className="group flex flex-col gap-4 rounded-2xl border border-gray-100 p-6 hover:border-primary/30 hover:shadow-md transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-bold text-gray-900 text-lg">{s.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{s.body}</p>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-semibold text-primary mt-auto group-hover:gap-2 transition-all">
                    Browse options <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50">
        <div className="container">
          <div className="mb-12 text-center">
            <p className="mb-2 text-sm font-bold uppercase tracking-widest text-primary">Real feedback</p>
            <h2 className="font-display text-3xl font-bold text-gray-900 md:text-4xl">
              What Ghanaian travellers say
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mb-6 text-gray-600 leading-relaxed text-sm">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary py-20">
        <div className="container">
          <div className="flex flex-col items-center text-center">
            <h2 className="font-display text-4xl font-extrabold text-white md:text-5xl max-w-2xl leading-tight">
              Your next Ghana adventure starts here.
            </h2>
            <p className="mt-4 max-w-lg text-lg text-orange-100">
              Create a free account and start building your trip today. No credit card needed to explore.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="h-14 rounded-xl bg-white px-10 font-bold text-primary text-lg hover:bg-orange-50 shadow-xl"
                asChild
              >
                <Link to="/register">Create free account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-white/30 bg-white/10 px-10 font-bold text-white text-lg hover:bg-white/20 backdrop-blur-sm"
                asChild
              >
                <Link to="/destinations">Browse destinations</Link>
              </Button>
            </div>
            <p className="mt-5 text-sm text-orange-200">
              Trusted by over 50,000 travellers across Ghana
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
