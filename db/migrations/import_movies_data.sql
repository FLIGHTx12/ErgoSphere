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
  (SELECT jsonb_array_elements(content::jsonb)
   FROM pg_read_file('c:\Users\fligh\OneDrive\ErgoSphere\data\movies.json') content)
) m;
