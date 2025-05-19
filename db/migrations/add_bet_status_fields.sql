-- Add status tracking to casino_bets table
BEGIN TRANSACTION;

-- Check if bet_status column exists, add if not
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'casino_bets' AND COLUMN_NAME = 'bet_status')
BEGIN
    ALTER TABLE casino_bets ADD bet_status NVARCHAR(MAX) NULL;
END

-- Check if payout_data column exists, add if not
IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS 
               WHERE TABLE_NAME = 'casino_bets' AND COLUMN_NAME = 'payout_data')
BEGIN
    ALTER TABLE casino_bets ADD payout_data NVARCHAR(MAX) NULL;
END

-- Check if index exists before creating it
IF NOT EXISTS (SELECT 1 FROM sys.indexes 
               WHERE name = 'idx_casino_bets_bet_status' AND object_id = OBJECT_ID('casino_bets'))
BEGIN
    -- SQL Server doesn't have GIN indexes, create a regular index instead
    CREATE INDEX idx_casino_bets_bet_status ON casino_bets(bet_status);
END

COMMIT TRANSACTION;
