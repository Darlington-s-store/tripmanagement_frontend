import app from './app.js';
import pool, { initializeDatabase } from './config/database.js';

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Check email configuration
    if (!process.env.RESEND_API_KEY) {
      console.warn('⚠️  ==========================================');
      console.warn('⚠️  EMAIL SERVICE NOT CONFIGURED');
      console.warn('⚠️  RESEND_API_KEY is missing in .env');
      console.warn('⚠️  Emails will be sent in MOCK MODE only');
      console.warn('⚠️  ==========================================');
    } else {
      console.log('✅ Email service configured (Resend)');
    }

    await initializeDatabase();
    console.log('✅ Database initialized');

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 API available at http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await pool.end();
  process.exit(0);
});

startServer();
