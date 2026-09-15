const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

const fSleepUrl = "https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/SLEEP%20CARD%20(F).png";

// Let's replace the female sleep card url just in case.
code = code.replace(
  /imageUrl:\s*['"][^'"]*femalecards\/SLEEP[^'"]*['"]/i,
  "imageUrl: '" + fSleepUrl + "'"
);

const maleTimeCard = `  { 
    id: 'm_time', 
    name: 'TIME CARD', 
    category: 'male', 
    rarity: 'Common', 
    description: 'Demand your partner\\'s undivided time!', 
    price: 20, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/malecards/TIME%20CARD%20(M).png',
    options: [
      'Your partner must spend the next hour entirely with you.',
      'Enjoy uninterrupted quality time together.'
    ]
  },`;

const femaleTimeCard = `  { 
    id: 'f_time', 
    name: 'TIME CARD', 
    category: 'female', 
    rarity: 'Common', 
    description: 'Demand your partner\\'s undivided time!', 
    price: 20, 
    imageUrl: 'https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/femalecards/TIME%20CARD%20(F).png',
    options: [
      'Your partner must spend the next hour entirely with you.',
      'Enjoy uninterrupted quality time together.'
    ]
  },`;

// insert male time card after m_sleep
code = code.replace(
  /id:\s*'m_sleep'[\s\S]*?\},/,
  "$&" + "\n" + maleTimeCard
);

// insert female time card after f_sleep
code = code.replace(
  /id:\s*'f_sleep'[\s\S]*?\},/,
  "$&" + "\n" + femaleTimeCard
);

fs.writeFileSync('src/data.ts', code);
