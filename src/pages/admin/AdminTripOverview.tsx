import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
   ArrowLeft,
   CalendarDays,
   Car,
   Clock3,
   DollarSign,
   FileText,
   Globe,
   Hotel,
   Lock,
   Mail,
   MapPin,
   Phone,
   Plane,
   Star,
   UserRound,
   Users,
   UtensilsCrossed,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { adminService, type AdminTrip } from "@/services/admin";
import { toast } from "sonner";
import { 
  getValidDate, 
  formatDate, 
  formatDateRange, 
  formatBookingRange,
  formatCurrency,
  formatNumber
} from "@/utils/date";
import { normalizeTripPlanning } from "@/lib/trip-planning";

type ParsedDescription = {
   summary: string;
   transit: {
      mode?: string;
      provider?: string;
      ref?: string;
   };
   preferences: {
      style?: string;
      stay?: string;
   };
   interests: string[];
   wishlist: {
      attractions?: string;
      hotels?: string;
      transport?: string;
   };
   extra: string[];
};

const statusClasses: Record<string, string> = {
   planning: "bg-primary/10 text-primary",
   ongoing: "bg-emerald-100 text-emerald-700",
   completed: "bg-muted text-foreground",
   cancelled: "bg-destructive/10 text-destructive",
};

const activityTypeStyles: Record<string, { cls: string; icon: ReactNode; label: string }> = {
   attraction: {
      cls: "border-primary/20 bg-primary/5 text-primary",
      icon: <Star className="h-3 w-3" />,
      label: "Attraction",
   },
   hotel: {
      cls: "border-border bg-secondary text-secondary-foreground",
      icon: <Hotel className="h-3 w-3" />,
      label: "Hotel",
   },
   transport: {
      cls: "border-primary/20 bg-primary/10 text-primary",
      icon: <Car className="h-3 w-3" />,
      label: "Transport",
   },
   food: {
      cls: "border-border bg-secondary text-secondary-foreground",
      icon: <UtensilsCrossed className="h-3 w-3" />,
      label: "Food",
   },
   other: {
      cls: "border-border bg-muted text-muted-foreground",
      icon: <Clock3 className="h-3 w-3" />,
      label: "Other",
   },
};

function SectionTitle({ title, description }: { title: string; description: string }) {
   return (
      <div className="space-y-1">
         <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
         <p className="text-sm text-muted-foreground">{description}</p>
      </div>
   );
}

function InfoRow({ label, value }: { label: string; value: string }) {
   return (
      <div className="space-y-1">
         <p className="text-sm text-muted-foreground">{label}</p>
         <p className="font-medium">{value}</p>
      </div>
   );
}

// Removed local getValidDate and formatDate as they are imported

function formatDateTime(value?: string) {
   const date = getValidDate(value);

   return date
      ? date.toLocaleString("en-GB", {
         day: "numeric",
         month: "short",
         year: "numeric",
         hour: "2-digit",
         minute: "2-digit",
      })
      : "Not set";
}

// Use formatCurrency from @/utils/date

function formatOptionalValue(value?: string) {
   if (!value || value === "N/A") return "Not set";
   return value;
}

function formatStatus(value?: string) {
   if (!value) return "Unknown";

   return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, (character) => character.toUpperCase());
}

function parseActivities(activitiesText: string) {
   if (!activitiesText) return [];

   return activitiesText
      .split("\n")
      .filter(Boolean)
      .map((line, index) => {
         const match = line.match(/^\[(\w+)\]\s*(?:(.+?):\s*)?(.+?)(?:\s*@\s*(.+))?$/);

         if (match) {
            return {
               id: String(index),
               type: match[1].toLowerCase(),
               time: match[2] || "",
               title: match[3],
               location: match[4] || "",
            };
         }

         return { id: String(index), type: "other", time: "", title: line, location: "" };
      });
}

function parsePipeFields(line: string) {
   return line
      .split("|")
      .map((part) => part.trim())
      .reduce<Record<string, string>>((accumulator, part) => {
         const [key, ...rest] = part.split(":");

         if (rest.length === 0) return accumulator;

         accumulator[key.trim().toLowerCase()] = rest.join(":").trim();
         return accumulator;
      }, {});
}

function parseTripDescription(description?: string): ParsedDescription {
   const result: ParsedDescription = {
      summary: "",
      transit: {},
      preferences: {},
      interests: [],
      wishlist: {},
      extra: [],
   };

   if (!description) return result;

   const lines = description
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

   for (const line of lines) {
      if (line === "--- PRIMARY TRANSIT ---" || line === "--- TRIP PREFERENCES ---") {
         continue;
      }

      if (line.startsWith("Mode:")) {
         const fields = parsePipeFields(line);
         result.transit = {
            mode: fields.mode,
            provider: fields.provider,
            ref: fields.ref,
         };
         continue;
      }

      if (line.startsWith("Style:")) {
         const fields = parsePipeFields(line);
         result.preferences = {
            style: fields.style,
            stay: fields.stay,
         };
         continue;
      }

      if (line.startsWith("Interests:")) {
         result.interests = line
            .replace("Interests:", "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
         continue;
      }

      if (line.startsWith("Attractions Wishlist:")) {
         result.wishlist.attractions = line.replace("Attractions Wishlist:", "").trim();
         continue;
      }

      if (line.startsWith("Hotel Wishlist:")) {
         result.wishlist.hotels = line.replace("Hotel Wishlist:", "").trim();
         continue;
      }

      if (line.startsWith("Transport Wishlist:")) {
         result.wishlist.transport = line.replace("Transport Wishlist:", "").trim();
         continue;
      }

      if (!result.summary) {
         result.summary = line;
      } else {
         result.extra.push(line);
      }
   }

   return result;
}

export default function AdminTripOverview() {
   const { id } = useParams<{ id: string }>();
   const navigate = useNavigate();
   const [trip, setTrip] = useState<AdminTrip | null>(null);
   const [isLoading, setIsLoading] = useState(true);

   const loadTrip = useCallback(async () => {
      if (!id) return;

      try {
         setIsLoading(true);
         const data = await adminService.getTripById(id);
         setTrip(data);
      } catch (error) {
         console.error("Failed to load admin trip details:", error);
         toast.error("Failed to load trip details");
         navigate("/admin/trips");
      } finally {
         setIsLoading(false);
      }
   }, [id, navigate]);

   useEffect(() => {
      void loadTrip();
   }, [loadTrip]);

   if (isLoading) {
      return (
         <DashboardLayout role="admin">
            <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
               <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
               <p className="text-muted-foreground">Loading trip details...</p>
            </div>
         </DashboardLayout>
      );
   }

   if (!trip) {
      return null;
   }

   const startDate = getValidDate(trip.start_date);
   const endDate = getValidDate(trip.end_date);
   const tripDays = Array.isArray(trip.itineraries)
      ? [...trip.itineraries].sort((left, right) => left.day_number - right.day_number)
      : [];
   const bookings = Array.isArray(trip.bookings) ? trip.bookings : [];
   const parsedDescription = normalizeTripPlanning(trip.planning_details, trip.description);
   const budget = trip.budget ? Number.parseFloat(String(trip.budget)) : null;
   const totalBookingSpend =
      bookings.reduce((sum, booking) => sum + Number.parseFloat(String(booking.total_price || 0)), 0) || 0;
   const durationDays =
      startDate && endDate
         ? Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1)
         : null;
   const maxStoredDay = tripDays.length > 0 ? Math.max(...tripDays.map((day) => day.day_number)) : 0;
   const renderedTripDays =
      Math.max(durationDays || 0, maxStoredDay) > 0
         ? Array.from({ length: Math.max(durationDays || 0, maxStoredDay) }, (_, index) => {
            const dayNumber = index + 1;
            return (
               tripDays.find((day) => day.day_number === dayNumber) || {
                  id: `placeholder-${dayNumber}`,
                  trip_id: trip.id,
                  day_number: dayNumber,
                  activities: "",
                  notes: "",
               }
            );
         })
         : [];
   const tripTitle = trip.trip_name?.trim() || trip.destination;
   const wishlistItems = [
      parsedDescription.wishlist.attractions ? `Attractions: ${parsedDescription.wishlist.attractions}` : null,
      parsedDescription.wishlist.hotels ? `Hotels: ${parsedDescription.wishlist.hotels}` : null,
      parsedDescription.wishlist.transport ? `Transport: ${parsedDescription.wishlist.transport}` : null,
   ].filter(Boolean) as string[];

   return (
      <DashboardLayout role="admin">
         <div className="space-y-8 pb-10">
            <Button
               variant="ghost"
               size="sm"
               className="-ml-2 w-fit gap-2 rounded-lg text-muted-foreground hover:text-foreground"
               onClick={() => navigate("/admin/trips")}
            >
               <ArrowLeft className="h-4 w-4" />
               Back to trips
            </Button>

            <div className="space-y-5 border-b border-border pb-6">
               <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-3">
                     <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={statusClasses[trip.status] || "bg-muted text-foreground"}>
                           {formatStatus(trip.status)}
                        </Badge>
                        <Badge variant="outline" className="rounded-full">
                           {trip.is_public ? "Public" : "Private"}
                        </Badge>
                        {trip.is_featured && (
                           <Badge variant="outline" className="rounded-full bg-secondary text-secondary-foreground">
                              Featured
                           </Badge>
                        )}
                     </div>

                     <div className="space-y-2">
                        <h1 className="text-3xl font-semibold tracking-tight">{tripTitle}</h1>
                        {trip.trip_name?.trim() && (
                           <p className="flex items-center gap-2 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              {trip.destination}
                           </p>
                        )}
                        {parsedDescription.summary && (
                           <p className="max-w-4xl text-sm text-muted-foreground">{parsedDescription.summary}</p>
                        )}
                        {parsedDescription.extra.length > 0 && (
                           <p className="max-w-4xl text-sm text-muted-foreground">{parsedDescription.extra.join(" ")}</p>
                        )}
                     </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background px-4 py-3 text-sm">
                     <p className="text-muted-foreground">Created</p>
                     <p className="font-medium">{formatDateTime(trip.created_at)}</p>
                  </div>
               </div>

               <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <InfoRow label="Traveler" value={trip.user_name} />
                  <InfoRow label="Travel dates" value={formatDateRange(startDate, endDate)} />
                  <InfoRow label="Duration" value={durationDays ? `${durationDays} days` : "Not set"} />
                  <InfoRow label="Budget" value={formatCurrency(budget)} />
               </div>
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.7fr)_340px]">
               <div className="space-y-8">
                  {(parsedDescription.transit.mode ||
                     parsedDescription.transit.notes ||
                     parsedDescription.preferences.style ||
                     parsedDescription.interests.length > 0 ||
                     wishlistItems.length > 0) && (
                        <section className="space-y-4 rounded-lg border border-border bg-background p-6">
                           <SectionTitle
                              title="Planned trip details"
                              description="This matches the planning data the traveler saved from the trip builder."
                           />

                           <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                              <InfoRow
                                 label="Primary transit"
                                 value={[
                                    parsedDescription.transit.mode || "Not set",
                                    parsedDescription.transit.provider && parsedDescription.transit.provider !== "N/A"
                                       ? parsedDescription.transit.provider
                                       : null,
                                    parsedDescription.transit.ref && parsedDescription.transit.ref !== "N/A"
                                       ? parsedDescription.transit.ref
                                       : null,
                                 ]
                                    .filter(Boolean)
                                    .join(" | ")}
                              />
                              <InfoRow
                                 label="Transit notes"
                                 value={parsedDescription.transit.notes || "Not set"}
                              />
                              <InfoRow
                                 label="Preferences"
                                 value={[
                                    parsedDescription.preferences.style || "Not set",
                                    parsedDescription.preferences.stay && parsedDescription.preferences.stay !== "N/A"
                                       ? parsedDescription.preferences.stay
                                       : null,
                                 ]
                                    .filter(Boolean)
                                    .join(" | ")}
                              />
                              <InfoRow
                                 label="Interests"
                                 value={parsedDescription.interests.length > 0 ? parsedDescription.interests.join(", ") : "Not set"}
                              />
                              <InfoRow
                                 label="Wishlist"
                                 value={wishlistItems.length > 0 ? wishlistItems.join(" | ") : "Not set"}
                              />
                           </div>
                        </section>
                     )}

                  <section className="space-y-4 rounded-lg border border-border bg-background p-6">
                     <SectionTitle
                        title="Daily itinerary"
                        description={
                           renderedTripDays.length > 0
                              ? `${renderedTripDays.length} day${renderedTripDays.length > 1 ? "s" : ""} planned`
                              : "No itinerary days saved yet"
                        }
                     />

                     {renderedTripDays.length === 0 ? (
                        <div className="rounded-lg border border-dashed py-12 text-center">
                           <CalendarDays className="mx-auto mb-4 h-10 w-10 text-muted-foreground opacity-40" />
                           <p className="text-sm text-muted-foreground">No itinerary days planned yet.</p>
                        </div>
                     ) : (
                        <div className="space-y-6">
                           {renderedTripDays.map((day) => {
                              const activities = parseActivities(day.activities || "");
                              const dayDate = startDate ? new Date(startDate) : null;

                              if (dayDate) {
                                 dayDate.setDate(dayDate.getDate() + (day.day_number - 1));
                              }

                              return (
                                 <div
                                    key={day.day_number}
                                    className="border-t border-border pt-6 first:border-t-0 first:pt-0"
                                 >
                                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                       <div>
                                          <p className="font-semibold">Day {day.day_number}</p>
                                          {dayDate && (
                                             <p className="text-sm text-muted-foreground">
                                                 {formatDate(dayDate, "EEEE, d MMMM")}
                                             </p>
                                          )}
                                       </div>
                                       <p className="text-sm text-muted-foreground">
                                          {activities.length > 0
                                             ? `${activities.length} item${activities.length > 1 ? "s" : ""}`
                                             : "No scheduled activities"}
                                       </p>
                                    </div>

                                    <div className="mt-4 space-y-3">
                                       {activities.length > 0 ? (
                                          activities.map((activity) => {
                                             const typeInfo = activityTypeStyles[activity.type] || activityTypeStyles.other;

                                             return (
                                                <div
                                                   key={activity.id}
                                                   className="grid gap-3 rounded-lg border px-4 py-3 md:grid-cols-[120px_minmax(0,1fr)_auto]"
                                                >
                                                   <div className="space-y-1">
                                                      <p className="text-sm font-medium">{activity.time || "Unscheduled"}</p>
                                                      <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                                                   </div>

                                                   <div className="min-w-0">
                                                      <p className="text-sm font-medium">{activity.title}</p>
                                                      {activity.location && (
                                                         <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                            <MapPin className="h-3 w-3" />
                                                            {activity.location}
                                                         </p>
                                                      )}
                                                   </div>

                                                   <Badge variant="outline" className={`h-fit gap-1 self-start border ${typeInfo.cls}`}>
                                                      {typeInfo.icon}
                                                      {typeInfo.label}
                                                   </Badge>
                                                </div>
                                             );
                                          })
                                       ) : (
                                          <p className="text-sm italic text-muted-foreground">
                                             {day.activities || "No activities scheduled"}
                                          </p>
                                       )}
                                    </div>

                                    {day.notes && (
                                       <div className="mt-4 border-l-2 border-primary/20 pl-4">
                                          <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                             <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                             <span>{day.notes}</span>
                                          </div>
                                       </div>
                                    )}
                                 </div>
                              );
                           })}
                        </div>
                     )}
                  </section>

                  <section className="space-y-4 rounded-lg border border-border bg-background p-6">
                     <SectionTitle
                        title="Linked bookings"
                        description="Services already attached to this trip plan."
                     />

                     {bookings.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No bookings are linked to this trip yet.</p>
                     ) : (
                        <div className="space-y-3">
                           {bookings.map((booking) => (
                              <div
                                 key={booking.id}
                                 className="flex flex-col gap-3 rounded-lg border px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
                              >
                                 <div>
                                    <p className="font-semibold capitalize">
                                       {booking.service_name || booking.booking_type}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                       {formatBookingRange(booking.check_in_date, booking.check_out_date)}
                                    </p>
                                 </div>

                                 <div className="flex items-center gap-3 sm:text-right">
                                    <div>
                                       <p className="font-semibold text-primary">
                                          {formatCurrency(booking.total_price)}
                                       </p>
                                    </div>
                                    <Badge
                                       variant="outline"
                                       className={statusClasses[booking.status] || "bg-muted text-foreground"}
                                    >
                                       {formatStatus(booking.status)}
                                    </Badge>
                                 </div>
                              </div>
                           ))}
                        </div>
                     )}
                  </section>
               </div>

               <aside className="space-y-6">
                  <section className="space-y-4 rounded-lg border border-border bg-background p-5">
                     <SectionTitle
                        title="Traveler"
                        description="The account that created this trip."
                     />

                     <div className="space-y-4">
                        <div className="flex items-start gap-3">
                           <div className="rounded-full bg-primary/10 p-2 text-primary">
                              <UserRound className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="font-medium">{trip.user_name}</p>
                              <p className="text-sm text-muted-foreground">User ID: {trip.user_id}</p>
                           </div>
                        </div>

                        <div className="space-y-3 text-sm">
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4 text-primary" />
                              <span>{formatOptionalValue(trip.user_email)}</span>
                           </div>
                           <div className="flex items-center gap-2 text-muted-foreground">
                              <Phone className="h-4 w-4 text-primary" />
                              <span>{formatOptionalValue(trip.user_phone)}</span>
                           </div>
                        </div>
                     </div>
                  </section>

                  <section className="space-y-4 rounded-lg border border-border bg-background p-5">
                     <SectionTitle
                        title="Trip setup"
                        description="Core metadata saved for this itinerary."
                     />

                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                           <Plane className="h-4 w-4 text-primary" />
                           <div>
                              <p className="text-sm text-muted-foreground">Status</p>
                              <p className="font-medium">{formatStatus(trip.status)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <CalendarDays className="h-4 w-4 text-primary" />
                           <div>
                              <p className="text-sm text-muted-foreground">Trip window</p>
                              <p className="font-medium">{formatDateRange(startDate, endDate)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <DollarSign className="h-4 w-4 text-primary" />
                           <div>
                              <p className="text-sm text-muted-foreground">Budget</p>
                              <p className="font-medium">{formatCurrency(budget)}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           {trip.is_public ? (
                              <Globe className="h-4 w-4 text-primary" />
                           ) : (
                              <Lock className="h-4 w-4 text-primary" />
                           )}
                           <div>
                              <p className="text-sm text-muted-foreground">Visibility</p>
                              <p className="font-medium">{trip.is_public ? "Public trip" : "Private trip"}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <Users className="h-4 w-4 text-primary" />
                           <div>
                              <p className="text-sm text-muted-foreground">Travellers</p>
                              <p className="font-medium">{trip.traveller_count ? `${trip.traveller_count}` : "Not set"}</p>
                           </div>
                        </div>

                        <div className="flex items-center gap-3">
                           <DollarSign className="h-4 w-4 text-primary" />
                           <div>
                              <p className="text-sm text-muted-foreground">Spend from bookings</p>
                              <p className="font-medium">{formatCurrency(totalBookingSpend)}</p>
                           </div>
                        </div>
                     </div>
                  </section>
               </aside>
            </div>
         </div>
      </DashboardLayout>
   );
}
