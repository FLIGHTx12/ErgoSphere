const fs = require('fs');
const path = require('path');

// Read the loot.json file
const lootPath = path.join(__dirname, 'data', 'loot.json');
const lootData = JSON.parse(fs.readFileSync(lootPath, 'utf8'));

console.log(`Original loot items: ${lootData.length}`);

// Track duplicates
const seen = new Map();
const duplicates = [];
const unique = [];

lootData.forEach((item, index) => {
    const key = item.text.trim();
    
    if (seen.has(key)) {
        duplicates.push({
            originalIndex: seen.get(key),
            duplicateIndex: index,
            text: item.text,
            originalId: lootData[seen.get(key)].id,
            duplicateId: item.id
        });
        console.log(`Duplicate found: "${key}" (IDs: ${lootData[seen.get(key)].id} vs ${item.id})`);
    } else {
        seen.set(key, index);
        unique.push(item);
    }
});

console.log(`\nDuplicates found: ${duplicates.length}`);
console.log(`Unique items: ${unique.length}`);

// Show all duplicates
console.log('\n=== DUPLICATES FOUND ===');
duplicates.forEach(dup => {
    console.log(`"${dup.text}" - Original ID: ${dup.originalId}, Duplicate ID: ${dup.duplicateId}`);
});

// Create backup
const backupPath = path.join(__dirname, 'data', 'backups', `loot-backup-${Date.now()}.json`);
fs.writeFileSync(backupPath, JSON.stringify(lootData, null, 2));
console.log(`\nBackup created: ${backupPath}`);

// Write cleaned data
fs.writeFileSync(lootPath, JSON.stringify(unique, null, 2));
console.log(`\nCleaned loot.json written with ${unique.length} unique items`);
console.log(`Removed ${duplicates.length} duplicate items`);
