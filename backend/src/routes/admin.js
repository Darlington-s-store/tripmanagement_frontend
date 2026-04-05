import express from 'express';
import { authenticateToken, authorizeRole } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRole(['admin']));

// Dashboard
router.get('/dashboard', adminController.getDashboard);

// Users
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);
router.get('/users/:id/activity', adminController.getUserActivity);

// Bookings
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingById);
router.put('/bookings/:id', adminController.updateBooking);

// Trips
router.get('/trips', adminController.getAllTrips);
router.get('/trips/:id', adminController.getTripById);
router.put('/trips/:id', adminController.updateTrip);
router.delete('/trips/:id', adminController.deleteTrip);

// Reviews
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);
router.put('/reviews/:id/status', adminController.updateReviewStatus);

// Refunds
router.get('/refunds', adminController.getRefunds);
router.put('/refunds/:id', adminController.updateRefund);

// Disputes
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id', adminController.updateDispute);

// Analytics
router.get('/analytics', adminController.getAnalytics);

// Settings
router.put('/settings', adminController.updateSettings);

// Listings (Providers)
router.get('/listings', adminController.getListings);
router.put('/listings/:id', adminController.updateListing);

// Trip Planning Module Management
router.get('/destinations', adminController.getAllDestinations);
router.get('/destinations/:id', adminController.getDestinationById);
router.post('/destinations', adminController.createDestination);
router.put('/destinations/:id', adminController.updateDestination);
router.delete('/destinations/:id', adminController.deleteDestination);

router.get('/attractions', adminController.getAllAttractions);
router.get('/attractions/:id', adminController.getAttractionById);
router.post('/attractions', adminController.createAttraction);
router.put('/attractions/:id', adminController.updateAttraction);
router.delete('/attractions/:id', adminController.deleteAttraction);

router.get('/itineraries/suggested', adminController.getAllSuggestedItineraries);
router.get('/itineraries/suggested/:id', adminController.getSuggestedItineraryById);
router.post('/itineraries/suggested', adminController.createSuggestedItinerary);
router.put('/itineraries/suggested/:id', adminController.updateSuggestedItinerary);
router.delete('/itineraries/suggested/:id', adminController.deleteSuggestedItinerary);

router.get('/categories', adminController.getAllCategories);
router.get('/categories/:id', adminController.getCategoryById);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

router.get('/travel-info', adminController.getAllTravelInfo);
router.get('/travel-info/:id', adminController.getTravelInfoById);
router.post('/travel-info', adminController.createTravelInfo);
router.put('/travel-info/:id', adminController.updateTravelInfo);
router.delete('/travel-info/:id', adminController.deleteTravelInfo);

// Transports
router.get('/transports', adminController.getAllTransport);
router.post('/transports', adminController.createTransport);
router.put('/transports/:id', adminController.updateTransport);
router.delete('/transports/:id', adminController.deleteTransport);


export default router;
