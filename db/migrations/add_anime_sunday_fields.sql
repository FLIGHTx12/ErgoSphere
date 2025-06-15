-- Add anime, sunday morning, and sunday night fields to weekly_selections
ALTER TABLE weekly_selections ADD COLUMN anime VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN anime_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN sunday_morning VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN sunday_morning_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN sunday_night VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN sunday_night_end_date DATE;
