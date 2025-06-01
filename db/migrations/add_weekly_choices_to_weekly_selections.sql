-- Add Weekly Choices columns to weekly_selections
DO $$ 
BEGIN
    -- Add next_bingwa_challenge column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'next_bingwa_challenge') THEN
        ALTER TABLE weekly_selections ADD COLUMN next_bingwa_challenge VARCHAR(255);
    END IF;
    
    -- Add atletico_workout column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'atletico_workout') THEN
        ALTER TABLE weekly_selections ADD COLUMN atletico_workout VARCHAR(255);
    END IF;
    
    -- Add weekly_errand column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_selections' AND column_name = 'weekly_errand') THEN
        ALTER TABLE weekly_selections ADD COLUMN weekly_errand VARCHAR(255);
    END IF;
END $$;
