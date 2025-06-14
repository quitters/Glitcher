const fs = require('fs').promises;

async function findFunction() {
    const content = await fs.readFile('glitcher.js', 'utf-8');
    const lines = content.split('\n');
    
    // Find updateSelectionsFromMask
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('updateSelectionsFromMask')) {
            console.log(`Line ${i + 1}: ${lines[i]}`);
            
            // Show the region conversion code around this area
            if (lines[i].includes('function updateSelectionsFromMask')) {
                console.log('\n--- Function content preview ---');
                for (let j = i; j < Math.min(i + 50, lines.length); j++) {
                    if (lines[j].includes('regions.push({')) {
                        console.log('\n!!! Found the problematic code:');
                        for (let k = j; k < Math.min(j + 10, lines.length); k++) {
                            console.log(`Line ${k + 1}: ${lines[k]}`);
                        }
                        break;
                    }
                }
            }
        }
    }
}

findFunction();
