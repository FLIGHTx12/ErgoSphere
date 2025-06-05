const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * API Health Check Endpoint 
 * Returns the health status of the API and the database
 */
router.get('/', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      api: { status: 'ok' },
      database: { status: 'unknown' }
    },
    version: process.env.npm_package_version || '1.0.0',
    uptime: process.uptime()
  };

  // Check database connection
  try {
    const dbResult = await pool.query('SELECT NOW()');
    
    if (dbResult && dbResult.rows && dbResult.rows.length > 0) {
      healthStatus.services.database = { 
        status: 'ok',
        latency: Date.now() - dbResult.rows[0].now
      };
    }
  } catch (error) {
    healthStatus.services.database = { 
      status: 'error', 
      message: error.message
    };
    healthStatus.status = 'degraded';
  }

  // Set appropriate HTTP status based on health
  const httpStatus = healthStatus.status === 'ok' ? 200 : 
                     healthStatus.status === 'degraded' ? 200 : 503;

  res.status(httpStatus).json(healthStatus);
});

// Additional endpoint for detailed diagnostics
router.get('/diagnostic', async (req, res) => {
  // This provides more detailed system information, useful for debugging
  try {
    const diagnostic = {
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      uptime: process.uptime(),
      processId: process.pid,
      platform: process.platform,
      nodeVersion: process.version,
      env: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    // Check database tables
    try {
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      diagnostic.database = {
        status: 'ok',
        tables: tableCheck.rows.map(row => row.table_name),
        connectionCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      };
    } catch (dbError) {
      diagnostic.database = {
        status: 'error',
        message: dbError.message
      };
    }
    
    res.json(diagnostic);
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;
