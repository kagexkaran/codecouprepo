const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Patch 1: checkSession
code = code.replace(
  "              gender: loadedUser.gender || prev.gender,",
  `              gender: loadedUser.gender || prev.gender,
              partnerId: loadedUser.partnerId || prev.partnerId,
              partnerCode: loadedUser.partnerCode || prev.partnerCode,
              partnerName: loadedUser.partnerName || prev.partnerName,
              partnerEmail: loadedUser.partnerEmail || prev.partnerEmail,
              partnerGender: loadedUser.partnerGender || prev.partnerGender,
              partnerStreak: loadedUser.partnerStreak || prev.partnerStreak,
              connectedAt: loadedUser.connectedAt || prev.connectedAt,`
);

// Patch 2: handleAuthenticated
code = code.replace(
  "      id: authUser.id,\n      email: authUser.email,\n    };",
  `      id: authUser.id,
      email: authUser.email,
      partnerId: loaded.partnerId || user.partnerId,
      partnerCode: loaded.partnerCode || user.partnerCode,
      partnerName: loaded.partnerName || user.partnerName,
      partnerEmail: loaded.partnerEmail || user.partnerEmail,
      partnerGender: loaded.partnerGender || user.partnerGender,
      partnerStreak: loaded.partnerStreak || user.partnerStreak,
      connectedAt: loaded.connectedAt || user.connectedAt,
    };`
);

fs.writeFileSync('src/App.tsx', code);
