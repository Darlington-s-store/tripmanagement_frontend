import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { generateReceiptId } from '../utils/idGenerator.js';

/**
 * Generate a receipt for a booking
 */
export async function generateReceipt(bookingId, bookingData) {
  const client = await pool.connect();
  try {
    // Check if receipt already exists for this booking
    const existing = await client.query(
      'SELECT * FROM receipts WHERE booking_id = $1',
      [bookingId]
    );

    if (existing.rows.length > 0) {
      console.log(`📄 Receipt already exists for booking ${bookingId}`);
      return existing.rows[0];
    }

    // Generate receipt ID and number
    const receiptId = generateReceiptId();
    const receiptNumber = `RCP-${new Date().getFullYear()}-${receiptId.substring(receiptId.length - 8)}`;

    // Calculate base rate and tax
    const totalPrice = Number(bookingData.total_price);
    const taxFee = totalPrice * 0.15;
    const baseRate = totalPrice - taxFee;

    // Insert receipt
    const result = await client.query(
      `INSERT INTO receipts (
        id, booking_id, user_id, receipt_number, service_name, booking_type,
        reference_id, check_in_date, check_out_date, number_of_guests,
        special_requests, total_price, base_rate, tax_fee, room_type,
        payment_status, booking_status, notes
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING *`,
      [
        receiptId,
        bookingId,
        bookingData.user_id,
        receiptNumber,
        bookingData.service_name,
        bookingData.booking_type,
        bookingData.reference_id,
        bookingData.check_in_date || null,
        bookingData.check_out_date || null,
        bookingData.number_of_guests || 1,
        bookingData.special_requests || null,
        totalPrice,
        baseRate,
        taxFee,
        bookingData.room_type || null,
        bookingData.payment_status || 'pending',
        bookingData.booking_status || 'pending',
        `Receipt generated for ${bookingData.service_name} booking on ${new Date().toLocaleString()}`
      ]
    );

    const receipt = result.rows[0];
    console.log(`✅ Receipt generated: ${receiptNumber}`);
    return receipt;
  } finally {
    client.release();
  }
}

/**
 * Get receipt by ID
 */
export async function getReceiptById(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Receipt not found or not authorized');
    }

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

/**
 * Get receipt by booking ID
 */
export async function getReceiptByBookingId(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { bookingId } = req.params;
  const client = await pool.connect();

  try {
    const result = await client.query(
      'SELECT * FROM receipts WHERE booking_id = $1 AND user_id = $2',
      [bookingId, req.user.id]
    );

    if (result.rows.length === 0) {
      throw new NotFoundError('Receipt not found for this booking');
    }

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

/**
 * Get all receipts for a user
 */
export async function getUserReceipts(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT * FROM receipts 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

/**
 * Record receipt download
 */
export async function recordReceiptDownload(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Verify receipt belongs to user
    const check = await client.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Receipt not found or not authorized');
    }

    // Update downloaded_at timestamp
    const result = await client.query(
      'UPDATE receipts SET downloaded_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    console.log(`✅ Receipt download recorded: ${id}`);
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

/**
 * Record receipt print
 */
export async function recordReceiptPrint(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Verify receipt belongs to user
    const check = await client.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Receipt not found or not authorized');
    }

    // Update printed_at timestamp
    const result = await client.query(
      'UPDATE receipts SET printed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id]
    );

    console.log(`✅ Receipt print recorded: ${id}`);
    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

/**
 * Delete receipt (soft delete via notes)
 */
export async function deleteReceipt(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();

  try {
    // Verify receipt belongs to user
    const check = await client.query(
      'SELECT * FROM receipts WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (check.rows.length === 0) {
      throw new NotFoundError('Receipt not found or not authorized');
    }

    // Actually delete the receipt (admin function)
    await client.query(
      'DELETE FROM receipts WHERE id = $1',
      [id]
    );

    console.log(`✅ Receipt deleted: ${id}`);
    res.json({ success: true, message: 'Receipt deleted successfully' });
  } finally {
    client.release();
  }
}

/**
 * Get receipt statistics for user
 */
export async function getReceiptStats(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT 
        COUNT(*) as total_receipts,
        SUM(total_price) as total_amount,
        COUNT(DISTINCT DATE_TRUNC('month', created_at)) as active_months,
        MAX(created_at) as last_receipt_date
       FROM receipts 
       WHERE user_id = $1`,
      [req.user.id]
    );

    res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}
