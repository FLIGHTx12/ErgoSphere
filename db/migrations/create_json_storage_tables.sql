-- Create a table for general JSON data storage
CREATE TABLE json_data (
  id INT IDENTITY(1,1) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,  -- e.g., 'loot', 'pvp', 'coop'
  data NVARCHAR(MAX) NOT NULL,
  created_at DATETIME DEFAULT GETDATE(),
  updated_at DATETIME DEFAULT GETDATE()
);

-- Create index for faster lookups by category
CREATE INDEX idx_json_data_category ON json_data(category);

-- Create a table for backups
CREATE TABLE json_backups (
  id INT IDENTITY(1,1) PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  data NVARCHAR(MAX) NOT NULL,
  backup_date DATETIME DEFAULT GETDATE()
);

-- Create index for faster lookups by category
CREATE INDEX idx_json_backups_category ON json_backups(category);
