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
    const { bingwaChampion, atleticoChamp, movieNight, banquetMeal, brunchMeal, youtubeTheater } = req.body;
    // Validate required fields
    if (!bingwaChampion || !atleticoChamp || !movieNight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    // Insert new selections (keep history by creating new records)
    const result = await pool.query(
      `INSERT INTO weekly_selections 
        (bingwa_champion, atletico_champ, movie_night, banquet_meal, brunch_meal, youtube_theater)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        bingwaChampion,
        atleticoChamp,
        movieNight,
        banquetMeal || null,
        brunchMeal || null,
        youtubeTheater ? JSON.stringify(youtubeTheater) : null
      ]
    );
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
        lastUpdated: result.rows[0].updated_at
      }
    });
  } catch (error) {
    console.error('Error updating selections:', error);
    res.status(500).json({ error: 'Failed to update selections' });
  }
});

module.exports = router;
