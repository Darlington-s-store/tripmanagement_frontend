import { Resend } from 'resend';

/**
 * Send an email using Resend
 * @param {Object} options 
 * @param {string} options.email - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.message - Text message
 * @param {string} [options.html] - Optional HTML message
 */
export const sendEmail = async (options) => {
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
        console.warn('⚠️  EMAIL CONFIG MISSING');
        console.warn(`📧 MOCK EMAIL MODE (RESEND_API_KEY not set)`);
        console.log(`   To: ${options.email}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   Message: ${options.message}`);
        if (options.html) console.log(`   HTML preview: ${options.html.substring(0, 100)}...`);
        console.warn('⚠️  SET RESEND_API_KEY IN .ENV TO ENABLE REAL EMAILS');

        if (process.env.NODE_ENV === 'production') {
            console.error('❌ ERROR: RESEND_API_KEY is missing in PRODUCTION! Emails will not be sent!');
            throw new Error('Email service not configured. Contact admin.');
        }
        return { id: 'mock-' + Date.now(), success: true, message: 'Mock mode' };
    }

    if (!resendApiKey.startsWith('re_')) {
        console.error('❌ INVALID RESEND_API_KEY FORMAT - Must start with "re_"');
        console.error(`   Current key (first 20 chars): ${resendApiKey.substring(0, 20)}...`);
    }

    const resend = new Resend(resendApiKey);

    try {
        console.log(`📧 Sending email to: ${options.email}`);
        console.log(`   Subject: ${options.subject}`);
        console.log(`   From: ${process.env.EMAIL_FROM || 'TripEase Ghana <onboarding@resend.dev>'}`);
        
        const emailPayload = {
            from: process.env.EMAIL_FROM || 'TripEase Ghana <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
        };

        console.log(`   Sending with Resend API...`);
        const { data, error } = await resend.emails.send(emailPayload);

        if (error) {
            console.error('❌ Resend API Error:', error);
            console.error('   Error Type:', error.name);
            console.error('   Error Message:', error.message);
            console.error('   Error details:', JSON.stringify(error, null, 2));
            throw new Error(`Email sending failed: ${error.message || JSON.stringify(error)}`);
        }

        console.log(`✅ Email sent successfully to ${options.email}`);
        console.log(`   Message ID: ${data.id}`);
        console.log(`   Status: DELIVERED`);
        
        return data;
    } catch (err) {
        console.error('❌ Email sending exception:', err.message);
        console.error('   Exception type:', err.constructor.name);
        console.error('   Full error:', err);
        // Don't throw - just log so bookings/registrations still work
        return { success: false, error: err.message };
    }
};
