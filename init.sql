DROP TABLE IF EXISTS ErgoShop;
CREATE TABLE ErgoShop (
  data JSONB NOT NULL
);

INSERT INTO ErgoShop (data) VALUES (
  '{
    "saltySnackContainer": [
      { "text": "🌿Roasted Seaweed - 10💷", "value": 10 },
      { "text": "🔺Tortilla Chips (Donkey/El Milagro) - 10💷", "value": 10 },
      { "text": "🍿Popcorn (Boom chicka/Skinny pop) - 20💷", "value": 20 },
      { "text": "🧀Cheez-it - 30💷", "value": 30 },
      { "text": "🧀Simply Cheetos Puffs White Cheddar - 30💷", "value": 30 },
      { "text": "🐄 Old Fashioned Beef Jerk - 40💷", "value": 40 },
      { "text": "🍘Wheat Thins Original - 40💷", "value": 40 }
    ],
    "sweetSnackContainer": [
      { "text": "🐮Chobani Whole Milk Plain Greek Yogurt - 10💷", "value": 10 },
      { "text": "🍪Simple Truth Blueberry Breakfast Cookies - 20💷", "value": 20 },
      { "text": "🐻Chocolate Teddy Graham Snacks - 30💷", "value": 30 },
      { "text": "🍫Dark Chocolate Covered Almonds/Raisins - 30💷", "value": 30 },
      { "text": "🍪Belvita Blueberry Breakfast biscuits - 40💷", "value": 40 },
      { "text": "🍪Chips Ahoy 2 pack - 40💷", "value": 40 },
      { "text": "🎂Little Bites (Fudge/Banana) - 40💷", "value": 40 }
    ],
    "frozenSnackContainer": [
      { "text": "🍕Jacks Pizza Bois - 20💷", "value": 20 },
      { "text": "🍨Breyers Mango Ice cream - 20💷", "value": 20 },
      { "text": "🍕Totinos Pizza rolls - 30💷", "value": 30 },
      { "text": "🥟Bibigo Chicken & Veggie Mini Wontos - 30💷", "value": 30 },
      { "text": "🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷", "value": 40 },
      { "text": "🍦So Delicious Vanilla Bean Coconut milk IceCream Sandwiches - 40💷", "value": 40 }
    ],
    "concoctionsContainer": [
      { "text": "🚬THC Gummies - 40💷", "value": 40 },
      { "text": "☕VJ Hot Cocoa 500ml - 20💷", "value": 20 },
      { "text": "🍺Beer - 50💷", "value": 50 },
      { "text": "🥃Mixed Drink (2shots) - 50💷", "value": 50 },
      { "text": "🍷Wine Glass 500ml - 100💷", "value": 100 },
      { "text": "🍾Wine Bottle 750ml - 150💷", "value": 150 }
    ],
    "mealModsContainer": [
      { "text": "🍔Fast Food Cheat Meal - 60💷", "value": 60 },
      { "text": "🍴Lunch Snack - 2💷", "value": 2 },
      { "text": "🌞Weekend AM Snack - 2💷", "value": 2 },
      { "text": "🎉SNACK-A-THON MOD(1/2) - 0💷", "value": 0 },
      { "text": "🎉🎉SNACK-A-THON MOD(2/2) - 0💷", "value": 0 }
    ]
  }'
);

DROP TABLE IF EXISTS dropdown_options;
CREATE TABLE dropdown_options (
  category TEXT PRIMARY KEY,
  options JSONB NOT NULL
);

INSERT INTO dropdown_options (category, options) VALUES
('saltySnackContainer', '[
  { "text": "🌿Roasted Seaweed - 10💷", "value": 10 },
  { "text": "🔺Tortilla Chips (Donkey/El Milagro) - 10💷", "value": 10 },
  { "text": "🍿Popcorn (Boom chicka/Skinny pop) - 20💷", "value": 20 },
  { "text": "🧀Cheez-it - 30💷", "value": 30 },
  { "text": "🧀Simply Cheetos Puffs White Cheddar - 30💷", "value": 30 },
  { "text": "🐄 Old Fashioned Beef Jerk - 40💷", "value": 40 },
  { "text": "🍘Wheat Thins Original - 40💷", "value": 40 }
]'),
('sweetSnackContainer', '[
  { "text": "🐮Chobani Whole Milk Plain Greek Yogurt - 10💷", "value": 10 },
  { "text": "🍪Simple Truth Blueberry Breakfast Cookies - 20💷", "value": 20 },
  { "text": "🐻Chocolate Teddy Graham Snacks - 30💷", "value": 30 },
  { "text": "🍫Dark Chocolate Covered Almonds/Raisins - 30💷", "value": 30 },
  { "text": "🍪Belvita Blueberry Breakfast biscuits - 40💷", "value": 40 },
  { "text": "🍪Chips Ahoy 2 pack - 40💷", "value": 40 },
  { "text": "🎂Little Bites (Fudge/Banana) - 40💷", "value": 40 }
]'),
('frozenSnackContainer', '[
  { "text": "🍕Jacks Pizza Bois - 20💷", "value": 20 },
  { "text": "🍨Breyers Mango Ice cream - 20💷", "value": 20 },
  { "text": "🍕Totinos Pizza rolls - 30💷", "value": 30 },
  { "text": "🥟Bibigo Chicken & Veggie Mini Wontos - 30💷", "value": 30 },
  { "text": "🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷", "value": 40 },
  { "text": "🍦So Delicious Vanilla Bean Coconut milk IceCream Sandwiches - 40💷", "value": 40 }
]'),
('concoctionsContainer', '[
  { "text": "🚬THC Gummies - 40💷", "value": 40 },
  { "text": "☕VJ Hot Cocoa 500ml - 20💷", "value": 20 },
  { "text": "🍺Beer - 50💷", "value": 50 },
  { "text": "🥃Mixed Drink (2shots) - 50💷", "value": 50 },
  { "text": "🍷Wine Glass 500ml - 100💷", "value": 100 },
  { "text": "🍾Wine Bottle 750ml - 150💷", "value": 150 }
]'),
('mealModsContainer', '[
  { "text": "🍔Fast Food Cheat Meal - 60💷", "value": 60 },
  { "text": "🍴Lunch Snack - 2💷", "value": 2 },
  { "text": "🌞Weekend AM Snack - 2💷", "value": 2 },
  { "text": "🎉SNACK-A-THON MOD(1/2) - 0💷", "value": 0 },
  { "text": "🎉🎉SNACK-A-THON MOD(2/2) - 0💷", "value": 0 }
]');

CREATE TABLE IF NOT EXISTS refreshment_options (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  option VARCHAR(100) NOT NULL,
  cost INTEGER NOT NULL
);

INSERT INTO refreshment_options (category, option, cost) VALUES
('saltySnackContainer', '🌿Roasted Seaweed', 10),
('saltySnackContainer', '🔺Tortilla Chips (Donkey/El Milagro)', 10),
('sweetSnackContainer', '🐮Chobani Whole Milk Plain Greek Yogurt', 10),
('frozenSnackContainer', '🍕Jacks Pizza Bois', 20),
('concoctionsContainer', '🚬THC Gummies', 40),
('mealModsContainer', '🍔Fast Food Cheat Meal', 60);

DROP TABLE IF EXISTS game_data;
CREATE TABLE game_data (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,
  data JSONB NOT NULL
);

INSERT INTO game_data (category, data) VALUES
('pvp', '[
  {
    "text": "3ON3 FREESTYLE",
    "mode": "3on3 mode online",
    "details": "5 games",
    "image": "../assets/img/Spin The Wheel Photos/PVP/3ON3 FREESTYLE.png",
    "copies": 1
  }
]'),
('loot', '[
  {
    "text": "YOU FOUND!! 1 XBOX series X\'s (Continue until 2 are claimed)",
    "copies": 0
  }
]'),
('coop', '[
  {
    "text": "33 Immortals",
    "copies": 0
  }
]');
