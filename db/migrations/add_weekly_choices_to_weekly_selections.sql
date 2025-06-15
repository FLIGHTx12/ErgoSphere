-- Add Weekly Choices columns to weekly_selections
-- Add next_bingwa_challenge column
ALTER TABLE weekly_selections ADD COLUMN next_bingwa_challenge VARCHAR(255);

-- Add atletico_workout column
ALTER TABLE weekly_selections ADD COLUMN atletico_workout VARCHAR(255);

-- Add weekly_errand column
ALTER TABLE weekly_selections ADD COLUMN weekly_errand VARCHAR(255);

-- Add anime, sunday morning, and sunday night fields
ALTER TABLE weekly_selections ADD COLUMN anime VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN anime_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN sunday_morning VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN sunday_morning_end_date DATE;
ALTER TABLE weekly_selections ADD COLUMN sunday_night VARCHAR(255);
ALTER TABLE weekly_selections ADD COLUMN sunday_night_end_date DATE;
