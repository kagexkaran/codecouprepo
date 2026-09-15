const fs = require('fs');

const iconImg = '<img src="https://jprlwyfffibucbebkebp.supabase.co/storage/v1/object/public/codecoup/icnons/ICON.png" alt="Icon" className="w-full h-full object-cover" />';

let appCode = fs.readFileSync('src/App.tsx', 'utf8');

// Replace the heart inside the box in App.tsx (Onboarding)
appCode = appCode.replace(
  /<div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-\[4px_4px_0_rgba\(0,0,0,1\)\]">♥<\/div>/g,
  `<div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-[4px_4px_0_rgba(0,0,0,1)] p-0.5">${iconImg}</div>`
);

// Replace the heart inside the box in App.tsx (Main Header)
appCode = appCode.replace(
  /<div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-\[3px_3px_0_rgba\(0,0,0,1\)\]">♥<\/div>/g,
  `<div className="w-10 h-10 bg-pink-500 border-4 border-black flex items-center justify-center text-xl font-bold text-black shadow-[3px_3px_0_rgba(0,0,0,1)] p-0.5">${iconImg}</div>`
);

// Remove the icon from the H1 tag where I mistakenly put it before
appCode = appCode.replace(
  /<h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter flex items-center gap-2"><img src="https:\/\/jprlwyfffibucbebkebp.supabase.co\/storage\/v1\/object\/public\/codecoup\/icnons\/ICON.png" alt="Icon" className="w-8 h-8 object-contain" \/>CARDCOUPLE<\/h1>/g,
  '<h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter">CARDCOUPLE</h1>'
);

fs.writeFileSync('src/App.tsx', appCode);

// Patch AuthScreen.tsx
let authCode = fs.readFileSync('src/components/AuthScreen.tsx', 'utf8');
authCode = authCode.replace(
  /<div className="w-10 h-10 bg-pink-500 border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-\[3px_3px_0_0_rgba\(0,0,0,1\)\]">\s*♥\s*<\/div>/g,
  `<div className="w-10 h-10 bg-pink-500 border-2 border-black flex items-center justify-center font-black text-black text-xl shadow-[3px_3px_0_0_rgba(0,0,0,1)] p-0.5">\n              ${iconImg}\n            </div>`
);
authCode = authCode.replace(
  /<h2 className="text-2xl font-black uppercase text-white tracking-tight flex items-center gap-2 justify-center"><img src="https:\/\/jprlwyfffibucbebkebp.supabase.co\/storage\/v1\/object\/public\/codecoup\/icnons\/ICON.png" alt="Icon" className="w-8 h-8 object-contain" \/>CARDCOUPLE<\/h2>/g,
  '<h2 className="text-2xl font-black uppercase text-white tracking-tight">CARDCOUPLE</h2>'
);

fs.writeFileSync('src/components/AuthScreen.tsx', authCode);
