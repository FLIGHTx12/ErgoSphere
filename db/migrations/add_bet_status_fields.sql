-- Add status tracking to casino_bets table
ALTER TABLE casino_bets ADD COLUMN IF NOT EXISTS bet_status JSONB DEFAULT NULL;
ALTER TABLE casino_bets ADD COLUMN IF NOT EXISTS payout_data JSONB DEFAULT NULL;

-- Add index for faster queries on bet status
CREATE INDEX IF NOT EXISTS idx_casino_bets_bet_status ON casino_bets USING GIN(bet_status);
