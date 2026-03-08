-- Add travel information table
CREATE TABLE IF NOT EXISTS travel_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'transport', 'safety', 'health', 'visa', 'culture'
    content TEXT NOT NULL,
    icon VARCHAR(50),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial travel info
INSERT INTO travel_info (title, category, content, icon, is_featured) VALUES
('Transportation in Ghana', 'transport', 'Ghana has various transport options including domestic flights (Passion Air, Africa World Airlines), STC coaches for long distance, and Tro-tros for short city trips.', 'bus', true),
('Safety Tips', 'safety', 'Ghana is generally very safe for tourists. However, always be cautious in crowded markets and avoid walking alone late at night in unfamiliar areas.', 'shield', true),
('Visa Requirements', 'visa', 'Most visitors require a visa to enter Ghana, which must be obtained from a Ghanaian embassy or consulate before travel. ECOWAS citizens are visa-exempt.', 'file-text', true);
