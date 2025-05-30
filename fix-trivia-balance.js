/**
 * Fix Trivia Balance Script
 * 
 * This script fixes the bias in trivia data where option B (index 1) 
 * is the correct answer ~78% of the time. It randomizes the correct 
 * answer positions while preserving the question content.
 */

const fs = require('fs');
const path = require('path');

// Directory containing trivia JSON files
const triviaDir = path.join(__dirname, 'data', 'trivia');

// Function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// Function to randomize correct answers in a trivia file
function randomizeTriviaAnswers(filePath) {
    try {
        console.log(`\nProcessing: ${path.basename(filePath)}`);
        
        // Read the JSON file
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        
        let stats = { before: { 0: 0, 1: 0, 2: 0 }, after: { 0: 0, 1: 0, 2: 0 } };
        
        // Process each question
        data.forEach((question, index) => {
            // Record original distribution
            stats.before[question.correct]++;
            
            // Get the current correct answer text
            const correctAnswerText = question.options[question.correct];
            
            // Shuffle the options array
            const shuffledOptions = shuffleArray(question.options);
            
            // Find the new index of the correct answer
            const newCorrectIndex = shuffledOptions.indexOf(correctAnswerText);
            
            // Update the question
            question.options = shuffledOptions;
            question.correct = newCorrectIndex;
            
            // Record new distribution
            stats.after[question.correct]++;
            
            console.log(`  Q${index + 1}: ${question.correct === 1 ? 'B' : question.correct === 0 ? 'A' : 'C'} - "${question.question.substring(0, 50)}..."`);
        });
        
        // Write the updated data back to the file
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        
        console.log(`  ✓ Updated ${data.length} questions`);
        console.log(`  Before: A=${stats.before[0]}, B=${stats.before[1]}, C=${stats.before[2]}`);
        console.log(`  After:  A=${stats.after[0]}, B=${stats.after[1]}, C=${stats.after[2]}`);
        
        return stats;
        
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return null;
    }
}

// Main function
function main() {
    console.log('🎯 ErgoArena Trivia Balance Fixer');
    console.log('==================================');
    console.log('Fixing bias where option B was correct ~78% of the time...\n');
    
    try {
        // Get all JSON files in the trivia directory
        const files = fs.readdirSync(triviaDir)
            .filter(file => file.endsWith('.json'))
            .map(file => path.join(triviaDir, file));
        
        console.log(`Found ${files.length} trivia files to process:`);
        files.forEach(file => console.log(`  - ${path.basename(file)}`));
        
        let totalStats = { 
            before: { 0: 0, 1: 0, 2: 0 }, 
            after: { 0: 0, 1: 0, 2: 0 } 
        };
        
        // Process each file
        files.forEach(file => {
            const stats = randomizeTriviaAnswers(file);
            if (stats) {
                totalStats.before[0] += stats.before[0];
                totalStats.before[1] += stats.before[1];
                totalStats.before[2] += stats.before[2];
                totalStats.after[0] += stats.after[0];
                totalStats.after[1] += stats.after[1];
                totalStats.after[2] += stats.after[2];
            }
        });
        
        // Calculate totals and percentages
        const totalBefore = totalStats.before[0] + totalStats.before[1] + totalStats.before[2];
        const totalAfter = totalStats.after[0] + totalStats.after[1] + totalStats.after[2];
        
        console.log('\n📊 FINAL STATISTICS');
        console.log('===================');
        console.log(`Total questions processed: ${totalBefore}`);
        console.log(`\nBEFORE (biased distribution):`);
        console.log(`  Option A: ${totalStats.before[0]} (${(totalStats.before[0]/totalBefore*100).toFixed(1)}%)`);
        console.log(`  Option B: ${totalStats.before[1]} (${(totalStats.before[1]/totalBefore*100).toFixed(1)}%)`);
        console.log(`  Option C: ${totalStats.before[2]} (${(totalStats.before[2]/totalBefore*100).toFixed(1)}%)`);
        
        console.log(`\nAFTER (randomized distribution):`);
        console.log(`  Option A: ${totalStats.after[0]} (${(totalStats.after[0]/totalAfter*100).toFixed(1)}%)`);
        console.log(`  Option B: ${totalStats.after[1]} (${(totalStats.after[1]/totalAfter*100).toFixed(1)}%)`);
        console.log(`  Option C: ${totalStats.after[2]} (${(totalStats.after[2]/totalAfter*100).toFixed(1)}%)`);
        
        console.log('\n✅ Trivia balance fix completed successfully!');
        console.log('🎮 Players can no longer game the system by always choosing option B!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the script
main();
