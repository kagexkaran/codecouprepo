const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

code = code.replace(
  ".filter(ac => ac.expiresAt > now)",
  ".filter(ac => ac.expiresAt > now && !ac.completed)"
);

fs.writeFileSync('src/components/Collection.tsx', code);
