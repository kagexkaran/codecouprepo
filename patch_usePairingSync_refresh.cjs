const fs = require('fs');
let code = fs.readFileSync('src/lib/usePairingSync.ts', 'utf8');

const target = `  const unpairPartners = async () => {`;
const newCode = `  const requestSync = () => {
    if (channelRef.current && user.partnerId) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'request_sync',
        payload: { fromUserId: user.id, toUserId: user.partnerId }
      });
    }
  };

  const unpairPartners = async () => {`;

code = code.replace(target, newCode);

code = code.replace(
  "    triggerCloudSync\n  };\n}",
  "    triggerCloudSync,\n    requestSync\n  };\n}"
);

fs.writeFileSync('src/lib/usePairingSync.ts', code);
