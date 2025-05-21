-- Create migration to add quarterly games and ErgoArt subject
-- This is a PostgreSQL script

-- Add columns to the weekly_selections table
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS q1_game VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS q2_game VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS q3_game VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS q4_game VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS ergoart_subject VARCHAR(255);

-- Initialize with default values for existing records where values are null
UPDATE weekly_selections
SET 
  q1_game = COALESCE(q1_game, 'No Q1 Game Selected'),
  q2_game = COALESCE(q2_game, 'No Q2 Game Selected'),
  q3_game = COALESCE(q3_game, 'No Q3 Game Selected'),
  q4_game = COALESCE(q4_game, 'No Q4 Game Selected'),
  ergoart_subject = COALESCE(ergoart_subject, 'Mars');
