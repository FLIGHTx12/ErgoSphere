-- Add Bingwa Banquet, Brunch, and YouTube Theater to weekly_selections
ALTER TABLE weekly_selections
  ADD COLUMN banquet_meal VARCHAR(255),
  ADD COLUMN brunch_meal VARCHAR(255),
  ADD COLUMN youtube_theater TEXT; -- Will store JSON array as string
