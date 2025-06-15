// Script to sync database with selections.json
const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function syncSelectionsToDb() {
  try {
    console.log('Syncing database with selections.json...');
    
    // Read the selections.json file
    const filePath = path.join(__dirname, '../data/selections.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const selections = JSON.parse(fileData);
    
    // Extract quarterly games from the selections object
    const quarterlyGames = selections.quarterlyGames || {
      q1: "",
      q2: "",
      q3: "",
      q4: ""
    };
    // Insert into the database
    const result = await pool.query(
      `INSERT INTO weekly_selections 
        (bingwa_champion, atletico_champ, movie_night, banquet_meal, brunch_meal, youtube_theater, 
         q1_game, q2_game, q3_game, q4_game, ergoart_subject, 
         anime, anime_end_date, sunday_morning, sunday_morning_end_date, sunday_night, sunday_night_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
      [
        selections.bingwaChampion,
        selections.atleticoChamp,
        selections.movieNight,
        selections.banquetMeal || null,
        selections.brunchMeal || null,
        selections.youtubeTheater ? JSON.stringify(selections.youtubeTheater) : null,
        quarterlyGames.q1 || null,
        quarterlyGames.q2 || null,
        quarterlyGames.q3 || null,
        quarterlyGames.q4 || null,
        selections.ergoArtSubject || null,
        selections.anime || null,
        selections.animeEndDate || null,
        selections.sundayMorning || null,
        selections.sundayMorningEndDate || null,
        selections.sundayNight || null,
        selections.sundayNightEndDate || null
      ]
    );
    
    console.log('Successfully synced database with selections.json!');
    console.log(`Inserted ID: ${result.rows[0].id}`);
  } catch (error) {
    console.error('Error syncing database with selections.json:', error);
  } finally {
    // Close the pool
    pool.end();
  }
}

// Run the sync
syncSelectionsToDb();
