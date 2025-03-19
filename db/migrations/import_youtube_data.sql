INSERT INTO youtube_videos (
  title, image_url, status, channel, genre, runtime, 
  link, times_seen, description
)
SELECT 
  v->>'TITLE',
  v->>'imageUrl',
  v->>'STATUS',
  v->>'CHANNEL',
  v->>'GENRE',
  v->>'RUNTIME',
  v->>'Link',
  v->>'TIMES SEEN',
  v->>'DESCRIPTION'
FROM jsonb_array_elements(
  (SELECT jsonb_array_elements(content::jsonb) 
   FROM pg_read_file('c:\Users\fligh\OneDrive\ErgoSphere\data\youtube.json') content)
) v;

INSERT INTO media_content (title, type, category, data) VALUES
    ('Example YouTube Video', 'youtube', 'entertainment', 
    '{"videoId": "example", "duration": "10:00", "description": "Sample video"}'
);
-- Add your actual YouTube data here
