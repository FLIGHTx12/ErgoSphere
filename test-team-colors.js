// Test script to verify team colors functionality
const fs = require('fs');
const path = require('path');

// Read the casino data to verify team structure
const casinoDataPath = path.join(__dirname, 'data', 'casino-data.json');
const casinoData = JSON.parse(fs.readFileSync(casinoDataPath, 'utf8'));

console.log('🎨 Testing Team Colors Implementation');
console.log('=====================================');

// Check if teams have the new structure
console.log('\n1. Verifying team data structure...');
const leagues = ['nfl', 'nba', 'wnba', 'ergoball', 'ergogolf'];

leagues.forEach(league => {
  const teams = casinoData.teams[league];
  if (!teams) {
    console.log(`❌ ${league.toUpperCase()}: No teams found`);
    return;
  }
  
  console.log(`✅ ${league.toUpperCase()}: ${teams.length} teams found`);
  
  // Check first team structure
  const firstTeam = teams[0];
  if (firstTeam.name && firstTeam.primaryColor && firstTeam.secondaryColor) {
    console.log(`   Sample: ${firstTeam.name} - Primary: ${firstTeam.primaryColor}, Secondary: ${firstTeam.secondaryColor}`);
  } else {
    console.log(`❌ ${league.toUpperCase()}: Teams missing color data`);
  }
});

// Test specific team color lookups
console.log('\n2. Testing specific team color lookups...');
const testCases = [
  { league: 'nfl', team: 'Minnesota Vikings' },
  { league: 'nba', team: 'Los Angeles Lakers' },
  { league: 'wnba', team: 'Minnesota Lynx' },
  { league: 'ergoball', team: 'Team FLIGHTx12!' },
  { league: 'ergogolf', team: 'Team Jaybers8' }
];

testCases.forEach(({ league, team }) => {
  const teams = casinoData.teams[league];
  const foundTeam = teams?.find(t => t.name === team);
  
  if (foundTeam) {
    console.log(`✅ ${team}: Primary ${foundTeam.primaryColor}, Secondary ${foundTeam.secondaryColor}`);
  } else {
    console.log(`❌ ${team}: Not found in ${league}`);
  }
});

console.log('\n3. Team colors implementation complete! ✨');
console.log('📋 Next steps:');
console.log('   - Open casino page in browser');
console.log('   - Select a user and league');
console.log('   - Choose teams to see colored team names');
console.log('   - Create a bet and check receipt for team colors');
console.log('   - View bet log to see colored team names');
