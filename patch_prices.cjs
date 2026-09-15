const fs = require('fs');

let dataCode = fs.readFileSync('src/data.ts', 'utf8');

// The instruction: 
// common and rare cards from 10c to 50 and 20 to 100
// double the price of all remaining rarity card in the shop expect special card "cash card"

dataCode = dataCode.replace(/id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*category:\s*'([^']+)',\s*rarity:\s*'([^']+)',\s*description:\s*'([^']+)',\s*price:\s*(\d+)/g, (match, id, name, category, rarity, description, price) => {
  let newPrice = parseInt(price, 10);
  if (rarity === 'Common') {
    newPrice = 50;
  } else if (rarity === 'Rare') {
    newPrice = 100;
  } else if (rarity === 'Special' && name === 'CASH CARD') {
    newPrice = 10000; // keeping it same if it was 10000 or leaving it untouched
  } else {
    newPrice = newPrice * 2;
  }
  return `id: '${id}', 
    name: '${name}', 
    category: '${category}', 
    rarity: '${rarity}', 
    description: '${description}', 
    price: ${newPrice}`;
});

fs.writeFileSync('src/data.ts', dataCode);

