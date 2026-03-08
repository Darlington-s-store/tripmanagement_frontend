import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Phone, Shield, CheckCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { bookingsService } from "@/services/bookings";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

type PaymentMethod = "mtn" | "vodafone" | "airteltigo" | "card";

interface BookingData {
  type: "hotel" | "guide" | "activity" | "transport";
  id: string;
  name: string;
  roomId?: string;
  roomType?: string;
  checkInDate?: string;
  checkOutDate?: string;
  date?: string;
  time?: string;
  nights?: number;
  guests: number;
  price: number;
  totalPrice: number;
}

const paymentMethods = [
  { id: "mtn" as const, name: "MTN Mobile Money", icon: "📱", color: "border-warning bg-warning/5", description: "Pay with your MTN MoMo wallet" },
  { id: "vodafone" as const, name: "Vodafone Cash", icon: "📱", color: "border-destructive/50 bg-destructive/5", description: "Pay with Vodafone Cash" },
  { id: "airteltigo" as const, name: "AirtelTigo Money", icon: "📱", color: "border-info bg-info/5", description: "Pay with AirtelTigo Money" },
  { id: "card" as const, name: "Visa / Mastercard", icon: "💳", color: "border-primary bg-primary/5", description: "Pay with debit or credit card" },
];

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  const bookingData = location.state as BookingData | undefined;
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [step, setStep] = useState<"method" | "details" | "confirm">("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [userTrips, setUserTrips] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | "none">("none");

  useEffect(() => {
    if (isAuthenticated) {
      loadTrips();
    }
  }, [isAuthenticated]);

  const loadTrips = async () => {
    try {
      const { tripsService } = await import("@/services/trips");
      const trips = await tripsService.getUserTrips();
      setUserTrips(trips.filter(t => t.status === "planning" || t.status === "ongoing"));
    } catch (error) {
      console.error("Failed to load trips", error);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!bookingData) {
    return (
      <Layout>
        <div className="container max-w-4xl py-8">
          <h1 className="mb-2 font-display text-3xl font-bold">Invalid Booking</h1>
          <p className="mb-4 text-muted-foreground">No booking information found.</p>
          <Button onClick={() => navigate("/hotels")}>Back to Hotels</Button>
        </div>
      </Layout>
    );
  }

  const handlePayment = async () => {
    if (!selectedMethod) {
      toast.error("Please select a payment method");
      return;
    }

    setIsProcessing(true);
    try {
      const booking = await bookingsService.createBooking({
        bookingType: bookingData.type,
        referenceId: bookingData.id,
        roomId: bookingData.roomId,
        checkInDate: bookingData.checkInDate || bookingData.date,
        checkOutDate: bookingData.checkOutDate,
        totalPrice: bookingData.totalPrice,
        numberOfGuests: bookingData.guests,
        tripId: selectedTripId === "none" ? undefined : selectedTripId,
      });

      toast.success("Booking completed successfully!");
      navigate("/dashboard/bookings");
    } catch (error: any) {
      toast.error(error.message || "Failed to process booking");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Layout>
      <div className="container max-w-4xl py-8">
        <button onClick={() => navigate(-1)} className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <h1 className="mb-2 font-display text-3xl font-bold">Checkout</h1>
        <p className="mb-8 text-muted-foreground">Complete your booking payment securely</p>

        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {["Payment Method", "Details", "Confirm"].map((label, i) => {
            const stepIndex = i;
            const currentIndex = step === "method" ? 0 : step === "details" ? 1 : 2;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${stepIndex <= currentIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}>
                  {stepIndex < currentIndex ? <CheckCircle className="h-4 w-4" /> : stepIndex + 1}
                </div>
                <span className={`text-sm font-medium ${stepIndex <= currentIndex ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`h-px w-8 sm:w-16 ${stepIndex < currentIndex ? "bg-primary" : "bg-border"}`} />}
              </div>
            );
          })}
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {step === "method" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Select Payment Method</h2>

                <div className="space-y-3">
                  {paymentMethods.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedMethod(m.id)}
                      className={`flex w-full items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${selectedMethod === m.id ? m.color + " ring-2 ring-primary/20" : "border-border hover:border-primary/30"
                        }`}
                    >
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1">
                        <p className="font-semibold">{m.name}</p>
                        <p className="text-sm text-muted-foreground">{m.description}</p>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 ${selectedMethod === m.id ? "border-primary bg-primary" : "border-border"
                        }`}>
                        {selectedMethod === m.id && <CheckCircle className="h-full w-full text-primary-foreground" />}
                      </div>
                    </button>
                  ))}
                </div>

                <Button size="lg" className="w-full" disabled={!selectedMethod} onClick={() => setStep("details")}>
                  Continue
                </Button>
              </div>
            )}

            {step === "details" && selectedMethod && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">
                  {selectedMethod === "card" ? "Card Details" : "Mobile Money Details"}
                </h2>

                {selectedMethod === "card" ? (
                  <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <div>
                      <label className="mb-1 block text-sm font-medium">Cardholder Name</label>
                      <Input placeholder="Full name on card" />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Card Number</label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="1234 5678 9012 3456" className="pl-10" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium">Expiry Date</label>
                        <Input placeholder="MM/YY" />
                      </div>
                      <div>
                        <label className="mb-1 block text-sm font-medium">CVV</label>
                        <Input placeholder="123" type="password" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 rounded-xl border border-border bg-card p-6">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {selectedMethod === "mtn" ? "MTN" : selectedMethod === "vodafone" ? "Vodafone" : "AirtelTigo"} Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="+233 XX XXX XXXX" className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">Account Name</label>
                      <Input placeholder="Name on mobile money account" />
                    </div>
                    <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                      You will receive a payment prompt on your phone. Please approve the transaction to complete your booking.
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button variant="outline" size="lg" onClick={() => setStep("method")}>Back</Button>
                  <Button size="lg" className="flex-1" onClick={() => setStep("confirm")}>Review & Pay</Button>
                </div>
              </div>
            )}

            {step === "confirm" && (
              <div className="space-y-4">
                <h2 className="font-display text-xl font-semibold">Confirm Payment</h2>
                <div className="rounded-xl border border-border bg-card p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success" />
                    <p className="font-medium">Payment method: {paymentMethods.find((m) => m.id === selectedMethod)?.name}</p>
                  </div>
                  <p className="mb-6 text-sm text-muted-foreground">
                    By clicking "Pay Now", you agree to our terms of service and privacy policy. Your payment will be processed securely.
                  </p>
                  <Button size="lg" className="w-full gap-2" onClick={handlePayment} disabled={isProcessing}>
                    <Lock className="h-4 w-4" /> {isProcessing ? "Processing..." : `Pay GH₵${Number(bookingData.totalPrice).toFixed(2)}`}
                  </Button>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <Shield className="h-3 w-3" />
                    <span>Secured by Paystack & Hubtel</span>
                  </div>
                </div>
                <Button variant="outline" size="lg" onClick={() => setStep("details")}>Back</Button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div>
            <div className="sticky top-20 rounded-2xl border border-border bg-card p-6">
              <h3 className="mb-4 font-display text-lg font-semibold">Booking Summary</h3>
              <div className="mb-4 space-y-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="font-medium">{bookingData.name}</p>
                  {bookingData.roomType && (
                    <p className="text-sm font-semibold text-emerald-600">{bookingData.roomType}</p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {bookingData.checkInDate
                      ? `${new Date(bookingData.checkInDate).toLocaleDateString()} - ${new Date(bookingData.checkOutDate!).toLocaleDateString()} • ${bookingData.nights} nights`
                      : `${new Date(bookingData.date!).toLocaleDateString()} ${bookingData.time ? `at ${bookingData.time}` : ""}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{bookingData.guests} guest{bookingData.guests > 1 ? "s" : ""}</p>
                </div>

                {userTrips.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Link to Trip (Optional)</label>
                    <select
                      value={selectedTripId}
                      onChange={(e) => setSelectedTripId(e.target.value)}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="none">No trip (standalone booking)</option>
                      {userTrips.map((trip) => (
                        <option key={trip.id} value={trip.id}>
                          {trip.destination} ({new Date(trip.start_date).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    GH₵{Number(bookingData.price).toFixed(2)} {bookingData.nights ? `× ${bookingData.nights} nights` : "per person"}
                  </span>
                  <span className="font-medium">
                    GH₵{(Number(bookingData.price) * (bookingData.nights || 1) * (bookingData.type === 'activity' ? bookingData.guests : 1)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Service fee</span>
                  <span className="font-medium">GH₵{(Number(bookingData.totalPrice) * 0.04).toFixed(2)}</span>
                </div>
                <div className="mt-2 flex justify-between border-t border-border pt-2 text-base font-bold">
                  <span>Total</span><span className="text-primary">GH₵{Number(bookingData.totalPrice).toFixed(2)}</span>
                </div>
              </div>
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

export default Checkout;
