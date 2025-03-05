CREATE TABLE IF NOT EXISTS loot_items (
  id SERIAL PRIMARY KEY,
  text TEXT,
  image JSONB, -- store a JSON array or a single string
  copies INTEGER,
  details TEXT,
  genre TEXT,
  type TEXT,
  cost TEXT,
  after_spin TEXT,
  link TEXT
);
