const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET endpoint to retrieve the current selections
router.get('/', async (req, res) => {
  try {
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
        next_bingwa_challenge AS "nextBingwaChallenge",
        atletico_workout AS "atleticoWorkout",
        weekly_errand AS "weeklyErrand",
        anime AS "anime",
        anime_end_date AS "animeEndDate",
        sunday_morning AS "sundayMorning",
        sunday_morning_end_date AS "sundayMorningEndDate",
        sunday_night AS "sundayNight",
        sunday_night_end_date AS "sundayNightEndDate",
        updated_at AS "lastUpdated"
      FROM weekly_selections ORDER BY id DESC LIMIT 1`
    );
    if (result.rows.length > 0) {
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
      res.json(row);
    } else {
      // Return default values if no data found
      const defaultData = {
        bingwaChampion: 'JAYBERS8',
        atleticoChamp: 'FLIGHTx12!',
        movieNight: 'Underwater (2020)',
        banquetMeal: '',
        brunchMeal: '',
        youtubeTheater: [],
        quarterlyGames: {
          q1: "",
          q2: "",
          q3: "",
          q4: ""
        },
        ergoArtSubject: 'Mars',
        nextBingwaChallenge: '',
        atleticoWorkout: '',
        weeklyErrand: '',
        anime: '',
        animeEndDate: '',
        sundayMorning: '',
        sundayMorningEndDate: '',
        sundayNight: '',
        sundayNightEndDate: '',
        lastUpdated: new Date().toISOString()
      };
      res.json(defaultData);
    }
  } catch (error) {
    console.error('Error retrieving selections:', error);
    res.status(500).json({ error: 'Failed to retrieve selections' });
  }
});

// POST endpoint to update the selections
router.post('/', async (req, res) => {
  try {
    const { bingwaChampion, atleticoChamp, movieNight, banquetMeal, brunchMeal, youtubeTheater, quarterlyGames, ergoArtSubject, nextBingwaChallenge, atleticoWorkout, weeklyErrand, anime, animeEndDate, sundayMorning, sundayMorningEndDate, sundayNight, sundayNightEndDate } = req.body;
    // Validate required fields
    if (!bingwaChampion || !atleticoChamp || !movieNight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Insert new selections (keep history by creating new records)
    const result = await pool.query(
      `INSERT INTO weekly_selections 
        (bingwa_champion, atletico_champ, movie_night, banquet_meal, brunch_meal, youtube_theater, 
         q1_game, q2_game, q3_game, q4_game, ergoart_subject, next_bingwa_challenge, atletico_workout, weekly_errand, 
         anime, anime_end_date, sunday_morning, sunday_morning_end_date, sunday_night, sunday_night_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20) RETURNING *`,
      [
        bingwaChampion,
        atleticoChamp,
        movieNight,
        banquetMeal || null,
        brunchMeal || null,
        youtubeTheater ? JSON.stringify(youtubeTheater) : null,
        quarterlyGames?.q1 || null,
        quarterlyGames?.q2 || null,
        quarterlyGames?.q3 || null,
        quarterlyGames?.q4 || null,
        ergoArtSubject || null,
        nextBingwaChallenge || null,
        atleticoWorkout || null,
        weeklyErrand || null,
        anime || null,
        animeEndDate || null,
        sundayMorning || null,
        sundayMorningEndDate || null,
        sundayNight || null,
        sundayNightEndDate || null
      ]
    );
    // Format quarterly games into an object for response
    const formattedQuarterlyGames = {
      q1: result.rows[0].q1_game || "",
      q2: result.rows[0].q2_game || "",
      q3: result.rows[0].q3_game || "",
      q4: result.rows[0].q4_game || ""
    };
    res.json({ 
      success: true, 
      message: 'Selections updated successfully',
      data: {
        bingwaChampion: result.rows[0].bingwa_champion,
        atleticoChamp: result.rows[0].atletico_champ,
        movieNight: result.rows[0].movie_night,
        banquetMeal: result.rows[0].banquet_meal,
        brunchMeal: result.rows[0].brunch_meal,
        youtubeTheater: result.rows[0].youtube_theater ? JSON.parse(result.rows[0].youtube_theater) : [],
        quarterlyGames: formattedQuarterlyGames,
        ergoArtSubject: result.rows[0].ergoart_subject || "",
        nextBingwaChallenge: result.rows[0].next_bingwa_challenge || "",
        atleticoWorkout: result.rows[0].atletico_workout || "",
        weeklyErrand: result.rows[0].weekly_errand || "",
        anime: result.rows[0].anime || "",
        animeEndDate: result.rows[0].anime_end_date || "",
        sundayMorning: result.rows[0].sunday_morning || "",
        sundayMorningEndDate: result.rows[0].sunday_morning_end_date || "",
        sundayNight: result.rows[0].sunday_night || "",
        sundayNightEndDate: result.rows[0].sunday_night_end_date || "",
        lastUpdated: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error updating selections:', error);
    res.status(500).json({ error: 'Failed to update selections' });
  }
});

module.exports = router;
