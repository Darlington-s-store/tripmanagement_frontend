import { useEffect, useState } from "react";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { tripsService, Trip } from "@/services/trips";
import { toast } from "sonner";
import { 
  getValidDate, 
  formatDate, 
  formatDateRange, 
  formatBookingRange,
  formatCurrency,
  formatNumber
} from "@/utils/date";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { normalizeTripPlanning } from "@/lib/trip-planning";
import {
  MapPin,
  Calendar,
  Users,
  FileText,
  Plus,
  Trash2,
  Plane,
  ChevronRight,
  Clock,
  Lightbulb,
  Hotel,
  Car,
  Compass,
  Wallet,
  Activity as ActivityIcon,
  ListChecks,
} from "lucide-react";
import AttractionSearchDialog from "@/components/trips/AttractionSearchDialog";
import HotelSearchDialog from "@/components/trips/HotelSearchDialog";
import TransportSearchDialog from "@/components/trips/TransportSearchDialog";
import { Hotel as HotelType } from "@/services/hotels";
import { TransportService as TransportType } from "@/services/transport";
import { Attraction as AttractionType } from "@/services/destinations";

interface ItineraryDay {
  dayNumber: number;
  activities: Activity[];
  accommodation?: {
    id?: string;
    name: string;
    location: string;
    price?: number;
  };
  notes: string;
}

interface Activity {
  id: string;
  time: string;
  title: string;
  location?: string;
  type: "attraction" | "hotel" | "transport" | "food" | "other";
  price?: number;
}

const activityTypes = [
  { value: "attraction", label: "Side Attraction", color: "bg-primary/10 text-primary" },
  { value: "hotel", label: "Hotel", color: "bg-secondary text-secondary-foreground" },
  { value: "transport", label: "Transport", color: "bg-primary/15 text-primary" },
  { value: "food", label: "Food", color: "bg-secondary text-secondary-foreground" },
  { value: "other", label: "Other", color: "bg-muted text-muted-foreground" },
];

const ghanaDestinations = [
  "Cape Coast",
  "Accra",
  "Kumasi",
  "Elmina",
  "Kakum National Park",
  "Mole National Park",
  "Tamale",
  "Boti Falls",
  "Wli Waterfalls",
  "Labadi Beach",
  "Busua Beach",
  "Paga",
  "Bolgatanga",
  "Ho",
];

const suggestedItineraries: Record<string, { day: number; activities: string[] }[]> = {
  "Cape Coast": [
    { day: 1, activities: ["Arrive & check into hotel", "Visit Cape Coast Castle", "Sunset walk along the beach"] },
    { day: 2, activities: ["Kakum National Park canopy walk", "Traditional lunch at local restaurant", "Evening at Fort William"] },
    { day: 3, activities: ["Visit Elmina Castle", "Local market shopping", "Depart"] },
  ],
  Kumasi: [
    { day: 1, activities: ["Visit Manhyia Palace Museum", "Explore Kejetia Market", "Ashanti Cultural Centre"] },
    { day: 2, activities: ["Lake Bosomtwe", "Craft village tour", "Kente weaving workshop"] },
  ],
};

const transportOptions = [
  { id: "flight", icon: Plane, label: "Flight" },
  { id: "bus", icon: Car, label: "Bus" },
  { id: "private", icon: Users, label: "Private" },
  { id: "rental", icon: Compass, label: "Rental" },
];

const travelStyles = ["relaxed", "moderate", "intense"];
const accommodationPreferences = ["luxury", "mid-range", "budget"];
const availableInterests = ["Culture", "Nature", "Nightlife", "History", "Adventure", "Food", "Beach"];

const formatDateOptions: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };

const flatSectionClassName = "rounded-none border-0 border-b border-border bg-transparent pb-8 shadow-none";
const flatSectionHeaderClassName = "px-0 pb-4";
const flatSectionContentClassName = "px-0 pt-0";

const createEmptyDay = (dayNumber: number): ItineraryDay => ({
  dayNumber,
  activities: [],
  notes: "",
});

const parseStoredPrice = (value?: string) => {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
};

const parseStoredActivities = (activitiesText: string, fallbackKey: string) => {
  const lines = activitiesText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let accommodation: ItineraryDay["accommodation"];
  const activities: Activity[] = [];

  lines.forEach((line, index) => {
    const hotelMatch = line.match(/^\[HOTEL\]\s*Stay at (.+?)\s*@\s*(.+?)(?:\s+\(([^)]+)\))?$/i);

    if (hotelMatch) {
      accommodation = {
        name: hotelMatch[1].trim(),
        location: hotelMatch[2].trim(),
        price: parseStoredPrice(hotelMatch[3]),
      };
      return;
    }

    const match = line.match(/^\[(\w+)\]\s*(?:(.+?):\s*)?(.+?)(?:\s*@\s*(.+))?$/);
    const type = (match?.[1]?.toLowerCase() || "other") as Activity["type"];

    activities.push({
      id: `${fallbackKey}-${index}`,
      time: match?.[2] || "",
      title: match?.[3] || line,
      location: match?.[4] || "",
      type: activityTypes.some((item) => item.value === type) ? type : "other",
    });
  });

  return { activities, accommodation };
};

export default function PlanTrip() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, isLoading } = useAuth();
  const editTripId = searchParams.get("edit");

  const [step, setStep] = useState(1);
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState(searchParams.get("destination") || "");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travellers, setTravellers] = useState("1");
  const [budget, setBudget] = useState("");
  const [travelStyle, setTravelStyle] = useState("moderate");
  const [accPref, setAccPref] = useState("mid-range");
  const [interests, setInterests] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState({
    sideAttractions: "",
    accommodation: "",
    transport: "",
  });
  const [mainTransport, setMainTransport] = useState({
    mode: "flight",
    provider: "",
    reference: "",
    notes: "",
  });
  const [days, setDays] = useState<ItineraryDay[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTrip, setIsLoadingTrip] = useState(Boolean(editTripId));

  const numDays = () => {
    if (startDate && endDate) {
      const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
      return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1);
    }

    return 0;
  };

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !editTripId) {
      setIsLoadingTrip(false);
      return;
    }

    let isMounted = true;

    const loadTripForEdit = async () => {
      setIsLoadingTrip(true);

      try {
        const trip = await tripsService.getTripById(editTripId);
        const parsedPlanning = normalizeTripPlanning(trip.planning_details, trip.description);
        const durationDays =
          trip.start_date && trip.end_date
            ? Math.max(
              1,
              Math.ceil(
                (new Date(trip.end_date).getTime() - new Date(trip.start_date).getTime()) / (1000 * 60 * 60 * 24)
              ) + 1
            )
            : 0;
        const storedDays = Array.isArray(trip.itineraries)
          ? [...trip.itineraries].sort((left, right) => left.day_number - right.day_number)
          : [];
        const maxStoredDay = storedDays.length > 0 ? Math.max(...storedDays.map((day) => day.day_number)) : 0;
        const totalDays = Math.max(durationDays, maxStoredDay);
        const dayMap = new Map(storedDays.map((day) => [day.day_number, day]));
        const transportMode = parsedPlanning.transit.mode?.toLowerCase() || "flight";

        if (!isMounted) return;

        setTripName(trip.trip_name || "");
        setDestination(trip.destination || "");
        setDescription(parsedPlanning.summary || trip.description || "");
        setStartDate(trip.start_date ? String(trip.start_date).split("T")[0] : "");
        setEndDate(trip.end_date ? String(trip.end_date).split("T")[0] : "");
        setTravellers(String(trip.traveller_count || 1));
        setBudget(trip.budget !== undefined && trip.budget !== null ? String(trip.budget) : "");
        setTravelStyle(parsedPlanning.preferences.style?.toLowerCase() || "moderate");
        setAccPref(parsedPlanning.preferences.stay?.toLowerCase() || "mid-range");
        setInterests(parsedPlanning.interests || []);
        setWishlist({
          sideAttractions: parsedPlanning.wishlist.attractions || "",
          accommodation: parsedPlanning.wishlist.hotels || "",
          transport: parsedPlanning.wishlist.transport || "",
        });
        setMainTransport({
          mode: transportOptions.some((option) => option.id === transportMode) ? transportMode : "flight",
          provider: parsedPlanning.transit.provider || "",
          reference: parsedPlanning.transit.ref || "",
          notes: parsedPlanning.transit.notes || "",
        });
        setDays(
          totalDays > 0
            ? Array.from({ length: totalDays }, (_, index) => {
              const dayNumber = index + 1;
              const storedDay = dayMap.get(dayNumber);

              if (!storedDay) {
                return createEmptyDay(dayNumber);
              }

              const { activities, accommodation } = parseStoredActivities(
                storedDay.activities || "",
                storedDay.id || `${trip.id}-${dayNumber}`
              );

              return {
                dayNumber,
                activities,
                accommodation,
                notes: storedDay.notes || "",
              };
            })
            : []
        );
      } catch (error) {
        console.error("Failed to load trip for editing:", error);
        toast.error("Failed to load trip for editing");
        navigate(`/trips/${editTripId}`);
      } finally {
        if (isMounted) {
          setIsLoadingTrip(false);
        }
      }
    };

    void loadTripForEdit();

    return () => {
      isMounted = false;
    };
  }, [editTripId, isAuthenticated, isLoading, navigate]);

  const autoGenerateDays = () => {
    const totalDays = numDays();

    if (totalDays <= 0) {
      toast.error("Select valid dates first");
      return;
    }

    const start = new Date(startDate);
    const generatedDays: ItineraryDay[] = Array.from({ length: totalDays }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return { dayNumber: index + 1, activities: [], notes: "" };
    });

    setDays(generatedDays);
    toast.success(`Generated ${totalDays}-day itinerary`);
  };

  const applySuggestedItinerary = () => {
    const suggestion = suggestedItineraries[destination];

    if (!suggestion) {
      toast.error("No suggestions for this destination yet");
      return;
    }

    const nextDays: ItineraryDay[] = suggestion.map((item) => ({
      dayNumber: item.day,
      activities: item.activities.map((activity, index) => ({
        id: `${item.day}-${index}`,
        time: "",
        title: activity,
        type: "other" as const,
      })),
      notes: "",
    }));

    setDays(nextDays);
    toast.success("Suggested itinerary applied");
  };

  const addActivity = (dayNumber: number) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
            ...day,
            activities: [...day.activities, { id: `${Date.now()}`, time: "", title: "", type: "other" }],
          }
          : day
      )
    );
  };
  const updateActivity = (dayNumber: number, activityId: string, field: keyof Activity, value: string) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
            ...day,
            activities: day.activities.map((activity) =>
              activity.id === activityId ? { ...activity, [field]: value } : activity
            ),
          }
          : day
      )
    );
  };

  const removeActivity = (dayNumber: number, activityId: string) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? { ...day, activities: day.activities.filter((activity) => activity.id !== activityId) }
          : day
      )
    );
  };

  const removeDay = (dayNumber: number) => {
    setDays((currentDays) => currentDays.filter((day) => day.dayNumber !== dayNumber));
  };

  const addDay = () => {
    setDays((currentDays) => {
      const nextDayNumber = currentDays.length > 0 ? Math.max(...currentDays.map((day) => day.dayNumber)) + 1 : 1;
      return [...currentDays, { dayNumber: nextDayNumber, activities: [], notes: "" }];
    });
  };

  const updateDayNotes = (dayNumber: number, notes: string) => {
    setDays((currentDays) =>
      currentDays.map((day) => (day.dayNumber === dayNumber ? { ...day, notes } : day))
    );
  };

  const clearAccommodation = (dayNumber: number) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber ? { ...day, accommodation: undefined } : day
      )
    );
  };

  const handleSelectHotel = (dayNumber: number, hotel: HotelType) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
            ...day,
            accommodation: {
              id: hotel.id,
              name: hotel.name,
              location: hotel.location,
              price: hotel.price_per_night,
            },
          }
          : day
      )
    );

    toast.success(`Set ${hotel.name} as accommodation for Day ${dayNumber}`);
  };

  const handleSelectTransport = (dayNumber: number, transport: TransportType) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
            ...day,
            activities: [
              ...day.activities,
              {
                id: `${Date.now()}`,
                time: transport.departure_time || "",
                title: `${transport.type.toUpperCase()}: ${transport.operator}`,
                location: `${transport.from_location} to ${transport.to_location}`,
                type: "transport",
                price: transport.price,
              },
            ],
          }
          : day
      )
    );

    toast.success(`Added ${transport.type} to Day ${dayNumber}`);
  };

  const handleSelectAttraction = (dayNumber: number, attraction: AttractionType) => {
    setDays((currentDays) =>
      currentDays.map((day) =>
        day.dayNumber === dayNumber
          ? {
            ...day,
            activities: [
              ...day.activities,
              {
                id: `${Date.now()}`,
                time: "Morning",
                title: attraction.name,
                location: destination,
                type: "attraction",
                price: attraction.entrance_fee || 0,
              },
            ],
          }
          : day
      )
    );

    toast.success(`Added ${attraction.name} to Day ${dayNumber}`);
  };

  const calculateTotalCost = () =>
    days.reduce((total, day) => {
      const activitiesCost = day.activities.reduce((dayTotal, activity) => dayTotal + (activity.price || 0), 0);
      const accommodationCost = day.accommodation?.price || 0;
      return total + activitiesCost + accommodationCost;
    }, 0);

  const toggleInterest = (interest: string) => {
    setInterests((prev) =>
      prev.includes(interest) ? prev.filter((i) => i !== interest) : [...prev, interest]
    );
  };

  const handleSubmit = async () => {
    if (!destination || !startDate || !endDate) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        tripName,
        destination,
        startDate,
        endDate,
        description,
        budget: budget ? Number.parseFloat(budget) : null,
        travellerCount: travellers ? Number.parseInt(travellers, 10) : 1,
        planningDetails: {
          mainTransport: {
            mode: mainTransport.mode,
            provider: mainTransport.provider,
            reference: mainTransport.reference,
            notes: mainTransport.notes,
          },
          preferences: {
            travelStyle,
            accommodationPreference: accPref,
          },
          interests,
          wishlist: {
            sideAttractions: wishlist.sideAttractions,
            accommodation: wishlist.accommodation,
            transport: wishlist.transport,
          },
        },
      };

      const itineraryItems = days.map((day) => {
        const activityLines = day.activities.map((activity) => {
          const loc = activity.location ? ` @ ${activity.location}` : "";
          return `[${activity.type.toUpperCase()}] ${activity.time ? `${activity.time}: ` : ""}${activity.title}${loc}`;
        });

        if (day.accommodation) {
          activityLines.push(
            `[HOTEL] Stay at ${day.accommodation.name} @ ${day.accommodation.location}${day.accommodation.price ? ` (${formatCurrency(day.accommodation.price)})` : ""}`
          );
        }

        return {
          dayNumber: day.dayNumber,
          activities: activityLines.join("\n"),
          notes: day.notes || "",
        };
      });

      const trip = editTripId
        ? await tripsService.updateTrip(editTripId, payload)
        : await tripsService.createTrip(payload);

      await tripsService.replaceItinerary(trip.id, itineraryItems);

      toast.success(editTripId ? "Trip updated successfully!" : "Trip planned successfully!");
      navigate(`/trips/${trip.id}`);
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || (editTripId ? "Failed to update trip" : "Failed to create trip"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingTrip) {
    return (
      <DashboardLayout role="user">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" />;

  const steps = [
    { num: 1, label: "Trip details" },
    { num: 2, label: "Itinerary" },
    { num: 3, label: "Review and save" },
  ];

  const totalCost = calculateTotalCost();
  const totalBudget = budget ? Number.parseFloat(budget) : undefined;
  const travellerCount = Number.parseInt(travellers, 10) || 0;
  const perTravellerBudget = totalBudget && travellerCount > 1 ? totalBudget / travellerCount : undefined;
  const mainTransportLabel = transportOptions.find((option) => option.id === mainTransport.mode)?.label || "Flight";
  const hasPlanningNotes = Boolean(
    mainTransport.provider ||
    mainTransport.reference ||
    interests.length > 0 ||
    wishlist.sideAttractions ||
    wishlist.accommodation ||
    wishlist.transport
  );

  return (
    <DashboardLayout role="user">
      <div className="w-full space-y-8">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              {editTripId ? "Edit your trip" : "Plan your trip"}
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              {editTripId
                ? "Update the essentials and adjust your itinerary day by day."
                : "Start with the essentials, then build your itinerary day by day."}
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {steps.map((item) => {
              const isCurrent = step === item.num;
              const isComplete = step > item.num;
              const isClickable = isComplete;

              return (
                <button
                  key={item.num}
                  type="button"
                  onClick={() => isClickable && setStep(item.num)}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-2 text-left transition-colors ${isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isComplete
                        ? "border-primary/20 bg-primary/10 text-primary"
                        : "border-border bg-background text-muted-foreground"
                    } ${isClickable ? "cursor-pointer" : "cursor-default"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${isCurrent
                        ? "bg-primary-foreground/15 text-primary-foreground"
                        : isComplete
                          ? "bg-primary/15 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {item.num}
                  </span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {step === 1 && (
          <div className="max-w-4xl space-y-8 pb-12">
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                {/* Trip Information Card */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Trip information</CardTitle>
                        <CardDescription className="text-xs">Set the core details for your journey.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Trip name <span className="font-normal">(optional)</span>
                        </label>
                        <Input
                          placeholder="Cape Coast adventure..."
                          value={tripName}
                          onChange={(event) => setTripName(event.target.value)}
                          className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Destination <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            className="pl-9 border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                            placeholder="Kumasi, Takoradi..."
                            value={destination}
                            onChange={(event) => setDestination(event.target.value)}
                            list="destinations-list"
                            required
                          />
                          <datalist id="destinations-list">
                            {ghanaDestinations.map((item) => (
                              <option key={item} value={item} />
                            ))}
                          </datalist>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description or notes</label>
                      <Textarea
                        placeholder="What is the purpose of this trip? Any special context?"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={4}
                        className="border-transparent bg-secondary/40 focus:bg-background transition-colors resize-none text-sm font-medium"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Schedule and Budget Card */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Calendar className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Schedule and budget</CardTitle>
                        <CardDescription className="text-xs">Pick your dates, group size, and budget.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Departure <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(event) => setStartDate(event.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                          className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Return <span className="text-destructive">*</span>
                        </label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(event) => setEndDate(event.target.value)}
                          min={startDate || new Date().toISOString().split("T")[0]}
                          className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Travellers</label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            min="1"
                            max="50"
                            value={travellers}
                            onChange={(event) => setTravellers(event.target.value)}
                            className="pl-9 border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Planned Budget (GH₵)</label>
                        <div className="relative">
                          <Wallet className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            placeholder="0.00"
                            value={budget}
                            onChange={(event) => setBudget(event.target.value)}
                            className="pl-9 border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    {startDate && endDate && numDays() > 0 && (
                      <div className="flex items-center gap-4 border-l-4 border-primary bg-primary/5 p-4 rounded-r-xl">
                        <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center shadow-sm">
                          <Clock className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-bold text-primary">{numDays()} day adventure</p>
                          <p className="text-xs text-muted-foreground font-medium">
                            {formatDateRange(startDate, endDate)}
                          </p>
                        </div>
                        {perTravellerBudget && (
                          <div className="ml-auto text-right">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Per head</p>
                            <p className="text-sm font-bold text-primary">{formatCurrency(perTravellerBudget)}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                {/* Transit Card */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Primary transit</CardTitle>
                        <CardDescription className="text-xs">How will you reach your destination?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-3 grid-cols-4">
                      {transportOptions.map((option) => {
                        const isSelected = mainTransport.mode === option.id;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setMainTransport((c) => ({ ...c, mode: option.id }))}
                            className={`flex flex-col items-center justify-center gap-2 rounded-xl border py-4 px-2 text-center transition-all ${isSelected
                              ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.05]"
                              : "border-transparent bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                              }`}
                          >
                            <option.icon className={`h-5 w-5 ${isSelected ? "text-primary-foreground" : "text-primary"}`} />
                            <span className="text-[10px] font-bold uppercase tracking-tight">{option.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Provider</label>
                        <Input
                          placeholder="Passion Air, Starline..."
                          value={mainTransport.provider}
                          onChange={(event) => setMainTransport((c) => ({ ...c, provider: event.target.value }))}
                          className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reference #</label>
                        <Input
                          placeholder="Booking reference..."
                          value={mainTransport.reference}
                          onChange={(event) => setMainTransport((c) => ({ ...c, reference: event.target.value }))}
                          className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Preferences Card */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ActivityIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Preferences</CardTitle>
                        <CardDescription className="text-xs">Tell us what you like.</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Travel Style</label>
                        <select
                          value={travelStyle}
                          onChange={(event) => setTravelStyle(event.target.value)}
                          className="w-full h-11 px-4 rounded-xl border-transparent bg-secondary/40 focus:bg-background transition-colors text-sm font-medium"
                        >
                          {travelStyles.map(style => <option key={style} value={style}>{style}</option>)}
                        </select>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Stay Preference</label>
                        <select
                          value={accPref}
                          onChange={(event) => setAccPref(event.target.value)}
                          className="w-full h-11 px-4 rounded-xl border-transparent bg-secondary/40 focus:bg-background transition-colors text-sm font-medium"
                        >
                          {accommodationPreferences.map(pref => <option key={pref} value={pref}>{pref}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interests</label>
                      <div className="flex flex-wrap gap-2">
                        {availableInterests.map((interest) => {
                          const isSelected = interests.includes(interest);
                          return (
                            <Badge
                              key={interest}
                              variant={isSelected ? "default" : "secondary"}
                              className={`cursor-pointer rounded-full px-4 py-1.5 transition-all hover:scale-105 active:scale-95 ${isSelected ? "shadow-md shadow-primary/20" : "bg-secondary/40"
                                }`}
                              onClick={() => toggleInterest(interest)}
                            >
                              {interest}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Wishlist Card */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <ListChecks className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Wishlist</CardTitle>
                        <CardDescription className="text-xs">Anything special on your mind?</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Side attractions</label>
                      <Input
                        placeholder="Hidden waterfalls, local markets..."
                        value={wishlist.sideAttractions}
                        onChange={(event) => setWishlist(w => ({ ...w, sideAttractions: event.target.value }))}
                        className="border-transparent bg-secondary/40 focus:bg-background transition-colors h-11 font-medium"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="flex justify-end border-t pt-8">
              <Button onClick={() => setStep(2)} className="gap-2 rounded-2xl h-14 px-10 font-bold shadow-lg shadow-primary/20">
                Plan the days
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">Build the itinerary</h2>
                <p className="text-sm text-muted-foreground">
                  {destination} {startDate && endDate && numDays() > 0 ? `| ${numDays()} days` : ""}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {days.length === 0 && (
                  <Button variant="outline" size="sm" onClick={autoGenerateDays} className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Generate days
                  </Button>
                )}

                {suggestedItineraries[destination] && (
                  <Button variant="outline" size="sm" onClick={applySuggestedItinerary} className="gap-2">
                    <Lightbulb className="h-4 w-4" />
                    Use suggestions
                  </Button>
                )}

                <Button size="sm" onClick={addDay} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add day
                </Button>
              </div>
            </div>
            <div className="grid gap-x-6 gap-y-4 border-y border-border py-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Destination</p>
                <p className="font-medium">{destination || "Not set"}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Dates</p>
                <p className="font-medium">
                  {startDate && endDate
                    ? `${formatDate(startDate, "d MMM")} - ${formatDate(endDate, "d MMM yyyy")}`
                    : "Not set"}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Travellers</p>
                <p className="font-medium">{travellers}</p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Budget</p>
                <p className="font-medium">{formatCurrency(totalBudget)}</p>
              </div>
            </div>

            {hasPlanningNotes && (
              <section className="space-y-6">
                <div className="space-y-1 border-b border-border pb-4">
                  <h2 className="flex items-center gap-2 text-xl font-semibold">
                    <FileText className="h-5 w-5 text-primary" />
                    Planning notes
                  </h2>
                  <p className="text-sm text-muted-foreground">Keep these preferences in view while you arrange the days.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Trip style</p>
                    <p className="text-sm font-medium capitalize">
                      {travelStyle}, {accPref}
                    </p>
                  </div>

                  {(mainTransport.provider || mainTransport.reference) && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Transit</p>
                      <p className="text-sm font-medium">
                        {mainTransportLabel}
                        {mainTransport.provider ? ` with ${mainTransport.provider}` : ""}
                        {mainTransport.reference ? ` (${mainTransport.reference})` : ""}
                      </p>
                    </div>
                  )}

                  {wishlist.sideAttractions && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Side attractions</p>
                      <p className="text-sm font-medium">{wishlist.sideAttractions}</p>
                    </div>
                  )}

                  {wishlist.accommodation && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Preferred stays</p>
                      <p className="text-sm font-medium">{wishlist.accommodation}</p>
                    </div>
                  )}

                  {wishlist.transport && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Transport needs</p>
                      <p className="text-sm font-medium">{wishlist.transport}</p>
                    </div>
                  )}

                  {interests.length > 0 && (
                    <div className="space-y-2 md:col-span-2 lg:col-span-4">
                      <p className="text-sm font-medium uppercase tracking-wider text-xs text-muted-foreground">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {interests.map((interest) => (
                          <Badge key={interest} variant="secondary" className="rounded-full">
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {days.length === 0 ? (
              <div className="rounded-md border border-dashed py-16 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground opacity-40" />
                <h3 className="font-medium">No itinerary days yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Generate days from your dates or add them manually.
                </p>
                <Button onClick={autoGenerateDays} className="mt-4 gap-2">
                  <Calendar className="h-4 w-4" />
                  Generate days
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {days.map((day) => {
                  const date = startDate ? new Date(startDate) : null;

                  if (date) {
                    date.setDate(date.getDate() + (day.dayNumber - 1));
                  }

                  return (
                    <div key={day.dayNumber} className="space-y-8 py-8 first:pt-0">
                      <div className="flex flex-col gap-4 border-b border-border pb-4 md:flex-row md:items-center md:justify-between">
                        <div className="space-y-1">
                          <h3 className="text-xl font-bold">Day {day.dayNumber}</h3>
                          {date && (
                            <p className="text-sm text-muted-foreground">
                              {date.toLocaleDateString("en-GB", {
                                weekday: "long",
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                              })}
                            </p>
                          )}
                        </div>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => addActivity(day.dayNumber)} className="gap-2 rounded-full">
                            <Plus className="h-4 w-4" />
                            Add activity
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeDay(day.dayNumber)} className="gap-2 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                            Remove day
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-8">
                        {/* Day Accommodation */}
                        <div className="border-l-4 border-primary/40 bg-secondary/30 p-6 rounded-r-xl">
                          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                <Hotel className="h-6 w-6" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-widest text-primary/70">Accommodation</p>
                                {day.accommodation ? (
                                  <>
                                    <p className="text-lg font-semibold">{day.accommodation.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {day.accommodation.location}
                                      {day.accommodation.price ? ` | ${formatCurrency(day.accommodation.price)}` : ""}
                                    </p>
                                  </>
                                ) : (
                                  <p className="text-base text-muted-foreground italic">No hotel selected for this day.</p>
                                )}
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <HotelSearchDialog
                                defaultLocation={destination}
                                onSelect={(hotel) => handleSelectHotel(day.dayNumber, hotel)}
                                trigger={
                                  <Button variant="secondary" size="sm" className="rounded-full shadow-sm hover:shadow-md transition-all">
                                    {day.accommodation ? "Change hotel" : "Choose hotel"}
                                  </Button>
                                }
                              />

                              {day.accommodation && (
                                <Button variant="ghost" size="sm" onClick={() => clearAccommodation(day.dayNumber)} className="rounded-full">
                                  Remove
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Activities List */}
                        <div className="space-y-6 pl-2">
                          {day.activities.length === 0 ? (
                            <div className="rounded-xl border border-dashed p-8 text-center bg-secondary/10">
                              <p className="text-sm text-muted-foreground">No activities added yet for Day {day.dayNumber}.</p>
                              <Button variant="link" onClick={() => addActivity(day.dayNumber)} className="mt-2 text-primary">
                                Add your first activity
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-6">
                              {day.activities.map((activity, idx) => (
                                <div key={activity.id} className="relative pl-8 before:absolute before:left-0 before:top-2 before:bottom-0 before:w-[2px] last:before:bottom-auto last:before:h-4 before:bg-border">
                                  <div className="absolute left-[-5px] top-2 h-3 w-3 rounded-full border-2 border-background bg-primary"></div>

                                  <div className="grid gap-6 xl:grid-cols-[160px_1fr_auto]">
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Time</label>
                                      <Input
                                        placeholder="9:00 AM"
                                        value={activity.time}
                                        onChange={(event) =>
                                          updateActivity(day.dayNumber, activity.id, "time", event.target.value)
                                        }
                                        className="h-11 border-transparent bg-secondary/40 focus:bg-background transition-colors"
                                      />
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-2">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Activity & Location</label>
                                        <div className="space-y-3">
                                          <Input
                                            placeholder="Guided tour of the castle"
                                            value={activity.title}
                                            onChange={(event) =>
                                              updateActivity(day.dayNumber, activity.id, "title", event.target.value)
                                            }
                                            className="h-11 border-transparent bg-secondary/40 focus:bg-background transition-colors font-medium"
                                          />
                                          <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                            <Input
                                              placeholder="Exact location"
                                              value={activity.location || ""}
                                              onChange={(event) =>
                                                updateActivity(day.dayNumber, activity.id, "location", event.target.value)
                                              }
                                              className="h-11 border-transparent bg-secondary/40 focus:bg-background transition-colors pl-9 text-sm"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Type</label>
                                        <select
                                          value={activity.type}
                                          onChange={(event) =>
                                            updateActivity(day.dayNumber, activity.id, "type", event.target.value)
                                          }
                                          className="h-11 w-full rounded-md border-transparent bg-secondary/40 focus:bg-background px-3 text-sm transition-colors"
                                        >
                                          {activityTypes.map((item) => (
                                            <option key={item.value} value={item.value}>
                                              {item.label}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>

                                    <div className="flex items-end pb-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeActivity(day.dayNumber, activity.id)}
                                        className="text-muted-foreground hover:text-destructive h-9 rounded-full"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </div>

                                  {activity.price ? (
                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary uppercase">
                                      Est. Cost: {formatCurrency(activity.price)}
                                    </div>
                                  ) : null}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Search Actions */}
                        <div className="flex flex-wrap gap-2 pt-2">
                          <AttractionSearchDialog
                            defaultLocation={destination}
                            onSelect={(attraction) => handleSelectAttraction(day.dayNumber, attraction)}
                            trigger={
                              <Button variant="outline" size="sm" className="gap-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                <Compass className="h-4 w-4 text-primary" />
                                Add attraction
                              </Button>
                            }
                          />

                          <TransportSearchDialog
                            defaultTo={destination}
                            onSelect={(transport) => handleSelectTransport(day.dayNumber, transport)}
                            trigger={
                              <Button variant="outline" size="sm" className="gap-2 rounded-full bg-secondary/20 hover:bg-secondary/40 transition-colors">
                                <Car className="h-4 w-4 text-primary" />
                                Add transport
                              </Button>
                            }
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => addActivity(day.dayNumber)}
                            className="gap-2 rounded-full"
                          >
                            <Plus className="h-4 w-4" />
                            Manual item
                          </Button>
                        </div>

                        <div className="space-y-2 max-w-2xl bg-secondary/10 p-5 rounded-2xl">
                          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Day notes</label>
                          <Textarea
                            placeholder="Special notes for this day (parking, booking refs, reminders...)"
                            value={day.notes}
                            onChange={(event) => updateDayNotes(day.dayNumber, event.target.value)}
                            rows={2}
                            className="border-transparent bg-transparent focus:bg-background transition-colors resize-none text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button className="gap-2 sm:ml-auto" onClick={() => setStep(3)}>
                Review trip
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-4xl space-y-10 pb-12">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Review and save</h2>
              <p className="text-base text-muted-foreground">
                Confirm your trip details before creating your personal adventure.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-8">
                {/* Main Trip Info */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{tripName || destination || "Trip summary"}</CardTitle>
                        <CardDescription className="uppercase tracking-widest font-bold text-[10px] opacity-70">Main Information</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    {[
                      { label: "Destination", value: destination || "Not set" },
                      {
                        label: "Dates",
                        value:
                            formatDateRange(startDate, endDate)
                      },
                      { label: "Travellers", value: travellers || "Not set" },
                      { label: "Duration", value: numDays() > 0 ? `${numDays()} days` : "Not set" },
                      { label: "Budget", value: formatCurrency(totalBudget) },
                      { label: "Cost", value: formatCurrency(totalCost) },
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</p>
                        <p className="text-sm font-semibold">{item.value}</p>
                      </div>
                    ))}
                    
                    {description && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</p>
                        <p className="text-sm text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-3 py-1 bg-secondary/5 rounded-r-md">
                          "{description}"
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Planning Details */}
                <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Compass className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">Planning details</CardTitle>
                        <CardDescription className="uppercase tracking-widest font-bold text-[10px] opacity-70">Preferences & Notes</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary transit</p>
                      <p className="text-sm font-semibold">
                        {mainTransportLabel}
                        {mainTransport.provider ? ` via ${mainTransport.provider}` : ""}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Trip style</p>
                      <p className="text-sm font-semibold capitalize">
                        {travelStyle}, {accPref}
                      </p>
                    </div>

                    {interests.length > 0 && (
                      <div className="space-y-2 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Interests</p>
                        <div className="flex flex-wrap gap-2">
                          {interests.map((interest) => (
                            <Badge key={interest} variant="outline" className="rounded-full text-[10px] px-2 py-0 font-bold border-primary/20 text-primary">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {wishlist.sideAttractions && (
                      <div className="space-y-1 sm:col-span-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Side attractions</p>
                        <p className="text-sm font-medium">{wishlist.sideAttractions}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-8">
                {/* Itinerary Summary */}
                {days.length > 0 && (
                  <Card className="border-none shadow-sm shadow-black/5 bg-background overflow-hidden ring-1 ring-border/50">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Itinerary overview</CardTitle>
                          <CardDescription className="uppercase tracking-widest font-bold text-[10px] opacity-70">Daily breakdown</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-border/40">
                        {days.map((day) => {
                          const date = startDate ? new Date(startDate) : null;
                          if (date) {
                            date.setDate(date.getDate() + (day.dayNumber - 1));
                          }

                          return (
                            <div key={day.dayNumber} className="p-5 space-y-4 hover:bg-secondary/5 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                  <p className="text-sm font-bold">Day {day.dayNumber}</p>
                                  {date && (
                                    <p className="text-[10px] text-muted-foreground font-medium">
                                      {date.toLocaleDateString("en-GB", {
                                        weekday: "short",
                                        day: "numeric",
                                        month: "short",
                                      })}
                                    </p>
                                  )}
                                </div>
                                {day.accommodation && (
                                  <Badge variant="secondary" className="text-[10px] px-2 py-0 bg-primary/5 text-primary border-primary/10">
                                    <Hotel className="h-3 w-3 mr-1" />
                                    {day.accommodation.name}
                                  </Badge>
                                )}
                              </div>

                              <div className="space-y-2">
                                {day.activities.length > 0 ? (
                                  day.activities.slice(0, 3).map((activity) => (
                                    <div key={activity.id} className="flex items-center gap-2">
                                      <div className="h-1 w-1 rounded-full bg-primary/40 shrink-0"></div>
                                      <p className="text-xs text-muted-foreground font-medium line-clamp-1">
                                        {activity.time && <span className="text-primary/70">{activity.time}: </span>}
                                        {activity.title}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-muted-foreground italic">No activities listed.</p>
                                )}
                                {day.activities.length > 3 && (
                                  <p className="text-[10px] text-primary/60 font-bold pl-3">
                                    + {day.activities.length - 3} more activities
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex flex-col gap-4 pt-4">
                  <Button 
                    size="lg" 
                    className="w-full gap-2 rounded-2xl h-16 text-lg font-bold shadow-xl shadow-primary/20 relative overflow-hidden group" 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary-foreground/10 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-gradient-x"></div>
                    {isSubmitting ? (
                      <>
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                        Saving your trip...
                      </>
                    ) : (
                      <>
                        Create Trip
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="lg" 
                    onClick={() => setStep(2)}
                    className="w-full rounded-2xl font-bold transition-all hover:bg-secondary"
                  >
                    Back to itinerary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

