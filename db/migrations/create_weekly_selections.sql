-- Create table for weekly selections
CREATE TABLE IF NOT EXISTS weekly_selections (
    id SERIAL PRIMARY KEY,
    bingwa_champion VARCHAR(50) NOT NULL,
    atletico_champ VARCHAR(50) NOT NULL,
    movie_night VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default values if table is empty
INSERT INTO weekly_selections (bingwa_champion, atletico_champ, movie_night)
SELECT 'JAYBERS8', 'FLIGHTx12!', 'Underwater (2020)'
WHERE NOT EXISTS (SELECT 1 FROM weekly_selections);
