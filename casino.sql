DROP TABLE IF EXISTS casino;
CREATE TABLE casino (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL
);

INSERT INTO casino (data) VALUES (
  '{
    "games": [
      "Blackjack",
      "Roulette",
      "Slots"
    ]
  }'
);
