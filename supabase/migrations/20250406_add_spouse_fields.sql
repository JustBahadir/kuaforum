
-- Add spouse fields to customer_personal_data table
ALTER TABLE customer_personal_data 
ADD COLUMN spouse_name TEXT NULL,
ADD COLUMN spouse_birthdate DATE NULL;
