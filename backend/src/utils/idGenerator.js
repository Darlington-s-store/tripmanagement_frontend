/**
 * Simple ID Generator Utilities
 * Generates human-readable IDs with timestamp and random suffix
 * Format: PREFIX_TIMESTAMP_RANDOMSTRING
 */

function generateRandomString(length = 5) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateId(prefix) {
  const timestamp = Math.floor(Date.now() / 1000);
  const random = generateRandomString(5);
  return `${prefix}_${timestamp}_${random}`;
}

export const generateUserId = () => generateId('USR');
export const generateBookingId = () => generateId('BK');
export const generateTripId = () => generateId('TRP');
export const generateItineraryId = () => generateId('ITN');
export const generateHotelId = () => generateId('HTL');
export const generateRoomId = () => generateId('RM');
export const generateGuideId = () => generateId('GD');
export const generateReviewId = () => generateId('RVW');
export const generateNotificationId = () => generateId('NOT');
export const generateReceiptId = () => generateId('RCP');

export default {
  generateUserId,
  generateBookingId,
  generateTripId,
  generateItineraryId,
  generateHotelId,
  generateRoomId,
  generateGuideId,
  generateReviewId,
  generateNotificationId,
  generateReceiptId
};
