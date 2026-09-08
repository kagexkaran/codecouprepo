const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "    triggerCloudSync\n  } = usePairingSync(user, setUser, isAuthenticated);",
  "    triggerCloudSync,\n    requestSync\n  } = usePairingSync(user, setUser, isAuthenticated);"
);

code = code.replace(
  "              onClaimGift={handleClaimGift}",
  "              onClaimGift={handleClaimGift}\n              onRefreshSync={requestSync}"
);

fs.writeFileSync('src/App.tsx', code);
