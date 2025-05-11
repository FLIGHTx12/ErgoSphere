const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET endpoint to retrieve the current selections
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT bingwa_champion AS "bingwaChampion", atletico_champ AS "atleticoChamp", movie_night AS "movieNight", updated_at AS "lastUpdated" FROM weekly_selections ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      // Return default values if no data found
      const defaultData = {
        bingwaChampion: 'JAYBERS8',
        atleticoChamp: 'FLIGHTx12!',
        movieNight: 'Underwater (2020)',
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
    const { bingwaChampion, atleticoChamp, movieNight } = req.body;
    
    // Validate required fields
    if (!bingwaChampion || !atleticoChamp || !movieNight) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Insert new selections (keep history by creating new records)
    const result = await pool.query(
      'INSERT INTO weekly_selections (bingwa_champion, atletico_champ, movie_night) VALUES ($1, $2, $3) RETURNING *',
      [bingwaChampion, atleticoChamp, movieNight]
    );
    
    res.json({ 
      success: true, 
      message: 'Selections updated successfully',
      data: {
        bingwaChampion: result.rows[0].bingwa_champion,
        atleticoChamp: result.rows[0].atletico_champ,
        movieNight: result.rows[0].movie_night,
        lastUpdated: result.rows[0].updated_at
      }
    });  } catch (error) {
    console.error('Error updating selections:', error);
    res.status(500).json({ error: 'Failed to update selections' });
  }
});

module.exports = router;

module.exports = router;
