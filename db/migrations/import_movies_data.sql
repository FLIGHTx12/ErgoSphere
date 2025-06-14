INSERT INTO movies (
  title, status, watched, ownership, genre,
  runtime, link, description, image_url
)
SELECT 
  m->>'Title',
  m->>'STATUS',
  m->>'WATCHED',
  m->>'OwnerShip',
  m->>'GENRE',
  m->>'RUNTIME',
  m->>'Link',
  m->>'DESCRIPTION',
  m->>'imageUrl'
FROM jsonb_array_elements(
  (SELECT content::jsonb FROM pg_read_file('c:\\Users\\fligh\\OneDrive\\ErgoSphere\\data\\movies.json')) 
) m
ON CONFLICT (title) DO UPDATE SET
  status = EXCLUDED.status,
  watched = EXCLUDED.watched,
  ownership = EXCLUDED.ownership,
  genre = EXCLUDED.genre,
  runtime = EXCLUDED.runtime,
  link = EXCLUDED.link,
  description = EXCLUDED.description,
  image_url = EXCLUDED.image_url;
