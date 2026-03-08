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
        console.log('--- MOCK EMAIL (RESEND) ---');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        if (options.html) console.log(`HTML: ${options.html}`);
        console.log('---------------------------');

        if (process.env.NODE_ENV === 'production') {
            console.warn('WARNING: RESEND_API_KEY is missing in production environment!');
        }
        return;
    }

    const resend = new Resend(resendApiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'TripEase Ghana <onboarding@resend.dev>',
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`,
        });

        if (error) {
            console.error('Resend Error:', error);
            throw new Error(`Email sending failed: ${error.message}`);
        }

        return data;
    } catch (err) {
        console.error('Email caught error:', err);
        throw err;
    }
};
