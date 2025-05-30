/**
 * Enhanced Trivia Data Creator
 * 
 * This script expands the trivia questions to include more wrong answer options,
 * creating a larger pool to randomly select from for each question.
 */

const fs = require('fs');
const path = require('path');

// Directory containing trivia JSON files
const triviaDir = path.join(__dirname, 'data', 'trivia');

// Enhanced trivia data with additional wrong answers
const enhancedTriviaData = {
  'history.json': [
    {
      "question": "Which ancient civilization built Machu Picchu?",
      "correctAnswer": "Inca",
      "wrongAnswers": ["Aztec", "Maya", "Egyptian", "Roman", "Greek", "Chinese"]
    },
    {
      "question": "In what year did World War II end?",
      "correctAnswer": "1945",
      "wrongAnswers": ["1944", "1946", "1943", "1947", "1942", "1948"]
    },
    {
      "question": "Who was the first President of the United States?",
      "correctAnswer": "George Washington",
      "wrongAnswers": ["Thomas Jefferson", "John Adams", "Benjamin Franklin", "Alexander Hamilton", "James Madison", "Patrick Henry"]
    },
    {
      "question": "The Berlin Wall fell in which year?",
      "correctAnswer": "1989",
      "wrongAnswers": ["1987", "1991", "1988", "1990", "1985", "1992"]
    },
    {
      "question": "Which empire was ruled by Julius Caesar?",
      "correctAnswer": "Roman Empire",
      "wrongAnswers": ["Greek Empire", "Ottoman Empire", "Byzantine Empire", "Persian Empire", "Mongol Empire", "Egyptian Empire"]
    },
    {
      "question": "The Great Wall of China was primarily built to defend against which group?",
      "correctAnswer": "Mongols",
      "wrongAnswers": ["Japanese", "Russians", "Koreans", "Vietnamese", "Tibetans", "Indians"]
    },
    {
      "question": "Who was known as the 'Iron Lady'?",
      "correctAnswer": "Margaret Thatcher",
      "wrongAnswers": ["Queen Elizabeth II", "Golda Meir", "Indira Gandhi", "Angela Merkel", "Catherine the Great", "Joan of Arc"]
    },
    {
      "question": "The American Civil War began in which year?",
      "correctAnswer": "1861",
      "wrongAnswers": ["1859", "1863", "1860", "1862", "1858", "1864"]
    },
    {
      "question": "Which ancient wonder of the world was located in Alexandria?",
      "correctAnswer": "Lighthouse of Alexandria",
      "wrongAnswers": ["Hanging Gardens", "Colossus of Rhodes", "Statue of Zeus", "Temple of Artemis", "Mausoleum at Halicarnassus", "Great Pyramid"]
    },
    {
      "question": "The French Revolution began in which year?",
      "correctAnswer": "1789",
      "wrongAnswers": ["1787", "1791", "1788", "1790", "1786", "1792"]
    }
  ],
  
  'games.json': [
    {
      "question": "Which game features the character Mario?",
      "correctAnswer": "Super Mario Bros",
      "wrongAnswers": ["Sonic the Hedgehog", "Pac-Man", "Donkey Kong", "Zelda", "Metroid", "Street Fighter"]
    },
    {
      "question": "What is the best-selling video game of all time?",
      "correctAnswer": "Minecraft",
      "wrongAnswers": ["Tetris", "Grand Theft Auto V", "Fortnite", "PUBG", "Wii Sports", "Super Mario Bros"]
    },
    {
      "question": "Which company created the PlayStation?",
      "correctAnswer": "Sony",
      "wrongAnswers": ["Nintendo", "Microsoft", "Sega", "Atari", "Activision", "Electronic Arts"]
    },
    {
      "question": "What does 'RPG' stand for in gaming?",
      "correctAnswer": "Role Playing Game",
      "wrongAnswers": ["Real Player Game", "Rapid Pace Gaming", "Random Player Generator", "Role Performance Game", "Real Play Gaming", "Racing Performance Game"]
    },
    {
      "question": "Which game popularized the battle royale genre?",
      "correctAnswer": "PUBG",
      "wrongAnswers": ["Fortnite", "Apex Legends", "Call of Duty", "H1Z1", "DayZ", "Minecraft Hunger Games"]
    },
    {
      "question": "What is the maximum level in classic Pac-Man?",
      "correctAnswer": "256",
      "wrongAnswers": ["255", "999", "100", "200", "300", "500"]
    },
    {
      "question": "Which game series features Master Chief?",
      "correctAnswer": "Halo",
      "wrongAnswers": ["Call of Duty", "Destiny", "Gears of War", "Mass Effect", "Dead Space", "Titanfall"]
    },
    {
      "question": "What year was the original Nintendo Entertainment System released in North America?",
      "correctAnswer": "1985",
      "wrongAnswers": ["1983", "1987", "1984", "1986", "1982", "1988"]
    },
    {
      "question": "Which game features the city of Vice City?",
      "correctAnswer": "Grand Theft Auto",
      "wrongAnswers": ["Saints Row", "Watch Dogs", "Mafia", "Sleeping Dogs", "The Getaway", "Driver"]
    },
    {
      "question": "What is the currency in World of Warcraft?",
      "correctAnswer": "Gold",
      "wrongAnswers": ["Credits", "Coins", "Gems", "Gil", "Zeny", "Crowns"]
    }
  ],

  'music.json': [
    {
      "question": "Which band released the album 'Abbey Road'?",
      "correctAnswer": "The Beatles",
      "wrongAnswers": ["The Rolling Stones", "Led Zeppelin", "Pink Floyd", "Queen", "The Who", "The Kinks"]
    },
    {
      "question": "What instrument does Yo-Yo Ma famously play?",
      "correctAnswer": "Cello",
      "wrongAnswers": ["Violin", "Piano", "Viola", "Double Bass", "Harp", "Flute"]
    },
    {
      "question": "Which composer wrote 'The Four Seasons'?",
      "correctAnswer": "Vivaldi",
      "wrongAnswers": ["Bach", "Mozart", "Beethoven", "Handel", "Tchaikovsky", "Chopin"]
    },
    {
      "question": "What genre of music originated in New Orleans?",
      "correctAnswer": "Jazz",
      "wrongAnswers": ["Blues", "Rock", "Country", "Reggae", "Hip Hop", "Gospel"]
    },
    {
      "question": "Which artist painted 'Starry Night'?",
      "correctAnswer": "Vincent van Gogh",
      "wrongAnswers": ["Pablo Picasso", "Claude Monet", "Leonardo da Vinci", "Salvador Dalí", "Henri Matisse", "Paul Cézanne"]
    },
    {
      "question": "What does 'forte' mean in music?",
      "correctAnswer": "Loud",
      "wrongAnswers": ["Soft", "Fast", "Slow", "High", "Low", "Smooth"]
    },
    {
      "question": "Which musical has the song 'Memory'?",
      "correctAnswer": "Cats",
      "wrongAnswers": ["Phantom of the Opera", "Les Misérables", "Chicago", "Wicked", "Hamilton", "The Lion King"]
    },
    {
      "question": "How many strings does a standard guitar have?",
      "correctAnswer": "6",
      "wrongAnswers": ["5", "7", "4", "8", "12", "10"]
    },
    {
      "question": "Which rapper's real name is Marshall Mathers?",
      "correctAnswer": "Eminem",
      "wrongAnswers": ["Jay-Z", "Kanye West", "50 Cent", "Dr. Dre", "Snoop Dogg", "Tupac"]
    },
    {
      "question": "What is the highest male singing voice?",
      "correctAnswer": "Countertenor",
      "wrongAnswers": ["Tenor", "Baritone", "Bass", "Alto", "Soprano", "Mezzo-soprano"]
    }
  ]
};

// Function to create enhanced trivia format
function createEnhancedTriviaFile(filename, questionsData) {
  const filePath = path.join(triviaDir, filename);
  
  console.log(`\nCreating enhanced ${filename}...`);
  
  const enhancedQuestions = questionsData.map((q, index) => {
    console.log(`  Q${index + 1}: "${q.question.substring(0, 50)}..." (${q.wrongAnswers.length} wrong options)`);
    return {
      question: q.question,
      correctAnswer: q.correctAnswer,
      wrongAnswers: q.wrongAnswers
    };
  });
  
  // Write the enhanced format
  fs.writeFileSync(filePath, JSON.stringify(enhancedQuestions, null, 2));
  console.log(`  ✓ Created with ${enhancedQuestions.length} questions`);
}

// Main function
function main() {
  console.log('🎯 Enhanced Trivia Data Creator');
  console.log('===============================');
  console.log('Creating trivia files with expanded wrong answer pools...\n');
  
  try {
    // Create enhanced trivia files
    Object.entries(enhancedTriviaData).forEach(([filename, data]) => {
      createEnhancedTriviaFile(filename, data);
    });
    
    console.log('\n✅ Enhanced trivia data creation completed!');
    console.log('📊 Benefits:');
    console.log('  - More wrong answer variety (6+ options per question)');
    console.log('  - Random selection creates unique gameplay each time');
    console.log('  - Correct answer position is always randomized');
    console.log('  - Harder to memorize patterns');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
