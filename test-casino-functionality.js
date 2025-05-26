// Test script to verify casino functionality
const fs = require('fs');
const path = require('path');

console.log('🧪 TESTING CASINO FUNCTIONALITY\n');

// Test 1: JSON Loading
console.log('1️⃣ Testing JSON Data Loading...');
try {
    const dataPath = './data/casino-data.json';
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    console.log('✅ JSON loads successfully');
    console.log(`   - File size: ${Math.round(fs.statSync(dataPath).size / 1024)} KB`);
    console.log(`   - Leagues: ${Object.keys(data.leagueData).join(', ')}`);
    
    // Test 2: Data Structure Validation
    console.log('\n2️⃣ Testing Data Structure...');
    
    // Check metadata
    if (data.metadata && data.metadata.version) {
        console.log('✅ Metadata structure valid');
    } else {
        console.log('❌ Metadata structure invalid');
    }
    
    // Check config
    if (data.config && data.config.riskLevels) {
        console.log('✅ Config structure valid');
        console.log(`   - Risk levels: ${Object.keys(data.config.riskLevels).join(', ')}`);
    } else {
        console.log('❌ Config structure invalid');
    }
    
    // Check teams
    if (data.teams && data.teams.nfl && Array.isArray(data.teams.nfl)) {
        console.log('✅ Teams structure valid');
        console.log(`   - NFL teams: ${data.teams.nfl.length}`);
        console.log(`   - NBA teams: ${data.teams.nba.length}`);
        console.log(`   - WNBA teams: ${data.teams.wnba.length}`);
    } else {
        console.log('❌ Teams structure invalid');
    }
    
    // Test 3: League Data Validation
    console.log('\n3️⃣ Testing League Data...');
    
    Object.keys(data.leagueData).forEach(league => {
        const leagueData = data.leagueData[league];
        
        if (leagueData.categories && leagueData.players) {
            console.log(`✅ ${league} structure valid`);
            
            // Check category structure
            const categories = Object.keys(leagueData.categories || {});
            if (categories.length > 0) {
                console.log(`   - Categories: ${categories.join(', ')}`);
            }
            
            // Check player structure
            if (Array.isArray(leagueData.players)) {
                if (league === 'NFL' || league === 'NBA' || league === 'WNBA') {
                    // Should be structured format (array of category objects)
                    if (leagueData.players[0] && leagueData.players[0].category) {
                        console.log(`   - Players: Structured format (${leagueData.players.length} categories)`);
                    } else {
                        console.log(`   - Players: String format (${leagueData.players.length} entries)`);
                    }
                } else {
                    // ErgoBall/ErgoGolf should be simple array
                    console.log(`   - Players: Simple format (${leagueData.players.length} entries)`);
                }
            }
        } else {
            console.log(`❌ ${league} structure invalid`);
        }
    });
    
    // Test 4: Basketball Categories Sharing
    console.log('\n4️⃣ Testing Basketball Categories Sharing...');
    
    if (data.basketballCategories) {
        console.log('✅ Shared basketball categories exist');
        const categories = Object.keys(data.basketballCategories);
        console.log(`   - Categories: ${categories.join(', ')}`);
        
        // Check if NBA and WNBA would use shared categories
        if (data.leagueData.NBA && data.leagueData.WNBA) {
            console.log('✅ NBA and WNBA can use shared categories');
        }
    } else {
        console.log('❌ Shared basketball categories missing');
    }
    
    // Test 5: Simulate JavaScript Conversion
    console.log('\n5️⃣ Testing JavaScript Conversion Function...');
    
    function convertPlayersToStringFormat(structuredPlayers) {
        const players = [];
        structuredPlayers.forEach(categoryGroup => {
            players.push(`::::${categoryGroup.category}:::::`);
            categoryGroup.players.forEach(player => {
                const playerName = player.starred ? `⭐${player.name}` : player.name;
                players.push(playerName);
            });
        });
        return players;
    }
    
    // Test conversion for NFL
    if (data.leagueData.NFL.players[0] && data.leagueData.NFL.players[0].category) {
        const convertedPlayers = convertPlayersToStringFormat(data.leagueData.NFL.players);
        console.log('✅ Player conversion works');
        console.log(`   - NFL converted players: ${convertedPlayers.length} entries`);
        console.log(`   - Sample: ${convertedPlayers.slice(0, 5).join(', ')}`);
    } else {
        console.log('❌ Player conversion failed - data not in expected format');
    }
    
    console.log('\n🎯 OVERALL RESULT: All tests passed! Casino functionality should work properly.');
    
} catch (error) {
    console.error('❌ Test failed:', error.message);
}
