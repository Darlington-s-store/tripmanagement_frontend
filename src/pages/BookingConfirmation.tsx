import { Link } from "react-router-dom";
import { CheckCircle2, Calendar, MapPin, Receipt, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";

const BookingConfirmation = () => {
    return (
        <Layout>
            <div className="bg-muted py-16 md:py-24">
                <div className="container max-w-3xl">
                    <div className="rounded-2xl border border-border bg-card p-8 shadow-primary-lg text-center md:p-12">
                        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                            <CheckCircle2 className="h-10 w-10 text-success" />
                        </div>

                        <h1 className="mb-2 font-display text-3xl font-bold md:text-4xl text-foreground">Booking Confirmed!</h1>
                        <p className="mb-8 text-lg text-muted-foreground">
                            Thank you for choosing TripEase Ghana. Your booking details have been sent to your email.
                        </p>

                        <div className="mx-auto max-w-md rounded-xl bg-muted/50 p-6 text-left border border-border mb-8">
                            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                                <span className="font-semibold text-foreground">Booking Reference</span>
                                <span className="font-mono text-primary font-bold">TEG-847291</span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">Sunset Beach Resort</span>
                                        <span className="text-muted-foreground">Cape Coast, Central Region</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">Dec 12 - Dec 15, 2026</span>
                                        <span className="text-muted-foreground">3 Nights • 2 Guests</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">Total Paid</span>
                                        <span className="font-bold text-primary">GH₵ 3,600.00</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 sm:flex-row justify-center">
                            <Link to="/dashboard/bookings">
                                <Button size="lg" className="w-full gap-2">
                                    View My Bookings <ArrowRight className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link to="/">
                                <Button variant="outline" size="lg" className="w-full">
                                    Return to Home
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default BookingConfirmation;
