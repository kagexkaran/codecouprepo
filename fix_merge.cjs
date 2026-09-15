const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  /partnerId: loadedUser\.partnerId \|\| prev\.partnerId,/g,
  "partnerId: loadedUser.partnerId !== undefined ? loadedUser.partnerId : prev.partnerId,"
);
code = code.replace(
  /partnerCode: loadedUser\.partnerCode \|\| prev\.partnerCode,/g,
  "partnerCode: loadedUser.partnerCode !== undefined ? loadedUser.partnerCode : prev.partnerCode,"
);
code = code.replace(
  /partnerName: loadedUser\.partnerName \|\| prev\.partnerName,/g,
  "partnerName: loadedUser.partnerName !== undefined ? loadedUser.partnerName : prev.partnerName,"
);
code = code.replace(
  /partnerEmail: loadedUser\.partnerEmail \|\| prev\.partnerEmail,/g,
  "partnerEmail: loadedUser.partnerEmail !== undefined ? loadedUser.partnerEmail : prev.partnerEmail,"
);
code = code.replace(
  /partnerGender: loadedUser\.partnerGender \|\| prev\.partnerGender,/g,
  "partnerGender: loadedUser.partnerGender !== undefined ? loadedUser.partnerGender : prev.partnerGender,"
);
code = code.replace(
  /partnerStreak: loadedUser\.partnerStreak \|\| prev\.partnerStreak,/g,
  "partnerStreak: loadedUser.partnerStreak !== undefined ? loadedUser.partnerStreak : prev.partnerStreak,"
);
code = code.replace(
  /connectedAt: loadedUser\.connectedAt \|\| prev\.connectedAt,/g,
  "connectedAt: loadedUser.connectedAt !== undefined ? loadedUser.connectedAt : prev.connectedAt,"
);


// And for handleAuthenticated
code = code.replace(
  /partnerId: loaded\.partnerId \|\| user\.partnerId,/g,
  "partnerId: loaded.partnerId !== undefined ? loaded.partnerId : user.partnerId,"
);
code = code.replace(
  /partnerCode: loaded\.partnerCode \|\| user\.partnerCode,/g,
  "partnerCode: loaded.partnerCode !== undefined ? loaded.partnerCode : user.partnerCode,"
);
code = code.replace(
  /partnerName: loaded\.partnerName \|\| user\.partnerName,/g,
  "partnerName: loaded.partnerName !== undefined ? loaded.partnerName : user.partnerName,"
);
code = code.replace(
  /partnerEmail: loaded\.partnerEmail \|\| user\.partnerEmail,/g,
  "partnerEmail: loaded.partnerEmail !== undefined ? loaded.partnerEmail : user.partnerEmail,"
);
code = code.replace(
  /partnerGender: loaded\.partnerGender \|\| user\.partnerGender,/g,
  "partnerGender: loaded.partnerGender !== undefined ? loaded.partnerGender : user.partnerGender,"
);
code = code.replace(
  /partnerStreak: loaded\.partnerStreak \|\| user\.partnerStreak,/g,
  "partnerStreak: loaded.partnerStreak !== undefined ? loaded.partnerStreak : user.partnerStreak,"
);
code = code.replace(
  /connectedAt: loaded\.connectedAt \|\| user\.connectedAt,/g,
  "connectedAt: loaded.connectedAt !== undefined ? loaded.connectedAt : user.connectedAt,"
);

fs.writeFileSync('src/App.tsx', code);
