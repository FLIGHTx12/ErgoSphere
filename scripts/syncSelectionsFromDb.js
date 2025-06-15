// Script to sync selections.json with the database
const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function syncSelectionsFromDb() {
  try {
    console.log('Syncing selections.json with database...');
    
    // Get the latest selections from the database
    const result = await pool.query(
      `SELECT 
        bingwa_champion AS "bingwaChampion",
        atletico_champ AS "atleticoChamp",
        movie_night AS "movieNight",
        banquet_meal AS "banquetMeal",
        brunch_meal AS "brunchMeal",
        youtube_theater AS "youtubeTheater",
        q1_game AS "q1",
        q2_game AS "q2",
        q3_game AS "q3", 
        q4_game AS "q4",
        ergoart_subject AS "ergoArtSubject",
        anime AS "anime",
        anime_end_date AS "animeEndDate",
        sunday_morning AS "sundayMorning",
        sunday_morning_end_date AS "sundayMorningEndDate",
        sunday_night AS "sundayNight",
        sunday_night_end_date AS "sundayNightEndDate",
        updated_at AS "lastUpdated"
      FROM weekly_selections ORDER BY id DESC LIMIT 1`
    );
    
    if (result.rows.length === 0) {
      console.log('No selections found in the database.');
      return;
    }
    
    // Parse youtubeTheater as JSON array if present
    const row = result.rows[0];
    if (row.youtubeTheater) {
      try { row.youtubeTheater = JSON.parse(row.youtubeTheater); } catch { row.youtubeTheater = []; }
    } else {
      row.youtubeTheater = [];
    }
    
    // Format quarterly games into an object
    const quarterlyGames = {
      q1: row.q1 || "",
      q2: row.q2 || "",
      q3: row.q3 || "",
      q4: row.q4 || ""
    };
    
    // Delete individual quarter fields from response
    delete row.q1;
    delete row.q2;
    delete row.q3;
    delete row.q4;
    
    // Add the quarterlyGames object
    row.quarterlyGames = quarterlyGames;
    // Convert the data to pretty JSON
    const jsonData = JSON.stringify(row, null, 2);
    // Write to selections.json
    const filePath = path.join(__dirname, '../data/selections.json');
    await fs.writeFile(filePath, jsonData);
    
    console.log('Successfully synced selections.json with database!');
  } catch (error) {
    console.error('Error syncing selections.json with database:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

// Run the sync
syncSelectionsFromDb();
