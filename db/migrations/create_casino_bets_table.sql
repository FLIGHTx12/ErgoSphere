-- Create casino_bets table for storing bet information
CREATE TABLE IF NOT EXISTS casino_bets (
  id SERIAL PRIMARY KEY,
  user_name VARCHAR(50) NOT NULL,
  league VARCHAR(50) NOT NULL,
  away_team TEXT NOT NULL,
  home_team TEXT NOT NULL,
  bet_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  week_key VARCHAR(10) NOT NULL, -- Format: YYYY-MM-DD of the Sunday of the week
  bet_data JSONB NOT NULL, -- Full bet data as JSON including lines, risk levels, wagers, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_casino_bets_week_key ON casino_bets(week_key);
CREATE INDEX IF NOT EXISTS idx_casino_bets_user_name ON casino_bets(user_name);
