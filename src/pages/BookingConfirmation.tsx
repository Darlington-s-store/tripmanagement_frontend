import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, Calendar, MapPin, Receipt, ArrowRight, Download, Printer, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/layout/Layout";
import ReceiptView from "@/components/dashboard/ReceiptView";

const BookingConfirmation = () => {
    const location = useLocation();
    const [isReceiptOpen, setIsReceiptOpen] = useState(false);
    
    // Mock booking data - in production this would come from the API
    const mockBooking = {
        id: "BK_" + Date.now(),
        trip_id: null,
        booking_type: "hotel",
        reference_id: "HTL_" + Math.random().toString(36).substring(7),
        room_id: "RM_" + Math.random().toString(36).substring(7),
        check_in_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        check_out_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_price: "3600.00",
        number_of_guests: 2,
        special_requests: "High floor, ocean view preferred",
        status: "confirmed",
        created_at: new Date().toISOString(),
        payment: { status: "completed", id: "PAY_" + Math.random().toString(36).substring(7) },
        service_name: "Sunset Beach Resort",
        room_type: "Ocean View Deluxe",
    };
    
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
                                <span className="font-mono text-primary font-bold">{mockBooking.id.substring(0, 12).toUpperCase()}</span>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-start gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">{mockBooking.service_name}</span>
                                        <span className="text-muted-foreground">Cape Coast, Central Region</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">
                                            {new Date(mockBooking.check_in_date).toLocaleDateString()} - {new Date(mockBooking.check_out_date).toLocaleDateString()}
                                        </span>
                                        <span className="text-muted-foreground">3 Nights • {mockBooking.number_of_guests} Guests</span>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Receipt className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <span className="block font-semibold">Total Paid</span>
                                        <span className="font-bold text-primary">GH₵ {Number(mockBooking.total_price).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Receipt Actions */}
                        <div className="mb-8 bg-emerald-50 border border-emerald-200 rounded-lg p-4 space-y-3">
                            <div className="flex items-center gap-2 justify-center text-emerald-900 font-semibold">
                                <Eye className="h-4 w-4" />
                                View, Print or Download Your Receipt
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 justify-center">
                                <Button 
                                    onClick={() => setIsReceiptOpen(true)}
                                    className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Receipt
                                </Button>
                                <Button 
                                    onClick={() => setIsReceiptOpen(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Printer className="h-4 w-4" />
                                    Print
                                </Button>
                                <Button 
                                    onClick={() => setIsReceiptOpen(true)}
                                    variant="outline"
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download PDF
                                </Button>
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

            {/* Receipt Modal */}
            {isReceiptOpen && (
                <ReceiptView
                    booking={mockBooking as any}
                    onClose={() => setIsReceiptOpen(false)}
                />
            )}
        </Layout>
    );
};

export default BookingConfirmation;
