const express = require('express');
const router = express.Router();
const pool = require('../db');

// Get all bets for a specific week
router.get('/:weekKey', async (req, res) => {
  try {
    // If the weekKey is a number, treat it as an ID lookup instead
    if (!isNaN(req.params.weekKey)) {
      const id = parseInt(req.params.weekKey, 10);
      const result = await pool.query('SELECT * FROM casino_bets WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Bet not found' });
      }
      return res.json(result.rows[0]);
    }
    
    const { weekKey } = req.params;
    const { userName } = req.query; // Optional filter by user name
    
    let query = 'SELECT * FROM casino_bets WHERE week_key = $1';
    const queryParams = [weekKey];
    
    // Add filter by user name if provided
    if (userName) {
      query += ' AND user_name = $2';
      queryParams.push(userName);
    }
    
    query += ' ORDER BY bet_date DESC';
    
    const result = await pool.query(query, queryParams);
    res.json(result.rows);
  } catch (err) {
    console.error('Error getting bets:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new bet entry
router.post('/', async (req, res) => {
  try {
    const { userName, league, awayTeam, homeTeam, weekKey, betData } = req.body;
    
    // Validate required fields
    if (!userName || !league || !awayTeam || !homeTeam || !weekKey || !betData) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const result = await pool.query(
      'INSERT INTO casino_bets (user_name, league, away_team, home_team, week_key, bet_data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [userName, league, awayTeam, homeTeam, weekKey, betData]
    );
    
    const newBet = result.rows[0];
    
    // Broadcast the new bet to all connected WebSocket clients
    if (req.app.locals.broadcastToClients) {
      req.app.locals.broadcastToClients({
        type: 'bet_created',
        data: newBet,
        weekKey: weekKey,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json(newBet);
  } catch (err) {
    console.error('Error creating bet:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a bet entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM casino_bets WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    const deletedBet = result.rows[0];
    
    // Broadcast the bet deletion to all connected WebSocket clients
    if (req.app.locals.broadcastToClients) {
      req.app.locals.broadcastToClients({
        type: 'bet_deleted',
        data: deletedBet,
        weekKey: deletedBet.week_key,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({ message: 'Bet deleted successfully' });
  } catch (err) {
    console.error('Error deleting bet:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update bet status (won/lost for each bet line)
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { betStatus, payoutData } = req.body;
    
    if (!betStatus) {
      return res.status(400).json({ error: 'Bet status data is required' });
    }
    
    const result = await pool.query(
      'UPDATE casino_bets SET bet_status = $1, payout_data = $2 WHERE id = $3 RETURNING *',
      [betStatus, payoutData || null, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    const updatedBet = result.rows[0];
    
    // Broadcast the bet status update to all connected WebSocket clients
    if (req.app.locals.broadcastToClients) {
      req.app.locals.broadcastToClients({
        type: 'bet_updated',
        data: updatedBet,
        weekKey: updatedBet.week_key,
        updateType: 'status',
        timestamp: new Date().toISOString()
      });
    }
    
    res.json(updatedBet);
  } catch (err) {
    console.error('Error updating bet status:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get payout receipt for a bet
router.get('/:id/payout', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM casino_bets WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Bet not found' });
    }
    
    const bet = result.rows[0];
    
    if (!bet.bet_status) {
      return res.status(400).json({ error: 'This bet has not been evaluated yet' });
    }
    
    res.json({
      bet,
      payout: bet.payout_data
    });
  } catch (err) {
    console.error('Error getting payout receipt:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
