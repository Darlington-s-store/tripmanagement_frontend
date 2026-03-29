require('dotenv').config();
const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM || 'onboarding@resend.dev';

if (!resendApiKey) {
    console.error('❌ RESEND_API_KEY is missing');
    process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testEmail() {
    console.log(`🚀 Testing email with Key: ${resendApiKey.substring(0, 10)}...`);
    console.log(`📧 From: ${emailFrom}`);
    
    try {
        const { data, error } = await resend.emails.send({
            from: emailFrom,
            to: 'delivered@resend.dev', // Resend's test address
            subject: 'Test Email from Trip Management',
            text: 'This is a test email to verify the Resend configuration.',
        });

        if (error) {
            console.error('❌ Resend Error:', JSON.stringify(error, null, 2));
        } else {
            console.log('✅ Email sent successfully!', data);
        }
    } catch (err) {
        console.error('❌ Caught Error:', err);
    }
}

testEmail();
