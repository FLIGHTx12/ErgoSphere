DROP TABLE IF EXISTS monster;
CREATE TABLE monster (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL
);

INSERT INTO monster (data) VALUES (
  '{
    "creatures": [
      "Goblin",
      "Dragon",
      "Zombie"
    ]
  }'
);
