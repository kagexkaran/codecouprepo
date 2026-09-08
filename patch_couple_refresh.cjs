const fs = require('fs');
let code = fs.readFileSync('src/components/Couple.tsx', 'utf8');

code = code.replace(
  "  onClaimGift?: (giftId: string) => void;\n}",
  "  onClaimGift?: (giftId: string) => void;\n  onRefreshSync?: () => void;\n}"
);

code = code.replace(
  "  onUpdateActiveCardTime,\n  onClaimGift\n}) => {",
  "  onUpdateActiveCardTime,\n  onClaimGift,\n  onRefreshSync\n}) => {"
);

code = code.replace(
  "      {/* Middle Section: Active Effects with Complete Task Button & Time Adjustment */}",
  `      {/* Middle Section: Active Effects with Complete Task Button & Time Adjustment */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => {
            if (onRefreshSync) {
              onRefreshSync();
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-black uppercase text-xs border-2 border-black shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Force Sync
        </button>
      </div>`
);

fs.writeFileSync('src/components/Couple.tsx', code);
