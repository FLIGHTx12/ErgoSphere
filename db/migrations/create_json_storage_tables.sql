-- Create a table for general JSON data storage
CREATE TABLE IF NOT EXISTS json_data (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,  -- e.g., 'loot', 'pvp', 'coop'
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_json_data_category ON json_data(category);

-- Create a table for backups
CREATE TABLE IF NOT EXISTS json_backups (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster lookups by category
CREATE INDEX IF NOT EXISTS idx_json_backups_category ON json_backups(category);
