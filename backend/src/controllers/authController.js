import crypto from 'crypto';
import pool from '../config/database.js';
import { generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { ValidationError, UnauthorizedError, ConflictError, NotFoundError, ForbiddenError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.js';
import { logSecurityEvent } from '../utils/logger.js';

export async function register(req, res) {
  const { email, password, fullName, phone } = req.body;

  if (!email || !password || !fullName) {
    throw new ValidationError('Email, password, and full name are required');
  }

  const client = await pool.connect();
  try {
    // Check if user already exists
    const userExists = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);
    const result = await client.query(
      'INSERT INTO users (email, password_hash, full_name, phone, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, full_name, role',
      [email, hashedPassword, fullName, phone || null, 'user']
    );

    const user = result.rows[0];
    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await client.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    // Send Welcome Email
    const welcomeHtml = `
      <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f6; padding: 40px; border-radius: 12px; color: #333; max-width: 600px; margin: 0 auto;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2D3FE6; margin: 0; font-size: 28px;">Welcome to TripEase! 🇬🇭</h1>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          Hello <strong>${fullName}</strong>,
        </p>
        <p style="font-size: 16px; line-height: 1.6; color: #444;">
          We're thrilled to have you join TripEase Ghana! Your account has been successfully created, and you're now ready to start planning your next unforgettable adventure across Ghana.
        </p>
        
        <div style="background-color: white; padding: 25px; border-radius: 10px; border: 1px solid #e0e0e0; margin: 30px 0;">
          <h3 style="margin-top: 0; color: #2D3FE6;">What's Next?</h3>
          <ul style="padding-left: 20px; color: #555; line-height: 1.8;">
            <li>Explore top-rated <strong>Hotels</strong> in Accra, Kumasi, and beyond.</li>
            <li>Book certified <strong>Tour Guides</strong> for the best local insights.</li>
            <li>Discover exciting <strong>Activities</strong> and hidden gems.</li>
            <li>Organize your <strong>Transport</strong> with ease.</li>
          </ul>
          <div style="text-align: center; margin-top: 25px;">
            <a href="${req.get('origin') || 'http://localhost:5173'}/dashboard" 
               style="background-color: #2D3FE6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
              Go to My Dashboard
            </a>
          </div>
        </div>
        
        <p style="font-size: 14px; color: #777;">
          If you have any questions, simply reply to this email. We're here to help!
        </p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          &copy; ${new Date().getFullYear()} TripEase Ghana. All rights reserved. <br/>
          Ghana's Premier Trip Planning Platform.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to TripEase Ghana! 🌍',
        message: `Welcome to TripEase Ghana, ${fullName}! Your account is ready. Explore hotels, guides, and activities now at ${req.get('origin') || 'http://localhost:5173'}`,
        html: welcomeHtml
      });
    } catch (emailErr) {
      // We don't want to fail the whole registration if the welcome email fails,
      // but we should log it.
      console.error('Welcome email failed to send:', emailErr);
    }

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token: accessToken, refreshToken },
    });
  } finally {
    client.release();
  }
}

export async function login(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    // Check if account is locked
    if (user && user.lock_until && new Date(user.lock_until) > new Date()) {
      await logSecurityEvent({
        userId: user.id,
        eventType: 'LOGIN_LOCKED',
        ipAddress,
        userAgent,
        details: { reason: 'Account temporarily locked due to failed attempts' }
      });
      throw new ForbiddenError(`Account is temporarily locked. Please try again after ${new Date(user.lock_until).toLocaleTimeString()}`);
    }

    if (!user) {
      await logSecurityEvent({
        eventType: 'LOGIN_FAILURE',
        ipAddress,
        userAgent,
        details: { email, reason: 'User not found' }
      });
      throw new UnauthorizedError('Invalid email or password');
    }

    const passwordMatch = await comparePassword(password, user.password_hash);

    if (!passwordMatch) {
      // Increment failed attempts
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockUntil = null;

      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
      }

      await client.query(
        'UPDATE users SET failed_login_attempts = $1, lock_until = $2 WHERE id = $3',
        [attempts, lockUntil, user.id]
      );

      await logSecurityEvent({
        userId: user.id,
        eventType: 'LOGIN_FAILURE',
        ipAddress,
        userAgent,
        details: { attempts, locked: !!lockUntil }
      });

      if (lockUntil) {
        throw new ForbiddenError('Account locked due to too many failed attempts. Try again in 15 minutes.');
      }
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.role === 'admin') {
      throw new UnauthorizedError('Admin users must use admin login endpoint');
    }

    // Success - reset attempts and update tracking
    await client.query(
      'UPDATE users SET failed_login_attempts = 0, lock_until = NULL, last_login = CURRENT_TIMESTAMP, last_ip = $1, last_user_agent = $2 WHERE id = $3',
      [ipAddress, userAgent, user.id]
    );

    // Check for Two-Factor Authentication
    if (user.two_factor_enabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await client.query(
        'UPDATE users SET two_factor_code = $1, two_factor_expiry = $2 WHERE id = $3',
        [otpCode, otpExpiry, user.id]
      );

      // Send OTP via email
      const otpTemplate = `
        <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="background: #2D3FE6; color: white; padding: 8px 16px; border-radius: 99px; font-weight: 600; font-size: 14px;">SECURITY VERIFICATION</span>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 24px; text-align: center;">Your Verification Code</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
              Enter the following code to complete your login to TripEase Ghana.
            </p>
            <div style="background: #f1f5f9; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 32px;">
              <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2D3FE6;">${otpCode}</span>
            </div>
            <p style="color: #94a3b8; font-size: 13px; text-align: center; margin: 0;">
              This code will expire in 10 minutes. If you didn't request this, please secure your account immediately.
            </p>
          </div>
          <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
            &copy; ${new Date().getFullYear()} TripEase Ghana. All rights reserved.
          </p>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: `${otpCode} is your TripEase verification code`,
        message: `Your verification code is ${otpCode}. It expires in 10 minutes.`,
        html: otpTemplate
      });

      await logSecurityEvent({
        userId: user.id,
        eventType: 'MFA_REQUESTED',
        ipAddress,
        userAgent
      });

      return res.json({
        success: true,
        mfaRequired: true,
        email: user.email
      });
    }

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await client.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    await logSecurityEvent({
      userId: user.id,
      eventType: 'LOGIN_SUCCESS',
      ipAddress,
      userAgent
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          requires_password_change: user.requires_password_change
        },
        token: accessToken,
        refreshToken,
      },
    });
  } finally {
    client.release();
  }
}

export async function adminLogin(req, res) {
  const { email, password } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT * FROM users WHERE email = $1 AND role = $2', [email, 'admin']);
    const user = result.rows[0];

    if (!user) {
      await logSecurityEvent({
        eventType: 'ADMIN_LOGIN_FAILURE',
        ipAddress,
        userAgent,
        details: { email, reason: 'Admin user not found' }
      });
      throw new UnauthorizedError('Invalid admin credentials');
    }

    const passwordMatch = await comparePassword(password, user.password_hash);
    if (!passwordMatch) {
      await logSecurityEvent({
        userId: user.id,
        eventType: 'ADMIN_LOGIN_FAILURE',
        ipAddress,
        userAgent,
        details: { email, reason: 'Invalid password' }
      });
      throw new UnauthorizedError('Invalid admin credentials');
    }

    // Check for Two-Factor Authentication
    if (user.two_factor_enabled) {
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

      await client.query(
        'UPDATE users SET two_factor_code = $1, two_factor_expiry = $2 WHERE id = $3',
        [otpCode, otpExpiry, user.id]
      );

      const otpTemplate = `
        <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <span style="background: #2D3FE6; color: white; padding: 8px 16px; border-radius: 99px; font-weight: 600; font-size: 14px;">ADMIN VERIFICATION</span>
          </div>
          <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2 style="margin: 0 0 16px 0; color: #0f172a; font-size: 24px; text-align: center;">Admin Security Code</h2>
            <p style="color: #64748b; font-size: 16px; line-height: 1.6; text-align: center; margin-bottom: 32px;">
              Enter the following code to access the TripEase Ghana Administration Panel.
            </p>
            <div style="background: #f1f5f9; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 32px;">
              <span style="font-family: 'Courier New', monospace; font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2D3FE6;">${otpCode}</span>
            </div>
            <p style="color: #ef4444; font-size: 13px; text-align: center; margin: 0; font-weight: 500;">
              This is a sensitive administrative action. Code expires in 10 minutes.
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: `[ADMIN] ${otpCode} is your security verification code`,
        message: `Admin verification code: ${otpCode}`,
        html: otpTemplate
      });

      await logSecurityEvent({
        userId: user.id,
        eventType: 'ADMIN_MFA_REQUESTED',
        ipAddress,
        userAgent
      });

      return res.json({
        success: true,
        mfaRequired: true,
        email: user.email
      });
    }

    // Update tracking
    await client.query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP, last_ip = $1, last_user_agent = $2 WHERE id = $3',
      [ipAddress, userAgent, user.id]
    );

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await client.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    await logSecurityEvent({
      userId: user.id,
      eventType: 'ADMIN_LOGIN_SUCCESS',
      ipAddress,
      userAgent
    });

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
        token: accessToken,
        refreshToken,
      },
    });
  } finally {
    client.release();
  }
}

export async function verifyMFA(req, res) {
  const { email, code } = req.body;
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const userAgent = req.headers['user-agent'];

  if (!email || !code) {
    throw new ValidationError('Email and verification code are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 AND two_factor_code = $2 AND two_factor_expiry > NOW()',
      [email, code]
    );
    const user = result.rows[0];

    if (!user) {
      await logSecurityEvent({
        eventType: 'MFA_FAILURE',
        ipAddress,
        userAgent,
        details: { email, reason: 'Invalid or expired code' }
      });
      throw new UnauthorizedError('Invalid or expired verification code');
    }

    // Success - clear MFA and reset flags
    await client.query(
      'UPDATE users SET two_factor_code = NULL, two_factor_expiry = NULL, failed_login_attempts = 0, lock_until = NULL, last_login = CURRENT_TIMESTAMP, last_ip = $1, last_user_agent = $2 WHERE id = $3',
      [ipAddress, userAgent, user.id]
    );

    const accessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id });

    await client.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [refreshToken, user.id]);

    await logSecurityEvent({
      userId: user.id,
      eventType: 'MFA_SUCCESS',
      ipAddress,
      userAgent
    });

    res.json({
      success: true,
      message: 'Email verification successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          avatar_url: user.avatar_url,
          requires_password_change: user.requires_password_change
        },
        token: accessToken,
        refreshToken,
      },
    });
  } finally {
    client.release();
  }
}

export async function getProfile(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, email, full_name, phone, avatar_url, bio, role, two_factor_enabled, created_at FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      throw new ValidationError('User not found');
    }

    res.json({
      success: true,
      data: user,
    });
  } finally {
    client.release();
  }
}

export async function updateProfile(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { fullName, phone, bio, avatarUrl } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET full_name = COALESCE($1, full_name), phone = COALESCE($2, phone), bio = COALESCE($3, bio), avatar_url = COALESCE($4, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING id, email, full_name, phone, avatar_url, bio, role, created_at',
      [fullName || null, phone || null, bio || null, avatarUrl || null, req.user.id]
    );

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } finally {
    client.release();
  }
}

export async function changePassword(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new ValidationError('Current password and new password are required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) {
      throw new ValidationError('User not found');
    }

    const passwordMatch = await comparePassword(currentPassword, user.password_hash);
    if (!passwordMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const hashedPassword = await hashPassword(newPassword);
    await client.query('UPDATE users SET password_hash = $1, requires_password_change = false, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [hashedPassword, req.user.id]);

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } finally {
    client.release();
  }
}

export async function updatePreferences(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { preferences } = req.body;

  const client = await pool.connect();
  try {
    const result = await client.query(
      'UPDATE users SET preferences = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING preferences',
      [JSON.stringify(preferences), req.user.id]
    );

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: result.rows[0].preferences,
    });
  } finally {
    client.release();
  }
}

export async function toggleMFA(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('User not authenticated');
  }

  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    throw new ValidationError('Enabled status must be a boolean');
  }

  const client = await pool.connect();
  try {
    await client.query(
      'UPDATE users SET two_factor_enabled = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [enabled, req.user.id]
    );

    // Log security event
    await logSecurityEvent({
      userId: req.user.id,
      eventType: enabled ? 'MFA_ENABLED' : 'MFA_DISABLED',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      details: { method: 'EMAIL' }
    });

    res.json({
      success: true,
      message: `Multi-Factor Authentication ${enabled ? 'enabled' : 'disabled'} successfully`,
      data: { two_factor_enabled: enabled }
    });
  } finally {
    client.release();
  }
}

export async function forgotPassword(req, res) {
  const { email } = req.body;

  if (!email) {
    throw new ValidationError('Email is required');
  }

  const client = await pool.connect();
  try {
    const result = await client.query('SELECT id, email FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a reset link has been sent.',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await client.query(
      'UPDATE users SET reset_password_token = $1, reset_password_expiry = $2 WHERE id = $3',
      [hashedToken, expires, user.id]
    );

    const resetUrl = `${req.get('origin') || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const message = `Forgot your password? Click the link below to reset it:\n${resetUrl}\n\nThis link is valid for 15 minutes.`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; background-color: #f4f7f6; padding: 40px; border-radius: 12px; color: #333;">
        <h2 style="color: #2D3FE6; margin-bottom: 24px;">Password Reset Request</h2>
        <p style="font-size: 16px; line-height: 1.6; color: #555;">
          Hello, we received a request to reset the password for your TripEase Ghana account. 
          If you didn't request this, you can safely ignore this email.
        </p>
        <div style="margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #2D3FE6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="font-size: 14px; color: #888;">
          Or copy and paste this link in your browser: <br/>
          <a href="${resetUrl}" style="color: #2D3FE6; word-break: break-all;">${resetUrl}</a>
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">
          This link is valid for 15 minutes. <br/>
          &copy; ${new Date().getFullYear()} TripEase Ghana. All rights reserved.
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request | TripEase Ghana',
        message,
        html
      });

      res.status(200).json({
        success: true,
        message: 'Reset link sent to your email!',
      });
    } catch (err) {
      console.error('Email error:', err);
      await client.query('UPDATE users SET reset_password_token = NULL, reset_password_expiry = NULL WHERE id = $1', [user.id]);
      throw new Error('There was an error sending the email.');
    }
  } finally {
    client.release();
  }
}

export async function resetPassword(req, res) {
  const { token, password } = req.body;

  if (!token || !password) {
    throw new ValidationError('Token and new password are required');
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id FROM users WHERE reset_password_token = $1 AND reset_password_expiry > $2',
      [hashedToken, new Date()]
    );
    const user = result.rows[0];

    if (!user) {
      throw new ValidationError('Token is invalid or has expired');
    }

    const hashedPassword = await hashPassword(password);
    await client.query(
      'UPDATE users SET password_hash = $1, requires_password_change = false, reset_password_token = NULL, reset_password_expiry = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, user.id]
    );

    res.status(200).json({
      success: true,
      message: 'Password reset successful!',
    });
  } finally {
    client.release();
  }
}

export async function refreshToken(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw new ValidationError('Refresh token is required');
  }

  const client = await pool.connect();
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const result = await client.query('SELECT id, email, role, refresh_token FROM users WHERE id = $1', [decoded.id]);
    const user = result.rows[0];

    if (!user || user.refresh_token !== refreshToken) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const newAccessToken = generateToken({ id: user.id, email: user.email, role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user.id });

    await client.query('UPDATE users SET refresh_token = $1 WHERE id = $2', [newRefreshToken, user.id]);

    res.json({
      success: true,
      data: {
        token: newAccessToken,
        refreshToken: newRefreshToken,
      },
    });
  } finally {
    client.release();
  }
}

export async function logout(req, res) {
  if (!req.user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const client = await pool.connect();
  try {
    await client.query('UPDATE users SET refresh_token = NULL WHERE id = $1', [req.user.id]);
    res.json({ success: true, message: 'Logged out successfully' });
  } finally {
    client.release();
  }
}
