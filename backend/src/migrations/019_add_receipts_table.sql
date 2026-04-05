-- Receipts table for storing generated receipts
CREATE TABLE IF NOT EXISTS receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receipt_number VARCHAR(100) NOT NULL UNIQUE,
  service_name VARCHAR(255) NOT NULL,
  booking_type VARCHAR(50) NOT NULL,
  reference_id UUID NOT NULL,
  check_in_date DATE,
  check_out_date DATE,
  number_of_guests INT DEFAULT 1,
  special_requests TEXT,
  total_price DECIMAL(10, 2) NOT NULL,
  base_rate DECIMAL(10, 2) NOT NULL,
  tax_fee DECIMAL(10, 2) NOT NULL,
  room_type VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  booking_status VARCHAR(50) NOT NULL,
  notes TEXT,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  downloaded_at TIMESTAMP,
  printed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_receipts_bookings FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_receipts_user_id ON receipts(user_id);
CREATE INDEX IF NOT EXISTS idx_receipts_booking_id ON receipts(booking_id);
CREATE INDEX IF NOT EXISTS idx_receipts_created_at ON receipts(created_at DESC);
