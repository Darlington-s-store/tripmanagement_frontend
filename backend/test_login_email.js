import dotenv from 'dotenv';
dotenv.config();

import { sendEmail } from './src/utils/email.js';

async function testLoginEmail() {
  console.log('🧪 Testing Login Email...\n');
  console.log('📋 Configuration Check:');
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV}\n`);

  const testEmail = 'test@example.com';
  
  const loginHtml = `
    <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h2 style="margin: 0; color: #2D3FE6; font-size: 28px;">Login Successful ✅</h2>
      </div>
      <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
          Hello <strong>Test User</strong>,
        </p>
        <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
          You've successfully logged in to your TripEase Ghana account.
        </p>
        <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #2D3FE6;">
          <p style="margin: 0; color: #64748b; font-size: 14px;">
            <strong>Login Time:</strong> ${new Date().toLocaleString()}<br/>
            <strong>Location:</strong> 127.0.0.1<br/>
            <strong>If this wasn't you, please secure your account immediately.</strong>
          </p>
        </div>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Ready to explore Ghana? <br/>
          Browse hotels, guides, and activities to plan your next adventure!
        </p>
      </div>
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
        &copy; 2026 TripEase Ghana. All rights reserved.
      </p>
    </div>
  `;

  try {
    console.log('📧 Sending test login email...\n');
    const result = await sendEmail({
      email: testEmail,
      subject: 'Login Alert - TripEase Ghana Account (TEST)',
      message: 'This is a test login notification email.',
      html: loginHtml
    });
    
    console.log('\n✅ TEST RESULT:');
    console.log('   Email sent successfully!');
    console.log('   Response:', result);
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('   Error:', error.message);
    console.error('   Full error:', error);
  }
}

testLoginEmail().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
