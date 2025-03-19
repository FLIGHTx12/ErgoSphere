-- Create tables for different data types
CREATE TABLE IF NOT EXISTS youtube_videos (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  status TEXT,
  channel TEXT,
  genre TEXT,
  runtime TEXT,
  link TEXT,
  times_seen TEXT,
  description TEXT
);

CREATE TABLE IF NOT EXISTS sunday_shows (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  series_length TEXT,
  last_watched TEXT,
  ownership TEXT,
  genre TEXT,
  runtime TEXT,
  max_episodes TEXT,
  link TEXT,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS singleplayer_games (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  genre TEXT,
  console TEXT,
  time_to_beat TEXT,
  playability TEXT,
  completed TEXT CHECK (completed IN ('🏆', '', NULL)),
  link TEXT,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  status TEXT,
  watched TEXT,
  ownership TEXT,
  genre TEXT,
  runtime TEXT,
  link TEXT,
  description TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS media_content (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,  -- 'youtube', 'movie', etc
    category TEXT,
    data JSONB NOT NULL,
    active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'pvp', 'coop', 'single'
    data JSONB NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_youtube_channel ON youtube_videos(channel);
CREATE INDEX IF NOT EXISTS idx_youtube_status ON youtube_videos(status);
CREATE INDEX IF NOT EXISTS idx_shows_status ON sunday_shows(status);
CREATE INDEX IF NOT EXISTS idx_games_completed ON singleplayer_games(completed);
CREATE INDEX IF NOT EXISTS idx_movies_watched ON movies(watched);
CREATE INDEX idx_media_content_type ON media_content(type);
CREATE INDEX idx_media_content_category ON media_content(category);
CREATE INDEX idx_games_category ON games(category);

-- Add constraints
ALTER TABLE youtube_videos ADD CONSTRAINT valid_status CHECK (status IN ('🟢', '🟣', '', NULL));
ALTER TABLE sunday_shows ADD CONSTRAINT valid_status CHECK (status IN ('🟢', '🟣', '', NULL));
ALTER TABLE singleplayer_games ADD CONSTRAINT valid_status CHECK (status IN ('🟢', '🟣', '', NULL));
ALTER TABLE movies ADD CONSTRAINT valid_status CHECK (status IN ('🟢', '🟣', '', NULL));
