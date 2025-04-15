const fs = require('fs').promises;
const path = require('path');

async function validateJsonFiles() {
  try {
    console.log('Starting JSON file validation...');
    const dataDir = path.join(__dirname, '..', 'data');
    
    // Ensure data directory exists
    try {
      await fs.access(dataDir);
    } catch (error) {
      console.error('Data directory not found.');
      return;
    }
    
    // Get list of JSON files in data directory
    const files = await fs.readdir(dataDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    console.log(`Found ${jsonFiles.length} JSON files to validate`);
    
    let fixedCount = 0;
    
    for (const file of jsonFiles) {
      const filePath = path.join(dataDir, file);
      
      try {
        // Read the file content
        const rawData = await fs.readFile(filePath, 'utf8');
        
        // Try to parse JSON
        try {
          JSON.parse(rawData);
          console.log(`✓ ${file} is valid JSON`);
        } catch (parseError) {
          console.error(`✗ ${file} is NOT valid JSON:`, parseError.message);
          
          // Try to fix common JSON issues
          console.log(`  Attempting to fix ${file}...`);
          
          // Remove comments if present
          let cleanedData = rawData.replace(/\/\/.*$/gm, '');
          
          // Check for trailing commas in objects/arrays
          cleanedData = cleanedData.replace(/,\s*([}\]])/g, '$1');
          
          // Try parsing again after cleaning
          try {
            JSON.parse(cleanedData);
            console.log(`  Fixed JSON format successfully! Writing back to ${file}`);
            
            // Create backup of original file
            const backupDir = path.join(dataDir, 'backups');
            await fs.mkdir(backupDir, { recursive: true });
            await fs.writeFile(
              path.join(backupDir, `${file}.backup-${Date.now()}`),
              rawData
            );
            
            // Write fixed content
            await fs.writeFile(filePath, JSON.stringify(JSON.parse(cleanedData), null, 2));
            fixedCount++;
          } catch (secondParseError) {
            console.error(`  Failed to fix JSON automatically:`, secondParseError.message);
          }
        }
      } catch (fileError) {
        console.error(`Error reading ${file}:`, fileError.message);
      }
    }
    
    console.log(`Validation complete: ${fixedCount} files were fixed`);
  } catch (err) {
    console.error('Validation error:', err);
  }
}

validateJsonFiles();
