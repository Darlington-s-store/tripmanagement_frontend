const fs = require('fs');
const path = require('path');
const dir = "c:/Users/MUMMY'S LOVELY SON/Downloads/Project Work/backend";
const files = ['seed-real-data.js', 'seed-destinations.js', 'seed_destinations.cjs'];

files.forEach(file => {
  const filePath = path.join(dir, file);
  if(fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/https:\/\/images\.unsplash\.com\/[^"'\\]+/g, '/placeholder-destination.jpg');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
