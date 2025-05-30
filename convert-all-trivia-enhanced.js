/**
 * Complete Enhanced Trivia Converter
 * 
 * This script converts ALL trivia categories to the enhanced format
 * with expanded wrong answer pools for maximum variety.
 */

const fs = require('fs');
const path = require('path');

// Directory containing trivia JSON files
const triviaDir = path.join(__dirname, 'data', 'trivia');

// Complete enhanced trivia data for all categories
const completeEnhancedTriviaData = {
  'coding.json': [
    {
      "question": "What does 'HTML' stand for?",
      "correctAnswer": "HyperText Markup Language",
      "wrongAnswers": ["High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language", "Heavy Text Management Language", "HyperText Management Language", "High Transfer Markup Language"]
    },
    {
      "question": "Which programming language is known for 'Write Once, Run Anywhere'?",
      "correctAnswer": "Java",
      "wrongAnswers": ["Python", "C++", "JavaScript", "C#", "Ruby", "Go", "Kotlin"]
    },
    {
      "question": "What does 'CSS' stand for?",
      "correctAnswer": "Cascading Style Sheets",
      "wrongAnswers": ["Computer Style Sheets", "Creative Style Sheets", "Colorful Style Sheets", "Common Style Sheets", "Code Style Sheets", "Central Style Sheets"]
    },
    {
      "question": "Which symbol is used for comments in JavaScript?",
      "correctAnswer": "//",
      "wrongAnswers": ["#", "/*", "<!--", "%", ";;", "**"]
    },
    {
      "question": "What does 'API' stand for?",
      "correctAnswer": "Application Programming Interface",
      "wrongAnswers": ["Advanced Programming Interface", "Automated Programming Interface", "Application Protocol Interface", "Advanced Protocol Interface", "Application Process Interface", "Automated Process Interface"]
    },
    {
      "question": "Which data structure uses LIFO (Last In, First Out)?",
      "correctAnswer": "Stack",
      "wrongAnswers": ["Queue", "Array", "List", "Tree", "Graph", "Hash Table"]
    },
    {
      "question": "What does 'SQL' stand for?",
      "correctAnswer": "Structured Query Language",
      "wrongAnswers": ["Simple Query Language", "Standard Query Language", "Sequential Query Language", "Structured Question Language", "System Query Language", "Stored Query Language"]
    },
    {
      "question": "Which method is used to add an element to the end of an array in JavaScript?",
      "correctAnswer": "push()",
      "wrongAnswers": ["append()", "add()", "insert()", "concat()", "extend()", "attach()"]
    },
    {
      "question": "What does 'OOP' stand for in programming?",
      "correctAnswer": "Object-Oriented Programming",
      "wrongAnswers": ["Object-Optimized Programming", "Organized Object Programming", "Object-Oriented Process", "Optimized Object Programming", "Object-Oriented Protocol", "Organized Operational Programming"]
    },
    {
      "question": "Which HTTP status code indicates 'Not Found'?",
      "correctAnswer": "404",
      "wrongAnswers": ["500", "403", "401", "400", "502", "503"]
    }
  ],

  'construction.json': [
    {
      "question": "What does 'RFI' stand for in construction?",
      "correctAnswer": "Request for Information",
      "wrongAnswers": ["Request for Installation", "Required Facility Information", "Ready for Inspection", "Request for Implementation", "Required Field Information", "Ready for Installation"]
    },
    {
      "question": "Which document typically contains the project specifications?",
      "correctAnswer": "Contract Documents",
      "wrongAnswers": ["Blueprint", "Schedule", "Budget", "Work Order", "Permit", "Invoice"]
    },
    {
      "question": "What is a 'submittal' in construction?",
      "correctAnswer": "Documentation for approval",
      "wrongAnswers": ["Final payment", "Change order", "Work schedule", "Safety report", "Quality inspection", "Material delivery"]
    },
    {
      "question": "What does 'PCO' stand for?",
      "correctAnswer": "Potential Change Order",
      "wrongAnswers": ["Project Control Office", "Primary Construction Order", "Project Completion Order", "Principal Contractor Organization", "Project Cost Overview", "Primary Contract Officer"]
    },
    {
      "question": "Which phase comes after 'Design Development'?",
      "correctAnswer": "Construction Documents",
      "wrongAnswers": ["Schematic Design", "Bidding", "Construction", "Programming", "Conceptual Design", "Pre-Design"]
    },
    {
      "question": "What is the purpose of a 'Pay Application'?",
      "correctAnswer": "Request payment for work completed",
      "wrongAnswers": ["Apply for permits", "Submit change orders", "Request materials", "Schedule inspections", "Report safety incidents", "Update project timeline"]
    },
    {
      "question": "What does 'AIA' commonly refer to in construction?",
      "correctAnswer": "American Institute of Architects",
      "wrongAnswers": ["American Industrial Association", "Architectural Industry Alliance", "Associated Infrastructure Alliance", "American Infrastructure Association", "Architectural Inspection Agency", "American Installation Association"]
    },
    {
      "question": "What is 'retainage' in construction contracts?",
      "correctAnswer": "Percentage of payment withheld",
      "wrongAnswers": ["Extra work compensation", "Material storage fee", "Equipment rental cost", "Insurance premium", "Performance bonus", "Overtime payment"]
    },
    {
      "question": "What does 'CCO' stand for?",
      "correctAnswer": "Contract Change Order",
      "wrongAnswers": ["Chief Construction Officer", "Construction Completion Order", "Contract Compliance Officer", "Construction Control Office", "Contract Cost Overview", "Chief Contracting Officer"]
    },
    {
      "question": "What is the purpose of a 'punch list'?",
      "correctAnswer": "List of items to complete/correct",
      "wrongAnswers": ["Safety checklist", "Material inventory", "Work schedule", "Payment request", "Permit application", "Quality standards"]
    }
  ],

  'sports.json': [
    {
      "question": "How many players are on a basketball team on the court at one time?",
      "correctAnswer": "5",
      "wrongAnswers": ["6", "4", "7", "8", "3", "9"]
    },
    {
      "question": "Which sport is known as 'America's Pastime'?",
      "correctAnswer": "Baseball",
      "wrongAnswers": ["Football", "Basketball", "Hockey", "Golf", "Tennis", "Soccer"]
    },
    {
      "question": "How many holes are played in a standard round of golf?",
      "correctAnswer": "18",
      "wrongAnswers": ["9", "12", "16", "20", "24", "15"]
    },
    {
      "question": "What is the maximum score possible in ten-pin bowling?",
      "correctAnswer": "300",
      "wrongAnswers": ["250", "200", "350", "400", "280", "320"]
    },
    {
      "question": "Which country won the FIFA World Cup in 2018?",
      "correctAnswer": "France",
      "wrongAnswers": ["Brazil", "Germany", "Argentina", "Spain", "Italy", "Croatia"]
    },
    {
      "question": "How long is a marathon race?",
      "correctAnswer": "26.2 miles",
      "wrongAnswers": ["25 miles", "30 miles", "24 miles", "26 miles", "27 miles", "28 miles"]
    },
    {
      "question": "In tennis, what is a score of zero called?",
      "correctAnswer": "Love",
      "wrongAnswers": ["Nil", "Zero", "Nothing", "Blank", "Empty", "Void"]
    },
    {
      "question": "Which sport uses the term 'slam dunk'?",
      "correctAnswer": "Basketball",
      "wrongAnswers": ["Volleyball", "Tennis", "Baseball", "Football", "Hockey", "Soccer"]
    },
    {
      "question": "How many periods are in a hockey game?",
      "correctAnswer": "3",
      "wrongAnswers": ["2", "4", "5", "6", "1", "8"]
    },
    {
      "question": "What is the highest possible hand in poker?",
      "correctAnswer": "Royal Flush",
      "wrongAnswers": ["Straight Flush", "Four of a Kind", "Full House", "Flush", "Straight", "Three of a Kind"]
    }
  ],

  'spanish-english.json': [
    {
      "question": "What does 'Hola' mean in English?",
      "correctAnswer": "Hello",
      "wrongAnswers": ["Goodbye", "Please", "Thank you", "Yes", "No", "Excuse me"]
    },
    {
      "question": "How do you say 'Good morning' in Spanish?",
      "correctAnswer": "Buenos días",
      "wrongAnswers": ["Buenas noches", "Buenas tardes", "Hola", "Adiós", "Gracias", "Por favor"]
    },
    {
      "question": "What is the past tense of 'go' in English?",
      "correctAnswer": "Went",
      "wrongAnswers": ["Goed", "Gone", "Going", "Goes", "Wented", "Goed"]
    },
    {
      "question": "Which word means 'water' in Spanish?",
      "correctAnswer": "Agua",
      "wrongAnswers": ["Fuego", "Tierra", "Aire", "Comida", "Casa", "Libro"]
    },
    {
      "question": "What does 'Please' mean in Spanish?",
      "correctAnswer": "Por favor",
      "wrongAnswers": ["Gracias", "De nada", "Lo siento", "Perdón", "Con permiso", "Disculpe"]
    },
    {
      "question": "Which is the correct plural of 'child' in English?",
      "correctAnswer": "Children",
      "wrongAnswers": ["Childs", "Childes", "Childrens", "Child", "Childern", "Childer"]
    },
    {
      "question": "How do you say 'red' in Spanish?",
      "correctAnswer": "Rojo",
      "wrongAnswers": ["Azul", "Verde", "Amarillo", "Negro", "Blanco", "Rosa"]
    },
    {
      "question": "What type of word is 'quickly'?",
      "correctAnswer": "Adverb",
      "wrongAnswers": ["Noun", "Verb", "Adjective", "Pronoun", "Preposition", "Conjunction"]
    },
    {
      "question": "What does 'Gracias' mean in English?",
      "correctAnswer": "Thank you",
      "wrongAnswers": ["Please", "Hello", "Goodbye", "Excuse me", "I'm sorry", "You're welcome"]
    },
    {
      "question": "Which sentence is grammatically correct?",
      "correctAnswer": "She is going to the store",
      "wrongAnswers": ["She are going to the store", "She going to the store", "She is go to the store", "She is goes to the store", "She be going to the store", "She were going to the store"]
    }
  ],

  'movies-shows.json': [
    {
      "question": "Which movie features the quote 'May the Force be with you'?",
      "correctAnswer": "Star Wars",
      "wrongAnswers": ["Star Trek", "Indiana Jones", "Back to the Future", "E.T.", "Close Encounters", "The Matrix"]
    },
    {
      "question": "Who played the character of Jack Sparrow?",
      "correctAnswer": "Johnny Depp",
      "wrongAnswers": ["Orlando Bloom", "Will Smith", "Brad Pitt", "Leonardo DiCaprio", "Tom Cruise", "Russell Crowe"]
    },
    {
      "question": "Which TV show features the character Walter White?",
      "correctAnswer": "Breaking Bad",
      "wrongAnswers": ["Better Call Saul", "The Sopranos", "Mad Men", "Dexter", "House of Cards", "Homeland"]
    },
    {
      "question": "What is the highest-grossing film of all time?",
      "correctAnswer": "Avatar",
      "wrongAnswers": ["Avengers: Endgame", "Titanic", "Star Wars", "Jurassic Park", "The Lion King", "Frozen"]
    },
    {
      "question": "Which series features dragons and the Iron Throne?",
      "correctAnswer": "Game of Thrones",
      "wrongAnswers": ["The Witcher", "House of the Dragon", "Lord of the Rings", "Vikings", "The Last Kingdom", "Merlin"]
    },
    {
      "question": "Who directed the movie 'Jaws'?",
      "correctAnswer": "Steven Spielberg",
      "wrongAnswers": ["George Lucas", "Martin Scorsese", "Francis Ford Coppola", "Ridley Scott", "James Cameron", "Tim Burton"]
    },
    {
      "question": "Which animated movie features the song 'Let It Go'?",
      "correctAnswer": "Frozen",
      "wrongAnswers": ["Moana", "Tangled", "The Little Mermaid", "Beauty and the Beast", "Aladdin", "The Lion King"]
    },
    {
      "question": "What is the name of Ross's pet monkey in Friends?",
      "correctAnswer": "Marcel",
      "wrongAnswers": ["Charlie", "George", "Buddy", "Max", "Sam", "Oscar"]
    },
    {
      "question": "Which superhero is known as the 'Dark Knight'?",
      "correctAnswer": "Batman",
      "wrongAnswers": ["Superman", "Spider-Man", "Iron Man", "Captain America", "Thor", "Green Lantern"]
    },
    {
      "question": "In The Office, what is Jim's last name?",
      "correctAnswer": "Halpert",
      "wrongAnswers": ["Beesly", "Schrute", "Scott", "Martin", "Howard", "Palmer"]
    }
  ],

  'minneapolis-chicago.json': [
    {
      "question": "What is the tallest building in Minneapolis?",
      "correctAnswer": "IDS Tower",
      "wrongAnswers": ["Wells Fargo Centre", "Capella Tower", "US Bank Plaza", "Target Plaza", "Accenture Tower", "Campbell Mithun Tower"]
    },
    {
      "question": "Which river runs through Minneapolis?",
      "correctAnswer": "Mississippi River",
      "wrongAnswers": ["Minnesota River", "St. Croix River", "Missouri River", "Ohio River", "Colorado River", "Columbia River"]
    },
    {
      "question": "What is Chicago's nickname?",
      "correctAnswer": "The Windy City",
      "wrongAnswers": ["The Second City", "The City of Big Shoulders", "Chi-Town", "The Windy Apple", "The Great City", "The Lake City"]
    },
    {
      "question": "Which professional basketball team plays in Chicago?",
      "correctAnswer": "Bulls",
      "wrongAnswers": ["Bears", "Cubs", "White Sox", "Blackhawks", "Fire", "Sky"]
    },
    {
      "question": "What is the name of Minneapolis's main airport?",
      "correctAnswer": "Minneapolis-St. Paul International",
      "wrongAnswers": ["Minneapolis International", "Twin Cities Airport", "Metro Airport", "North Star Airport", "Prairie Airport", "Midwest International"]
    },
    {
      "question": "Which famous architect designed many buildings in Chicago?",
      "correctAnswer": "Frank Lloyd Wright",
      "wrongAnswers": ["Louis Sullivan", "Daniel Burnham", "Mies van der Rohe", "I.M. Pei", "Philip Johnson", "Frank Gehry"]
    },
    {
      "question": "What is the name of the famous theater district in Minneapolis?",
      "correctAnswer": "Hennepin Theatre District",
      "wrongAnswers": ["Warehouse District", "Mill District", "Downtown East", "Nicollet Mall", "Riverfront District", "Arts Quarter"]
    },
    {
      "question": "Which lake is Chicago located on?",
      "correctAnswer": "Lake Michigan",
      "wrongAnswers": ["Lake Superior", "Lake Huron", "Lake Erie", "Lake Ontario", "Lake Minnetonka", "Lake Calhoun"]
    },
    {
      "question": "What is Minneapolis's sister city?",
      "correctAnswer": "St. Paul",
      "wrongAnswers": ["Bloomington", "Edina", "Plymouth", "Minnetonka", "Hopkins", "Richfield"]
    },
    {
      "question": "Which major street runs through downtown Chicago?",
      "correctAnswer": "Michigan Avenue",
      "wrongAnswers": ["State Street", "LaSalle Street", "Wacker Drive", "Lake Shore Drive", "Clark Street", "Wells Street"]
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
  console.log('🎯 Complete Enhanced Trivia Converter');
  console.log('=====================================');
  console.log('Converting ALL trivia categories to enhanced format...\n');
  
  try {
    // Create enhanced trivia files
    Object.entries(completeEnhancedTriviaData).forEach(([filename, data]) => {
      createEnhancedTriviaFile(filename, data);
    });
    
    console.log('\n✅ Complete enhanced trivia conversion completed!');
    console.log('📊 Enhanced Features:');
    console.log('  - 6-7 wrong answer options per question');
    console.log('  - Random selection of 2 wrong + 1 correct answer');
    console.log('  - Randomized answer positions every time');
    console.log('  - Unique gameplay experience each round');
    console.log('  - Compatible with existing trivia system');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();
