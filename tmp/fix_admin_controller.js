import fs from 'fs';
const filePath = 'C:/Users/MUMMY\'S LOVELY SON/Downloads/Project Work/backend/src/controllers/adminController.js';
const content = fs.readFileSync(filePath, 'utf8');
const lines = content.split('\n');

// Line 385 is index 384
// Line 447 is index 446 (end of updateReviewStatus)
// We want to delete 385 to 447 inclusive.
const startLineIdx = 384;
const numLinesToDelete = 447 - 385 + 1; // 63 lines
lines.splice(startLineIdx, numLinesToDelete);

fs.writeFileSync(filePath, lines.join('\n'));
console.log('Duplicate functions removed successfully.');
