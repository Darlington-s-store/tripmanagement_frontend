# Hardcoded Mock Data Audit Report

## Summary
Searched entire `src/pages/` and `src/components/` directories for hardcoded mock data, sample data, placeholder arrays, and test data. Found minimal actual mock data, primarily UI configuration constants.

---

## Critical Findings

### 1. **ItineraryPlanner.tsx** - HARDCODED SAMPLE DATA
**File:** [src/pages/ItineraryPlanner.tsx](src/pages/ItineraryPlanner.tsx#L18-L24)
**Lines:** 18-24

Contains hardcoded sample itinerary data used as initial state:
```javascript
const initialItems: ItineraryItem[] = [
  { id: "1", day: 1, type: "hotel", name: "Labadi Beach Hotel, Accra", cost: 450, time: "3:00 PM" },
  { id: "2", day: 1, type: "attraction", name: "Kwame Nkrumah Memorial", cost: 20, time: "10:00 AM" },
  { id: "3", day: 2, type: "transport", name: "Bus: Accra → Cape Coast", cost: 80, time: "7:00 AM" },
  { id: "4", day: 2, type: "attraction", name: "Cape Coast Castle", cost: 40, time: "11:00 AM" },
  { id: "5", day: 2, type: "attraction", name: "Kakum National Park", cost: 60, time: "2:00 PM" },
  { id: "6", day: 3, type: "hotel", name: "Coconut Grove Beach Resort", cost: 280, time: "Check-in" },
];
```
**Line 36:** Used in state initialization: `const [items, setItems] = useState(initialItems);`
**Line 37:** Default trip name hardcoded: `const [tripName, setTripName] = useState("My Ghana Adventure");`

**Impact:** The page loads with fake itinerary data instead of starting empty

---

### 2. **AdminDisputes.tsx** - MOCK FALLBACK DATA
**File:** [src/pages/admin/AdminDisputes.tsx](src/pages/admin/AdminDisputes.tsx#L35-L36)
**Lines:** 35-36

Contains mock fallback values when backend doesn't return user/provider info:
```javascript
user: "User", // Mock fallback
provider: "Provider", // Mock fallback
```

**Context:** These are used when mapping disputes from API response:
```javascript
const mapped = disputesData.map(d => ({
    ...d,
    user: "User", // Mock fallback
    provider: "Provider", // Mock fallback
    type: d.description.substring(0, 30) + '...',
    date: new Date(d.created_at).toLocaleDateString(),
    priority: d.status === 'open' ? 'high' : 'medium'
}));
```

**Issue:** Display shows generic "User" and "Provider" instead of actual names

---

### 3. **AdminRefunds.tsx** - MOCK FALLBACK DATA
**File:** [src/pages/admin/AdminRefunds.tsx](src/pages/admin/AdminRefunds.tsx#L26)
**Line:** 26

Mock comment indicating known limitation:
```javascript
user: "User", // Mock since the backend might not return user details for refunds directly
```

**Context:** Similar pattern to AdminDisputes:
```javascript
const mapped = refundsData.map(r => ({
    ...r,
    user: "User", // Mock since the backend might not return user details for refunds directly 
    date: new Date(r.created_at).toLocaleDateString(),
    amount: `GH₵${r.amount}`,
}));
```

---

## Configuration Constants (Not Mock Data)

These are legitimate UI configuration arrays, NOT mock/test data:

### [src/pages/trips/PlanTrip.tsx](src/pages/trips/PlanTrip.tsx#L111-L113)
**Lines:** 111-113
```javascript
const travelStyles = ["relaxed", "moderate", "intense"];
const accommodationPreferences = ["luxury", "mid-range", "budget"];
const availableInterests = ["Culture", "Nature", "Nightlife", "History", "Adventure", "Food", "Beach"];
```

### [src/pages/Hotels.tsx](src/pages/Hotels.tsx#L13-L14)
**Lines:** 13-14
```javascript
const AMENITIES = ["WiFi", "Swimming Pool", "Spa", "Gym", "Restaurant", "Beach Access", "Parking", "AC"];
const REGIONS = ["Greater Accra", "Ashanti", "Central", "Western", "Northern", "Eastern", "Volta", "Bono", "Upper East", "Upper West"];
```

### [src/pages/trips/Destinations.tsx](src/pages/trips/Destinations.tsx#L20)
**Line:** 20
```javascript
const regions = ["All Regions", "Greater Accra", "Ashanti", "Central", "Western", "Eastern", "Northern", "Upper East", "Upper West", "Volta", "Brong-Ahafo"];
```

### [src/pages/admin/AdminCreateUser.tsx](src/pages/admin/AdminCreateUser.tsx#L49)
**Line:** 49
```javascript
const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-400"];
```

### [src/pages/admin/AdminAnalytics.tsx](src/pages/admin/AdminAnalytics.tsx#L14)
**Line:** 14
```javascript
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
```

### [src/pages/admin/AdminResetPassword.tsx](src/pages/admin/AdminResetPassword.tsx#L25-L27)
**Lines:** 25-27
```javascript
const bar   = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
const label = ["Weak", "Fair", "Good", "Strong"];
const col   = ["text-red-500", "text-amber-500", "text-yellow-600", "text-green-600"];
```

---

## Data Loading Patterns

### Booking-Related Files (User Dashboard & Admin)
Successfully using API calls, NOT hardcoded data:

- [src/pages/dashboard/UserDashboard.tsx](src/pages/dashboard/UserDashboard.tsx#L50-L51)
  - Line 50-51: `useState<Booking[]>([])` and `useState<Trip[]>([])` with empty initialization
  - Loads via `bookingsService.getUserBookings()` and `tripsService.getUserTrips()`

- [src/pages/admin/AdminBookings.tsx](src/pages/admin/AdminBookings.tsx#L69)
  - Line 69: `setBookingsList(mapped)` loads from `adminService.getAllBookings()`

- [src/pages/dashboard/Bookings.tsx](src/pages/dashboard/Bookings.tsx#L23)
  - Uses API service to fetch bookings, no hardcoded data

- [src/pages/admin/AdminBookingOverview.tsx](src/pages/admin/AdminBookingOverview.tsx#L163-L180)
  - Loads individual booking details from API

- [src/pages/admin/AdminDisputes.tsx](src/pages/admin/AdminDisputes.tsx)
  - Loads from `adminService.getDisputes()` API

- [src/pages/admin/AdminRefunds.tsx](src/pages/admin/AdminRefunds.tsx)
  - Loads from `adminService.getRefunds()` API

- [src/pages/TourGuides.tsx](src/pages/TourGuides.tsx#L16-L33)
  - Loads from `guidesService.searchGuides()` API

---

## Placeholder Generation (Not Mock Data)

### Procedurally Generated Placeholders
These create placeholder objects for empty itinerary days when displaying trips:

- [src/pages/trips/TripDetail.tsx](src/pages/trips/TripDetail.tsx#L311)
  - Line 311: `id: \`placeholder-${dayNumber}\``

- [src/pages/admin/AdminTripOverview.tsx](src/pages/admin/AdminTripOverview.tsx#L315)
  - Line 315: `id: \`placeholder-${dayNumber}\``

These are generated as needed, not hardcoded arrays.

---

## UI Placeholder Attributes

Throughout the codebase there are many HTML `placeholder` attributes (search boxes, form inputs). These are UX hints, not data:

- Examples: "Where to? (e.g. Cape Coast...)", "Search by user, service, or ID...", etc.
- Total: ~100+ matches, all legitimate UI labels

---

## Recommendations

### High Priority
1. **Remove hardcoded sample data from ItineraryPlanner.tsx**
   - Replace `initialItems` with empty array
   - Start page without any pre-filled data
   - Add "Create New Item" flow for users

2. **Fix mock fallback strings in AdminDisputes.tsx and AdminRefunds.tsx**
   - Retrieve actual user/provider information from API
   - If unavailable, show "N/A" or "Unknown" instead of generic "User"/"Provider"
   - Update backend API to include user details in responses

### Medium Priority
3. **Document configuration arrays**
   - Mark legitimate config arrays with comments clarifying they're not mock data
   - Consider moving to separate `constants.ts` files for better organization

---

## Search Methodology

- Searched for patterns: `sample`, `mock`, `placeholder`, `demo`, `fake`, `test`
- Searched for useState initializations with array content
- Searched for comments mentioning mock/test keywords
- Searched for hardcoded data objects with specific names
- Verified booking-related files (AdminBookings, UserDashboard, etc.)
- Total files checked: 80+ pages/components
- Total matches analyzed: 200+

All data-fetching components properly use API services with empty initialization states.
