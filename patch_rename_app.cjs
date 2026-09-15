const fs = require('fs');

// Patch App.tsx
let appCode = fs.readFileSync('src/App.tsx', 'utf8');
appCode = appCode.replace(/CARDCOUP Onboarding/g, 'CARDCOUPLE Onboarding');
appCode = appCode.replace(
  /<h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">CARDCOUP<\/h1>/g,
  '<h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/ICON.png" alt="Icon" className="w-8 h-8 object-contain" />CARDCOUPLE</h1>'
);
fs.writeFileSync('src/App.tsx', appCode);

// Patch AuthScreen.tsx
let authCode = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');
authCode = authCode.replace(
  /<h2 className="text-2xl font-black uppercase text-white tracking-tight">CARDCOUP<\/h2>/g,
  '<h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2 justify-center"><img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/ICON.png" alt="Icon" className="w-8 h-8 object-contain" />CARDCOUPLE</h2>'
);
fs.writeFileSync('src/components/AuthScreen.tsx', authCode);

