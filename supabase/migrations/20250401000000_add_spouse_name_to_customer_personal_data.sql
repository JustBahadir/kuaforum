
-- Add spouse_name column to customer_personal_data table
ALTER TABLE customer_personal_data ADD COLUMN IF NOT EXISTS spouse_name TEXT;
