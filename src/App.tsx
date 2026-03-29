import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Hotels from "./pages/Hotels";
import Attractions from "./pages/Attractions";
import TourGuides from "./pages/TourGuides";
import Transport from "./pages/Transport";
import ItineraryPlanner from "./pages/ItineraryPlanner";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserBookings from "./pages/dashboard/UserBookings";
import UserProfile from "./pages/dashboard/UserProfile";
import UserItineraries from "./pages/dashboard/UserItineraries";
import UserReviews from "./pages/dashboard/UserReviews";
import UserSettings from "./pages/dashboard/UserSettings";
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import ProviderListings from "./pages/provider/ProviderListings";
import ProviderBookings from "./pages/provider/ProviderBookings";
import ProviderReviews from "./pages/provider/ProviderReviews";
import ProviderProfile from "./pages/provider/ProviderProfile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminCreateUser from "./pages/admin/AdminCreateUser";
import AdminEditUser from "./pages/admin/AdminEditUser";
import AdminUserActivity from "./pages/admin/AdminUserActivity";
import AdminDestinations from "./pages/admin/AdminDestinations";
import AdminAttractions from "./pages/admin/AdminAttractions";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminSuggestedItineraries from "./pages/admin/AdminSuggestedItineraries";
import AdminTravelInfo from "./pages/admin/AdminTravelInfo";
import AdminListings from "./pages/admin/AdminListings";
import AdminApprovals from "./pages/admin/AdminApprovals";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminTrips from "./pages/admin/AdminTrips";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHotels from "./pages/admin/AdminHotels";
import AdminLogin from "./pages/admin/AdminLogin";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ForcePasswordChange from "./pages/auth/ForcePasswordChange";
import PlanTrip from "./pages/trips/PlanTrip";
import TripDetail from "./pages/trips/TripDetail";
import Destinations from "./pages/trips/Destinations";
import HotelDetail from "./pages/HotelDetail";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import GuideDetail from "./pages/GuideDetail";
import BookingConfirmation from "./pages/BookingConfirmation";
import AdminRefunds from "./pages/admin/AdminRefunds";
import AdminDisputes from "./pages/admin/AdminDisputes";
import DestinationDetail from "./pages/trips/DestinationDetail";
import BookingDetail from "./pages/dashboard/BookingDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/hotels/:id" element={<HotelDetail />} />
            <Route path="/attractions" element={<Attractions />} />
            <Route path="/guides" element={<TourGuides />} />
            <Route path="/guides/:id" element={<GuideDetail />} />
            <Route path="/transport" element={<Transport />} />
            <Route path="/itinerary" element={<ItineraryPlanner />} />
            <Route path="/destinations" element={<Destinations />} />
            <Route path="/destinations/:id" element={<DestinationDetail />} />
            <Route path="/trips/new" element={<PlanTrip />} />
            <Route path="/trips/:id" element={<TripDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/change-password-required" element={<ForcePasswordChange />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* User Dashboard */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user', 'admin']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/bookings" element={<ProtectedRoute><UserBookings /></ProtectedRoute>} />
            <Route path="/dashboard/bookings/:id" element={<ProtectedRoute><BookingDetail /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/dashboard/itineraries" element={<ProtectedRoute><UserItineraries /></ProtectedRoute>} />
            <Route path="/dashboard/reviews" element={<ProtectedRoute><UserReviews /></ProtectedRoute>} />
            <Route path="/dashboard/settings" element={<ProtectedRoute><UserSettings /></ProtectedRoute>} />

            {/* Provider Dashboard */}
            <Route path="/provider/dashboard" element={<ProtectedRoute allowedRoles={['provider', 'admin']}><ProviderDashboard /></ProtectedRoute>} />
            <Route path="/provider/listings" element={<ProtectedRoute allowedRoles={['provider', 'admin']}><ProviderListings /></ProtectedRoute>} />
            <Route path="/provider/bookings" element={<ProtectedRoute allowedRoles={['provider', 'admin']}><ProviderBookings /></ProtectedRoute>} />
            <Route path="/provider/reviews" element={<ProtectedRoute allowedRoles={['provider', 'admin']}><ProviderReviews /></ProtectedRoute>} />
            <Route path="/provider/profile" element={<ProtectedRoute allowedRoles={['provider', 'admin']}><ProviderProfile /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/users/new" element={<ProtectedRoute allowedRoles={['admin']}><AdminCreateUser /></ProtectedRoute>} />
            <Route path="/admin/users/:id/edit" element={<ProtectedRoute allowedRoles={['admin']}><AdminEditUser /></ProtectedRoute>} />
            <Route path="/admin/users/:id/activity" element={<ProtectedRoute allowedRoles={['admin']}><AdminUserActivity /></ProtectedRoute>} />
            <Route path="/admin/destinations" element={<ProtectedRoute allowedRoles={['admin']}><AdminDestinations /></ProtectedRoute>} />
            <Route path="/admin/hotels" element={<ProtectedRoute allowedRoles={['admin']}><AdminHotels /></ProtectedRoute>} />
            <Route path="/admin/attractions" element={<ProtectedRoute allowedRoles={['admin']}><AdminAttractions /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/itineraries" element={<ProtectedRoute allowedRoles={['admin']}><AdminSuggestedItineraries /></ProtectedRoute>} />
            <Route path="/admin/travel-info" element={<ProtectedRoute allowedRoles={['admin']}><AdminTravelInfo /></ProtectedRoute>} />
            <Route path="/admin/listings" element={<ProtectedRoute allowedRoles={['admin']}><AdminListings /></ProtectedRoute>} />
            <Route path="/admin/approvals" element={<ProtectedRoute allowedRoles={['admin']}><AdminApprovals /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/trips" element={<ProtectedRoute allowedRoles={['admin']}><AdminTrips /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin']}><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin']}><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/refunds" element={<ProtectedRoute allowedRoles={['admin']}><AdminRefunds /></ProtectedRoute>} />
            <Route path="/admin/disputes" element={<ProtectedRoute allowedRoles={['admin']}><AdminDisputes /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
