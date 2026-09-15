const fs = require('fs');
let code = fs.readFileSync('src/data.ts', 'utf8');

code = code.replace(
  /id: 'm_time',\s*name: 'TIME CARD',\s*category: 'male',\s*rarity: 'Common'/g,
  "id: 'm_time',\n    name: 'TIME CARD',\n    category: 'male',\n    rarity: 'Rare'"
);

code = code.replace(
  /id: 'f_time',\s*name: 'TIME CARD',\s*category: 'female',\s*rarity: 'Common'/g,
  "id: 'f_time',\n    name: 'TIME CARD',\n    category: 'female',\n    rarity: 'Rare'"
);

fs.writeFileSync('src/data.ts', code);
