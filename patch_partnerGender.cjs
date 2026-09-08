const fs = require('fs');
let code = fs.readFileSync('src/components/Couple.tsx', 'utf8');

code = code.replace(
  "user.partnerGender === 'male' ? 'bg-blue-600' : user.partnerGender === 'female' ? 'bg-pink-600' : 'bg-gray-800'",
  "(user.partnerGender || (user.gender === 'female' ? 'male' : 'female')) === 'male' ? 'bg-blue-600' : (user.partnerGender || (user.gender === 'female' ? 'male' : 'female')) === 'female' ? 'bg-pink-600' : 'bg-gray-800'"
);

code = code.replace(
  "src={user.partnerGender === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male}",
  "src={(user.partnerGender || (user.gender === 'female' ? 'male' : 'female')) === 'female' ? PROFILE_AVATARS.female : PROFILE_AVATARS.male}"
);

fs.writeFileSync('src/components/Couple.tsx', code);
