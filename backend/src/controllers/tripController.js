import pool from '../config/database.js';
import { UnauthorizedError, NotFoundError, ValidationError } from '../utils/errors.js';
import { sendEmail } from '../utils/email.js';
import { createNotification } from './notificationController.js';

function normalizeText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeBudget(value) {
  if (value === undefined || value === null || value === '') return null;

  const parsed = Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function normalizeTravellerCount(value) {
  if (value === undefined || value === null || value === '') return 1;

  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new ValidationError('Traveller count must be greater than 0');
  }

  return parsed;
}

function normalizeDate(dateValue) {
  if (!dateValue) return null;
  
  const dateString = String(dateValue).trim();
  const dateObj = new Date(dateString);
  
  if (Number.isNaN(dateObj.getTime())) {
    throw new ValidationError(`Invalid date format: ${dateString}. Expected YYYY-MM-DD format.`);
  }
  
  // Convert to ISO date string (YYYY-MM-DD)
  return dateObj.toISOString().split('T')[0];
}

function normalizePlanningDetails(planningDetails) {
  if (!planningDetails || typeof planningDetails !== 'object' || Array.isArray(planningDetails)) {
    return {};
  }

  const interests = Array.isArray(planningDetails.interests)
    ? planningDetails.interests
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
    : [];

  const normalized = {
    mainTransport: {
      mode: normalizeText(planningDetails.mainTransport?.mode),
      provider: normalizeText(planningDetails.mainTransport?.provider),
      reference: normalizeText(planningDetails.mainTransport?.reference),
      notes: normalizeText(planningDetails.mainTransport?.notes),
    },
    preferences: {
      travelStyle: normalizeText(planningDetails.preferences?.travelStyle),
      accommodationPreference: normalizeText(planningDetails.preferences?.accommodationPreference),
    },
    interests,
    wishlist: {
      sideAttractions: normalizeText(planningDetails.wishlist?.sideAttractions),
      accommodation: normalizeText(planningDetails.wishlist?.accommodation),
      transport: normalizeText(planningDetails.wishlist?.transport),
    },
  };

  const hasValues =
    normalized.mainTransport.mode ||
    normalized.mainTransport.provider ||
    normalized.mainTransport.reference ||
    normalized.mainTransport.notes ||
    normalized.preferences.travelStyle ||
    normalized.preferences.accommodationPreference ||
    normalized.interests.length > 0 ||
    normalized.wishlist.sideAttractions ||
    normalized.wishlist.accommodation ||
    normalized.wishlist.transport;

  return hasValues ? normalized : {};
}

export async function createTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { tripName, destination, startDate, endDate, budget, description, travellerCount, planningDetails } = req.body;
  const normalizedDestination = normalizeText(destination);

  console.log('🗺️ Trip creation request:', {
    tripName,
    destination,
    startDate,
    endDate,
    budget,
    travellerCount,
  });

  if (!normalizedDestination || !startDate || !endDate) {
    throw new ValidationError('Destination, start date, and end date are required');
  }

  const normalizedStartDate = normalizeDate(startDate);
  const normalizedEndDate = normalizeDate(endDate);

  console.log('🗺️ Dates after normalization:', {
    normalizedStartDate,
    normalizedEndDate,
  });
  
  // Validate that end date is after start date
  if (new Date(normalizedEndDate) <= new Date(normalizedStartDate)) {
    throw new ValidationError('End date must be after start date');
  }

  const normalizedBudget = normalizeBudget(budget);
  const normalizedDescription = normalizeText(description) || '';
  const normalizedTripName = normalizeText(tripName);
  const normalizedTravellerCount = normalizeTravellerCount(travellerCount);
  const normalizedPlanningDetails = normalizePlanningDetails(planningDetails);

  const client = await pool.connect();
  try {
    const result = await client.query(
      `INSERT INTO trips (user_id, trip_name, destination, start_date, end_date, budget, description, traveller_count, planning_details, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING id, user_id, trip_name, destination, description, start_date, end_date, budget, traveller_count, planning_details, status, created_at`,
      [
        req.user.id,
        normalizedTripName,
        normalizedDestination,
        normalizedStartDate,
        normalizedEndDate,
        normalizedBudget,
        normalizedDescription,
        normalizedTravellerCount,
        JSON.stringify(normalizedPlanningDetails),
        'planning',
      ]
    );

    const trip = result.rows[0];

    // Get user details for email
    const userResult = await client.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Send trip creation confirmation email
    const tripHtml = `
      <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0; color: #2D3FE6; font-size: 28px;">🎉 Your Trip is Planned!</h2>
        </div>
        <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hello <strong>${user.full_name}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Great news! Your trip to <strong>${trip.destination}</strong> has been created successfully.
          </p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #2D3FE6;">
            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;"><strong>Trip Details:</strong></p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">📍 Destination: <strong>${trip.destination}</strong></p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">📅 Dates: ${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}</p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">👥 Travellers: <strong>${trip.traveller_count}</strong></p>
            ${trip.budget ? `<p style="margin: 6px 0; color: #64748b; font-size: 14px;">💰 Budget: <strong>GH₵${trip.budget}</strong></p>` : ''}
          </div>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Next step: Add hotels, guides, activities, and transportation to complete your itinerary. You can also invite friends to collaborate on planning!
          </p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} TripEase Ghana. Start exploring now!
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `✈️ Trip Planned: ${trip.destination} | TripEase Ghana`,
        message: `Your trip to ${trip.destination} (${new Date(trip.start_date).toLocaleDateString()} - ${new Date(trip.end_date).toLocaleDateString()}) has been created successfully!`,
        html: tripHtml
      });
    } catch (emailErr) {
      console.error('❌ Trip creation email failed:', emailErr);
      // Create notification to user about email failure
      try {
        await createNotification(
          req.user.id,
          'email_failed',
          'Trip Email Notification',
          `Your trip to ${trip.destination} was created, but we couldn't send the confirmation email.`
        );
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    }

    res.status(201).json({ success: true, data: trip });
  } finally {
    client.release();
  }
}

export async function getUserTrips(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT id, trip_name, destination, description, start_date, end_date, budget, traveller_count, planning_details, status, created_at
       FROM trips
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function getTripById(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    // 1. Get trip basics
    const tripResult = await client.query('SELECT * FROM trips WHERE id = $1', [id]);
    if (tripResult.rows.length === 0) throw new NotFoundError('Trip not found');
    const trip = tripResult.rows[0];

    // 2. Get itineraries
    const itineraryResult = await client.query(
      'SELECT * FROM itineraries WHERE trip_id = $1 ORDER BY day_number ASC',
      [id]
    );
    trip.itineraries = itineraryResult.rows;

    // 3. Get linked bookings
    const bookingsResult = await client.query(
      `SELECT b.*, 
        CASE 
          WHEN b.booking_type = 'hotel' THEN h.name
          WHEN b.booking_type = 'guide' THEN g.name
          WHEN b.booking_type = 'activity' THEN a.name
          WHEN b.booking_type = 'transport' THEN ts.name
        END as service_name
       FROM bookings b
       LEFT JOIN hotels h ON b.booking_type = 'hotel' AND b.reference_id = h.id
       LEFT JOIN tour_guides g ON b.booking_type = 'guide' AND b.reference_id = g.id
       LEFT JOIN activities a ON b.booking_type = 'activity' AND b.reference_id = a.id
       LEFT JOIN transport_services ts ON b.booking_type = 'transport' AND b.reference_id = ts.id
       WHERE b.trip_id = $1`,
      [id]
    );
    trip.bookings = bookingsResult.rows;

    res.json({ success: true, data: trip });
  } finally {
    client.release();
  }
}

export async function updateTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { tripName, destination, startDate, endDate, budget, description, travellerCount, planningDetails, status } = req.body;

  const client = await pool.connect();
  try {
    const updates = [];
    const params = [];

    if (Object.prototype.hasOwnProperty.call(req.body, 'tripName')) {
      params.push(normalizeText(tripName));
      updates.push(`trip_name = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'destination')) {
      const normalizedDestination = normalizeText(destination);
      if (!normalizedDestination) {
        throw new ValidationError('Destination is required');
      }
      params.push(normalizedDestination);
      updates.push(`destination = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'startDate')) {
      if (!startDate) throw new ValidationError('Start date is required');
      const normalizedStartDate = normalizeDate(startDate);
      params.push(normalizedStartDate);
      updates.push(`start_date = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'endDate')) {
      if (!endDate) throw new ValidationError('End date is required');
      const normalizedEndDate = normalizeDate(endDate);
      params.push(normalizedEndDate);
      updates.push(`end_date = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'budget')) {
      params.push(normalizeBudget(budget));
      updates.push(`budget = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'description')) {
      params.push(normalizeText(description) || '');
      updates.push(`description = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'travellerCount')) {
      params.push(normalizeTravellerCount(travellerCount));
      updates.push(`traveller_count = $${params.length}`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'planningDetails')) {
      params.push(JSON.stringify(normalizePlanningDetails(planningDetails)));
      updates.push(`planning_details = $${params.length}::jsonb`);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, 'status')) {
      params.push(status);
      updates.push(`status = $${params.length}`);
    }

    if (updates.length === 0) {
      const currentTrip = await client.query(
        `SELECT id, trip_name, destination, description, start_date, end_date, budget, traveller_count, planning_details, status
         FROM trips
         WHERE id = $1 AND user_id = $2`,
        [id, req.user.id]
      );
      if (currentTrip.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');
      return res.json({ success: true, message: 'Trip updated', data: currentTrip.rows[0] });
    }

    params.push(id, req.user.id);

    const result = await client.query(
      `UPDATE trips
       SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id = $${params.length - 1} AND user_id = $${params.length}
       RETURNING id, trip_name, destination, description, start_date, end_date, budget, traveller_count, planning_details, status`,
      params
    );
    if (result.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');
    
    const updatedTrip = result.rows[0];

    // Get user details for email
    const userResult = await client.query('SELECT full_name, email FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    // Send trip update confirmation email
    const updateHtml = `
      <div style="font-family: 'Inter', sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; max-width: 600px; margin: 0 auto; border-radius: 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h2 style="margin: 0; color: #2D3FE6; font-size: 28px;">✏️ Trip Updated</h2>
        </div>
        <div style="background: white; padding: 32px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
            Hello <strong>${user.full_name}</strong>,
          </p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
            Your trip to <strong>${updatedTrip.destination}</strong> has been updated successfully.
          </p>
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #2D3FE6;">
            <p style="margin: 0 0 12px 0; color: #64748b; font-size: 14px;"><strong>Current Trip Details:</strong></p>
            ${updatedTrip.trip_name ? `<p style="margin: 6px 0; color: #64748b; font-size: 14px;">✈️ Trip Name: <strong>${updatedTrip.trip_name}</strong></p>` : ''}
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">📍 Destination: <strong>${updatedTrip.destination}</strong></p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">📅 Dates: ${new Date(updatedTrip.start_date).toLocaleDateString()} - ${new Date(updatedTrip.end_date).toLocaleDateString()}</p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">👥 Travellers: <strong>${updatedTrip.traveller_count}</strong></p>
            ${updatedTrip.budget ? `<p style="margin: 6px 0; color: #64748b; font-size: 14px;">💰 Budget: <strong>GH₵${updatedTrip.budget}</strong></p>` : ''}
          </div>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">
            Continue planning your itinerary by adding hotels, guides, activities, and transportation. Your trip is ready for updates!
          </p>
        </div>
        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 32px;">
          &copy; ${new Date().getFullYear()} TripEase Ghana. Planning together!
        </p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: `✏️ Trip Updated: ${updatedTrip.destination} | TripEase Ghana`,
        message: `Your trip to ${updatedTrip.destination} has been updated successfully!`,
        html: updateHtml
      });
    } catch (emailErr) {
      console.error('❌ Trip update email failed:', emailErr);
      // Create notification to user about email failure
      try {
        await createNotification(
          req.user.id,
          'email_failed',
          'Trip Update Email Notification',
          `Your trip to ${updatedTrip.destination} was updated, but we couldn't send the update confirmation email.`
        );
      } catch (notifErr) {
        console.error('Failed to create notification:', notifErr);
      }
    }

    res.json({ success: true, message: 'Trip updated', data: updatedTrip });
  } finally {
    client.release();
  }
}

export async function deleteTrip(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    res.json({ success: true, message: 'Trip deleted' });
  } finally {
    client.release();
  }
}

export async function addItinerary(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { dayNumber, activities, notes } = req.body;

  if (!dayNumber) {
    throw new ValidationError('Day number is required');
  }

  const client = await pool.connect();
  try {
    // Verify trip belongs to user
    const trip = await client.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (trip.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');

    const result = await client.query(
      `INSERT INTO itineraries (trip_id, day_number, activities, notes) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, trip_id, day_number, activities, notes, created_at`,
      [id, dayNumber, activities || '', notes || '']
    );
    res.status(201).json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
}

export async function getItinerary(req, res) {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      'SELECT id, trip_id, day_number, activities, notes, created_at FROM itineraries WHERE trip_id = $1 ORDER BY day_number ASC',
      [id]
    );
    res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
}

export async function replaceItinerary(req, res) {
  if (!req.user) throw new UnauthorizedError('Not authenticated');

  const { id } = req.params;
  const { items } = req.body;

  if (!Array.isArray(items)) {
    throw new ValidationError('Itinerary items must be an array');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const trip = await client.query('SELECT id FROM trips WHERE id = $1 AND user_id = $2', [id, req.user.id]);
    if (trip.rows.length === 0) throw new NotFoundError('Trip not found or not authorized');

    await client.query('DELETE FROM itineraries WHERE trip_id = $1', [id]);

    const insertedItems = [];

    for (const item of items) {
      const dayNumber = Number.parseInt(String(item?.dayNumber), 10);

      if (!Number.isFinite(dayNumber) || dayNumber <= 0) {
        throw new ValidationError('Each itinerary day must have a valid day number');
      }

      const activities = typeof item?.activities === 'string' ? item.activities : '';
      const notes = typeof item?.notes === 'string' ? item.notes : '';

      const result = await client.query(
        `INSERT INTO itineraries (trip_id, day_number, activities, notes)
         VALUES ($1, $2, $3, $4)
         RETURNING id, trip_id, day_number, activities, notes, created_at`,
        [id, dayNumber, activities, notes]
      );

      insertedItems.push(result.rows[0]);
    }

    await client.query('COMMIT');
    res.json({ success: true, data: insertedItems });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
