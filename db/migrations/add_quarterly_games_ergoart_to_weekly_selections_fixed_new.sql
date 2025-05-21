-- Create migration to add quarterly games and ErgoArt subject
-- This is a PostgreSQL script

-- Add columns to the weekly_selections table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'q1_game') THEN
        ALTER TABLE weekly_selections ADD COLUMN q1_game VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'q2_game') THEN
        ALTER TABLE weekly_selections ADD COLUMN q2_game VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'q3_game') THEN
        ALTER TABLE weekly_selections ADD COLUMN q3_game VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'q4_game') THEN
        ALTER TABLE weekly_selections ADD COLUMN q4_game VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'ergoart_subject') THEN
        ALTER TABLE weekly_selections ADD COLUMN ergoart_subject VARCHAR(255);
    END IF;
END $$;

-- Initialize with meaningful default values for existing records where values are null
UPDATE weekly_selections
SET 
  q1_game = COALESCE(q1_game, 'No Q1 Game Selected'),
  q2_game = COALESCE(q2_game, 'No Q2 Game Selected'),
  q3_game = COALESCE(q3_game, 'No Q3 Game Selected'),
  q4_game = COALESCE(q4_game, 'No Q4 Game Selected'),
  ergoart_subject = COALESCE(ergoart_subject, 'Mars');
