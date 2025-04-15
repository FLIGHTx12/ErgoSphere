const fs = require('fs').promises;
const path = require('path');
const pool = require('../db');

async function migrateJsonFiles() {
  try {
    console.log('Starting JSON file migration...');
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.log('Data directory not found. Creating it...');
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Data directory created.');
      return; // Exit if we just created the directory (no files to migrate)
    }
    
    // Get list of JSON files in data directory
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json') && 
      !file.includes('_backup_') && !file.includes('_'));
    
    console.log(`Found ${jsonFiles.length} JSON files to migrate`);
    
    for (const file of jsonFiles) {
      const category = file.replace('.json', '');
      const filePath = path.join(dataDir, file);
      
      console.log(`Migrating ${file} to database...`);
      
      try {
        // Read the file content
        const rawData = await fs.readFile(filePath, 'utf8');
        
        // Parse JSON safely with error handling
        let jsonData;
        try {
          jsonData = JSON.parse(rawData);
          
          // If we got here, JSON parsing was successful
          console.log(`Successfully parsed JSON from ${file}`);
        } catch (parseError) {
          console.error(`Error parsing JSON from ${file}:`, parseError.message);
          
          // Try to fix common JSON issues
          console.log(`Attempting to fix JSON format in ${file}...`);
          
          // Remove comments if present (JSON doesn't support comments)
          let cleanedData = rawData.replace(/\/\/.*$/gm, '');
          
          // Try parsing again after cleaning
          try {
            jsonData = JSON.parse(cleanedData);
            console.log(`Successfully parsed JSON after cleaning from ${file}`);
          } catch (secondParseError) {
            console.error(`Failed to parse JSON even after cleaning ${file}:`, secondParseError.message);
            console.log(`Skipping ${file}`);
            continue;
          }
        }
        
        // Check if this category already exists in the database
        const existingResult = await pool.query(
          'SELECT id FROM json_data WHERE category = $1',
          [category]
        );
        
        if (existingResult.rows.length > 0) {
          // Update existing entry
          await pool.query(
            'UPDATE json_data SET data = $1::jsonb, updated_at = NOW() WHERE category = $2',
            [JSON.stringify(jsonData), category]
          );
          console.log(`Updated existing data for ${category}`);
        } else {
          // Insert new entry
          await pool.query(
            'INSERT INTO json_data (category, data) VALUES ($1, $2::jsonb)',
            [category, JSON.stringify(jsonData)]
          );
          console.log(`Inserted new data for ${category}`);
        }
        
        // Create a backup in the database
        await pool.query(
          'INSERT INTO json_backups (category, data) VALUES ($1, $2::jsonb)',
          [category, JSON.stringify(jsonData)]
        );
        
      } catch (fileError) {
        console.error(`Error migrating ${file}:`, fileError);
      }
    }
    
    console.log('JSON file migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

migrateJsonFiles();
