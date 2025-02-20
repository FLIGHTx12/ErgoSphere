DROP TABLE IF EXISTS ergo_shop;
CREATE TABLE ergo_shop (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL
);

INSERT INTO ergo_shop (data) VALUES (
  '{
    "items": [
      "T-Shirt",
      "Cap",
      "Poster"
    ]
  }'
);
