INSERT INTO sunday_shows (
  title, status, series_length, last_watched, ownership,
  genre, runtime, max_episodes, link, description, image_url
)
SELECT 
  s->>'TITLE',
  s->>'STATUS',
  s->>'Series Length',
  s->>'LAST WATCHED',
  s->>'OwnerShip',
  s->>'GENRE',
  s->>'RUNTIME',
  s->>'Max Episodes',
  s->>'Link',
  s->>'DESCRIPTION',
  s->>'imageUrl'
FROM jsonb_array_elements(
  (SELECT jsonb_array_elements(content::jsonb)
   FROM pg_read_file('c:\Users\fligh\OneDrive\ErgoSphere\data\sundaynight.json') content)
) s;
