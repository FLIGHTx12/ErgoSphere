DROP TABLE IF EXISTS ErgoShop;
CREATE TABLE ErgoShop (
  id SERIAL PRIMARY KEY,
  data JSONB NOT NULL
);

INSERT INTO ErgoShop (data) VALUES (
  '{
    "saltySnacks": [
      "🌿Roasted Seaweed - 10💷",
      "🔺Tortilla Chips (Donkey/El Milagro) - 10💷",
      "🍿Popcorn (Boom chicka/Skinny pop) - 20💷",
      "🧀Cheez-it - 30💷",
      "🧀Simply Cheetos Puffs White Cheddar - 30💷",
      "🐄 Old Fashioned Beef Jerk - 40💷",
      "🍘Wheat Thins Original - 40💷"
    ],
    "sweetSnacks": [
      "🐮Chobani Whole Milk Plain Greek Yogurt - 10💷",
      "🍪Simple Truth Blueberry Breakfast Cookies - 20💷",
      "🐻Chocolate Teddy Graham Snacks - 30💷",
      "🍫Dark Chocolate Covered Almonds/Raisins - 30💷",
      "🍪Belvita Blueberry Breakfast biscuits - 40💷",
      "🍪Chips Ahoy 2 pack - 40💷",
      "🎂Little Bites (Fudge/Banana) - 40💷"
    ],
    "frozenSnacks": [
      "🍕Jacks Pizza Bois - 20💷",
      "🍨Breyers Mango Ice cream - 20💷",
      "🍕Totinos Pizza rolls - 30💷",
      "🥟Bibigo Chicken & Veggie Mini Wontos - 30💷",
      "🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷",
      "🍦So Delicious Vanilla Bean Coconut milk IceCream Sandwiches - 40💷"
    ],
    "concoctions": [
      "🚬THC Gummies - 40💷",
      "☕VJ Hot Cocoa 500ml - 20💷",
      "🍺Beer - 50💷",
      "🥃Mixed Drink (2shots) - 50💷",
      "🍷Wine Glass 500ml - 100💷",
      "🍾Wine Bottle 750ml - 150💷"
    ],
    "mealMods": [
      "🍔Fast Food Cheat Meal - 60💷",
      "🍴Lunch Snack - 2💷",
      "🌞Weekend AM Snack - 2💷",
      "🎉SNACK-A-THON MOD(1/2) - 0💷",
      "🎉🎉SNACK-A-THON MOD(2/2) - 0💷"
    ]
  }'
);

DROP TABLE IF EXISTS dropdown_options;
CREATE TABLE dropdown_options (
  category TEXT PRIMARY KEY,
  options JSONB NOT NULL
);

INSERT INTO dropdown_options (category, options) VALUES
('saltySnackContainer', '["🌿Roasted Seaweed - 10💷","🔺Tortilla Chips (Donkey/El Milagro) - 10💷","🍿Popcorn (Boom chicka/Skinny pop) - 20💷","🧀Cheez-it - 30💷","🧀Simply Cheetos Puffs White Cheddar - 30💷","🐄 Old Fashioned Beef Jerk - 40💷","🍘Wheat Thins Original - 40💷"]'),
('sweetSnackContainer', '["🐮Chobani Whole Milk Plain Greek Yogurt - 10💷","🍪Simple Truth Blueberry Breakfast Cookies - 20💷","🐻Chocolate Teddy Graham Snacks - 30💷","🍫Dark Chocolate Covered Almonds/Raisins - 30💷","🍪Belvita Blueberry Breakfast biscuits - 40💷","🍪Chips Ahoy 2 pack - 40💷","🎂Little Bites (Fudge/Banana) - 40💷"]'),
('frozenSnackContainer', '["🍕Jacks Pizza Bois - 20💷","🍨Breyers Mango Ice cream - 20💷","🍕Totinos Pizza rolls - 30💷","🥟Bibigo Chicken & Veggie Mini Wontos - 30💷","🍨Kroger Deluxe artisan Vanilla bean ice cream - 40💷","🍦So Delicious Vanilla Bean Coconut milk IceCream Sandwiches - 40💷"]'),
('concoctionsContainer', '["🚬THC Gummies - 40💷","☕VJ Hot Cocoa 500ml - 20💷","🍺Beer - 50💷","🥃Mixed Drink (2shots) - 50💷","🍷Wine Glass 500ml - 100💷","🍾Wine Bottle 750ml - 150💷"]'),
('mealModsContainer', '["🍔Fast Food Cheat Meal - 60💷","🍴Lunch Snack - 2💷","🌞Weekend AM Snack - 2💷","🎉SNACK-A-THON MOD(1/2) - 0💷","🎉🎉SNACK-A-THON MOD(2/2) - 0💷"]');

CREATE TABLE IF NOT EXISTS refreshment_options (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  option VARCHAR(100) NOT NULL,
  cost INTEGER NOT NULL
);
