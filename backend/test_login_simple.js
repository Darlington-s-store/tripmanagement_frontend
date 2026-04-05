import { sendEmail } from './src/utils/email.js';

async function testLoginEmail() {
  console.log('🧪 Testing Login Email...\n');
  console.log('📋 Configuration Check:');
  console.log(`   RESEND_API_KEY: ${process.env.RESEND_API_KEY ? '✅ SET' : '❌ NOT SET'}`);
  console.log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'onboarding@resend.dev'}`);
  console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'not set'}\n`);

  try {
    console.log('📧 Sending test login email to onboarding@resend.dev...\n');
    const result = await sendEmail({
      email: 'delivered@resend.dev',
      subject: 'Login Alert - TripEase Ghana Account (TEST)',
      message: 'This is a test login notification email.',
      html: '<p>This is a test login notification email.</p>'
    });
    
    console.log('\n✅ TEST RESULT:');
    console.log('   Email processed successfully!');
    console.log('   Response:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.error('\n❌ TEST FAILED:');
    console.error('   Error:', error.message);
  }
}

testLoginEmail();
