INSERT INTO singleplayer_games (
  title, status, genre, console, time_to_beat,  
  playability, completed, link, description, image_url
)
SELECT 
  g->>'TITLE',
  g->>'STATUS',
  g->>'GENRE',
  g->>'CONSOLE',
  g->>'TIME TO BEAT',
  g->>'Playability',
  g->>'COMPLETED?',
  g->>'LINK',
  g->>'DESCRIPTION',
  g->>'imageUrl'
FROM jsonb_array_elements(
  (SELECT jsonb_array_elements(content::jsonb)
   FROM pg_read_file('c:\Users\fligh\OneDrive\ErgoSphere\data\singleplayer.json') content)
) g;
