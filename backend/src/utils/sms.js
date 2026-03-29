import { logSecurityEvent } from './logger.js';

/**
 * Mock SMS service for development and testing.
 * In a production environment, this would integrate with Twilio or AWS SNS.
 */
export async function sendSMS({ phone, message, userId = null, ipAddress = null, userAgent = null }) {
  try {
    if (!phone) {
      console.log('Skipping SMS: No phone number provided.');
      return;
    }

    // Mock sending process
    console.log('\n================ BEGIN MOCK SMS ================');
    console.log(`TO: ${phone}`);
    console.log(`MESSAGE:\n${message}`);
    console.log('================= END MOCK SMS =================\n');

    // If userId is provided, log this security monitoring event
    if (userId) {
      await logSecurityEvent({
        userId,
        eventType: 'SMS_SENT',
        ipAddress,
        userAgent,
        details: { phone }
      });
    }
    
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // Suppress actual failures in mock
    return false;
  }
}
