import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  type LucideIcon,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Mail,
  MapPinned,
  MessageSquare,
  Phone,
  Receipt,
  UserRound,
  Users,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, Booking } from "@/services/admin";
import { toast } from "sonner";

const statusClasses: Record<string, string> = {
  confirmed: "border-primary/20 bg-primary/10 text-primary",
  pending: "border-secondary bg-secondary text-secondary-foreground",
  cancelled: "border-destructive/20 bg-destructive/10 text-destructive",
  completed: "border-success/20 bg-success/10 text-success",
};

const emptyValue = "Not provided";

function toDate(value?: string | null) {
  if (!value) return null;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function formatDate(value?: string | null) {
  const parsed = toDate(value);

  return parsed
    ? parsed.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
    : "Date not set";
}

function formatDateTime(value?: string | null) {
  const parsed = toDate(value);

  return parsed
    ? parsed.toLocaleString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
    : "Date not set";
}

function formatDateRange(start?: string | null, end?: string | null) {
  const startLabel = formatDate(start);
  const endLabel = toDate(end) ? formatDate(end) : "";

  if (!endLabel) {
    return startLabel;
  }

  if (startLabel === endLabel) {
    return startLabel;
  }

  return `${startLabel} to ${endLabel}`;
}

function formatCurrency(value: number | string | undefined) {
  const amount = typeof value === "string" ? Number.parseFloat(value) : value ?? 0;
  const safeAmount = Number.isFinite(amount) ? amount : 0;

  return `GHS ${safeAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatStatus(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatBookingType(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") {
    return emptyValue;
  }

  return String(value);
}

function SectionHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        <Icon className="h-4 w-4 text-primary" />
        <span>{label}</span>
      </div>
      <p className="text-base font-medium leading-6 text-foreground">{value}</p>
    </div>
  );
}

export default function AdminBookingOverview() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate("/admin/bookings");
      return;
    }

    let isMounted = true;

    const loadBooking = async () => {
      setIsLoading(true);

      try {
        const data = await adminService.getBookingById(id);

        if (isMounted) {
          setBooking(data);
        }
      } catch (error) {
        console.error("Failed to load booking details:", error);
        toast.error("Failed to load booking details.");
        navigate("/admin/bookings");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadBooking();

    return () => {
      isMounted = false;
    };
  }, [id, navigate]);

  const handleUpdateStatus = async (nextStatus: string) => {
    if (!booking) return;

    setIsUpdating(true);

    try {
      await adminService.updateBooking(booking.id, { status: nextStatus });
      setBooking((current) => (current ? { ...current, status: nextStatus } : current));
      toast.success(`Booking marked as ${formatStatus(nextStatus).toLowerCase()}.`);
    } catch (error) {
      console.error("Failed to update booking status:", error);
      toast.error("Failed to update booking status.");
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!booking) {
    return null;
  }

  const statusLabel = formatStatus(booking.status);
  const bookingTypeLabel = formatBookingType(booking.booking_type);
  const serviceName = booking.service_name?.trim() || `${bookingTypeLabel} booking`;
  const bookingReference = booking.reference_id || booking.id;
  const scheduleLabel = formatDateRange(booking.check_in_date, booking.check_out_date);
  const guestLabel = `${booking.number_of_guests || 0} ${booking.number_of_guests === 1 ? "guest" : "guests"}`;
  const specialRequests = booking.special_requests?.trim() || "No special requests were added to this booking.";

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8 pb-10">
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit gap-2 rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/admin/bookings")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to bookings
        </Button>

        <div className="flex flex-col gap-6 border-b border-border pb-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge
                variant="outline"
                className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[booking.status] || "border-border bg-muted text-foreground"}`}
              >
                {statusLabel}
              </Badge>
              <span className="text-sm text-muted-foreground">{bookingTypeLabel}</span>
            </div>

            <div className="space-y-1">
              <h1 className="font-display text-3xl font-bold tracking-tight text-foreground">
                Booking details
              </h1>
              <p className="text-base text-muted-foreground">{serviceName}</p>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-primary" />
                Ref: {bookingReference}
              </span>
              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                {scheduleLabel}
              </span>
              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-primary" />
                Created {formatDateTime(booking.created_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {booking.status === "pending" && (
              <Button
                className="gap-2"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("confirmed")}
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm booking
              </Button>
            )}

            {booking.status !== "cancelled" && (
              <Button
                variant="outline"
                className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 hover:text-destructive"
                disabled={isUpdating}
                onClick={() => handleUpdateStatus("cancelled")}
              >
                <XCircle className="h-4 w-4" />
                Cancel booking
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,2fr)_360px]">
          <div className="overflow-hidden rounded-2xl border border-border bg-background">
            <section className="px-6 py-6">
              <SectionHeader
                title="Customer information"
                description="Who placed the booking and how the team can reach them."
              />

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <DetailItem
                  icon={UserRound}
                  label="Full name"
                  value={booking.customer_name?.trim() || "Guest user"}
                />
                <DetailItem
                  icon={Mail}
                  label="Email address"
                  value={displayValue(booking.email)}
                />
                <DetailItem
                  icon={Phone}
                  label="Phone number"
                  value={displayValue(booking.phone)}
                />
                <DetailItem
                  icon={Receipt}
                  label="Booking ID"
                  value={booking.id}
                />
              </div>
            </section>

            <Separator />

            <section className="px-6 py-6">
              <SectionHeader
                title="Booking information"
                description="Core reservation details and linked service information."
              />

              <div className="mt-6 grid gap-6 md:grid-cols-2">
                <DetailItem
                  icon={MapPinned}
                  label="Service"
                  value={serviceName}
                />
                <DetailItem
                  icon={Receipt}
                  label="Booking type"
                  value={bookingTypeLabel}
                />
                <DetailItem
                  icon={CalendarDays}
                  label="Travel dates"
                  value={scheduleLabel}
                />
                <DetailItem
                  icon={Users}
                  label="Guests"
                  value={guestLabel}
                />
                <DetailItem
                  icon={Receipt}
                  label="Reference"
                  value={bookingReference}
                />
                <DetailItem
                  icon={UserRound}
                  label="User ID"
                  value={displayValue(booking.user_id)}
                />
              </div>
            </section>

            <Separator />

            <section className="px-6 py-6">
              <SectionHeader
                title="Requests and notes"
                description="Additional instructions attached to the reservation."
              />

              <div className="mt-5 rounded-xl bg-muted/40 px-4 py-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
                  <MessageSquare className="h-4 w-4 text-primary" />
                  Special requests
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{specialRequests}</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-background px-6 py-6">
              <SectionHeader
                title="Status summary"
                description="Current processing state for this booking."
              />

              <div className="mt-5 space-y-4">
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Current status</span>
                  <Badge
                    variant="outline"
                    className={`rounded-full border px-3 py-1 text-xs font-medium ${statusClasses[booking.status] || "border-border bg-muted text-foreground"}`}
                  >
                    {statusLabel}
                  </Badge>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Created on</span>
                  <span className="text-right font-medium text-foreground">
                    {formatDateTime(booking.created_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Schedule</span>
                  <span className="max-w-[180px] text-right font-medium text-foreground">
                    {scheduleLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background px-6 py-6">
              <SectionHeader
                title="Financial summary"
                description="Recorded payment amount for this reservation."
              />

              <div className="mt-5 space-y-4">
                <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total amount</p>
                    <p className="mt-1 text-2xl font-semibold text-primary">
                      {formatCurrency(booking.total_price)}
                    </p>
                  </div>

                  <div className="rounded-full bg-primary/10 p-3 text-primary">
                    <CreditCard className="h-5 w-5" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Payment note</span>
                  <span className="max-w-[180px] text-right font-medium text-foreground">
                    {booking.status === "confirmed" || booking.status === "completed"
                      ? "Payment recorded"
                      : booking.status === "cancelled"
                        ? "Review refund status"
                        : "Awaiting admin review"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="max-w-[180px] text-right font-medium text-foreground">
                    {bookingReference}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
