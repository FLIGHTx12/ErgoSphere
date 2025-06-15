-- Add anime, sunday morning, and sunday night fields to weekly_selections
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS anime VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS anime_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS sunday_morning VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS sunday_morning_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS sunday_night VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN IF NOT EXISTS sunday_night_end_date DATE;
