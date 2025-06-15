// Debug script to test the selections API
const axios = require('axios');

// Replace with your actual server URL
const serverUrl = 'http://localhost:3000';

async function testSelectionsApi() {
  console.log('Testing selections API...');
  
  try {
    console.log('GET /api/selections - Fetching current selections...');
    const response = await axios.get(`${serverUrl}/api/selections`);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
    // Create test data
    const testData = {
      bingwaChampion: 'JAYBERS8',
      atleticoChamp: 'FLIGHTx12!',
      movieNight: 'Test Movie',
      banquetMeal: 'Test Banquet',
      brunchMeal: 'Test Brunch',
      youtubeTheater: ['Test YouTube'],
      quarterlyGames: {
        q1: 'Test Q1',
        q2: 'Test Q2',
        q3: 'Test Q3',
        q4: 'Test Q4'
      },
      ergoArtSubject: 'Test Subject',
      nextBingwaChallenge: 'Test Challenge',
      atleticoWorkout: 'Test Workout',
      weeklyErrand: 'Test Errand',
      anime: 'Test Anime',
      animeEndDate: new Date().toISOString().split('T')[0],
      sundayMorning: 'Test Sunday Morning',
      sundayMorningEndDate: new Date().toISOString().split('T')[0],
      sundayNight: 'Test Sunday Night',
      sundayNightEndDate: new Date().toISOString().split('T')[0]
    };
    
    console.log('\nPOST /api/selections - Updating selections...');
    console.log('Sending data:', JSON.stringify(testData, null, 2));
    
    const updateResponse = await axios.post(`${serverUrl}/api/selections`, testData);
    console.log('Update response status:', updateResponse.status);
    console.log('Update response data:', JSON.stringify(updateResponse.data, null, 2));
    
    console.log('\nGET /api/selections - Verifying update...');
    const verifyResponse = await axios.get(`${serverUrl}/api/selections`);
    console.log('Verify status:', verifyResponse.status);
    console.log('Verify data:', JSON.stringify(verifyResponse.data, null, 2));
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during API test:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testSelectionsApi();
