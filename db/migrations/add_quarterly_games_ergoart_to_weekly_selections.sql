-- Create migration to add quarterly games and ErgoArt subject

-- Add q1_game column if it doesn't exist
ALTER TABLE weekly_selections 
ADD COLUMN IF NOT EXISTS q1_game VARCHAR(255);

-- Add q2_game column if it doesn't exist
ALTER TABLE weekly_selections 
ADD COLUMN IF NOT EXISTS q2_game VARCHAR(255);

-- Add q3_game column if it doesn't exist
ALTER TABLE weekly_selections 
ADD COLUMN IF NOT EXISTS q3_game VARCHAR(255);

-- Add q4_game column if it doesn't exist
ALTER TABLE weekly_selections 
ADD COLUMN IF NOT EXISTS q4_game VARCHAR(255);

-- Add ergoart_subject column if it doesn't exist
ALTER TABLE weekly_selections 
ADD COLUMN IF NOT EXISTS ergoart_subject VARCHAR(255);

-- Initialize with default values for existing records where values are null
UPDATE weekly_selections
SET 
  q1_game = COALESCE(q1_game, ''),
  q2_game = COALESCE(q2_game, ''),
  q3_game = COALESCE(q3_game, ''),
  q4_game = COALESCE(q4_game, ''),
  ergoart_subject = COALESCE(ergoart_subject, 'Mars');
