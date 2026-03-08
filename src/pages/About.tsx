import { MapPin, Globe, Users, Shield, Award } from "lucide-react";
import Layout from "@/components/layout/Layout";

const About = () => {
    return (
        <Layout>
            {/* Hero Section */}
            <section className="bg-gradient-primary py-20 text-primary-foreground">
                <div className="container text-center">
                    <h1 className="mb-4 font-display text-4xl font-bold md:text-5xl">About TripEase Ghana</h1>
                    <p className="mx-auto max-w-2xl text-lg text-primary-foreground/90">
                        We are on a mission to showcase the beauty, culture, and heritage of Ghana to the world.
                    </p>
                </div>
            </section>

            {/* Story Section */}
            <section className="py-20">
                <div className="container">
                    <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="mb-6 font-display text-3xl font-bold">Our Story</h2>
                            <p className="mb-4 text-muted-foreground">
                                Founded in 2026, TripEase Ghana was born out of a deep love for our country and a desire to make it accessible to everyone. We noticed that while Ghana has incredible destinations, discovering and booking them was often a fragmented experience.
                            </p>
                            <p className="text-muted-foreground">
                                We set out to create a unified platform that connects travelers with local hotels, experienced tour guides, and authentic cultural activities. Today, we're proud to be the premier destination management platform for the Gold Coast.
                            </p>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl bg-accent p-6 text-center">
                                <Globe className="mx-auto mb-3 h-10 w-10 text-primary" />
                                <h3 className="font-display text-2xl font-bold">16</h3>
                                <p className="text-sm text-muted-foreground">Regions Covered</p>
                            </div>
                            <div className="rounded-2xl bg-accent p-6 text-center">
                                <Users className="mx-auto mb-3 h-10 w-10 text-primary" />
                                <h3 className="font-display text-2xl font-bold">50k+</h3>
                                <p className="text-sm text-muted-foreground">Happy Travelers</p>
                            </div>
                            <div className="rounded-2xl bg-accent p-6 text-center">
                                <Shield className="mx-auto mb-3 h-10 w-10 text-primary" />
                                <h3 className="font-display text-2xl font-bold">100%</h3>
                                <p className="text-sm text-muted-foreground">Verified Partners</p>
                            </div>
                            <div className="rounded-2xl bg-accent p-6 text-center">
                                <Award className="mx-auto mb-3 h-10 w-10 text-primary" />
                                <h3 className="font-display text-2xl font-bold">4.8</h3>
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-muted py-20">
                <div className="container">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 font-display text-3xl font-bold">Our Values</h2>
                        <p className="mx-auto max-w-2xl text-muted-foreground">
                            These core principles guide everything we do, from how we build our software to how we interact with our partners.
                        </p>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {[
                            {
                                title: "Authentic Experiences",
                                description: "We believe in showcasing the real Ghana, prioritizing local experiences that respect our culture and heritage.",
                                icon: MapPin,
                            },
                            {
                                title: "Empowering Locals",
                                description: "Our platform directly supports local tour guides, hoteliers, and artisans, keeping tourism revenue within our communities.",
                                icon: Users,
                            },
                            {
                                title: "Trust & Safety",
                                description: "We rigorously verify all our partners and provide secure payment systems to ensure peace of mind for every traveler.",
                                icon: Shield,
                            },
                        ].map((value) => {
                            const Icon = value.icon;
                            return (
                                <div key={value.title} className="rounded-2xl border border-border bg-card p-8 text-center transition-all hover:shadow-primary-md">
                                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                                        <Icon className="h-8 w-8 text-primary" />
                                    </div>
                                    <h3 className="mb-3 font-display text-xl font-bold">{value.title}</h3>
                                    <p className="text-muted-foreground">{value.description}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default About;
