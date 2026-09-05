const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

code = code.replace(
  '<h2 className="text-4xl font-black uppercase mb-8 text-white border-b-4 border-black pb-4">System Config</h2>',
  '<h2 className="text-4xl font-black uppercase mb-8 text-white border-b-4 border-black pb-4">Settings</h2>'
);

code = code.replace(
  'Log Out of Supabase',
  'Log Out'
);

const targetBlock = `        {/* Supabase Connection Details */}
        <div className="bg-[#1a1a2e] border-4 border-black p-4 space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-sm">
            <Database size={18} />
            <span>Supabase Cloud Integration</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div className="bg-black/40 p-2 border border-black">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Project ID:</span>
              <span className="text-white font-bold">{SUPABASE_PROJECT_ID}</span>
            </div>
            <div className="bg-black/40 p-2 border border-black">
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Storage Bucket:</span>
              <span className="text-white font-bold">{BUCKET_NAME}</span>
            </div>
            {user.email && (
              <div className="bg-black/40 p-2 border border-black sm:col-span-2">
                <span className="text-gray-400 block uppercase font-bold text-[10px]">Logged In Email:</span>
                <span className="text-yellow-400 font-bold">{user.email}</span>
              </div>
            )}
          </div>
        </div>`;

code = code.replace(targetBlock, '');

fs.writeFileSync('src/components/Settings.tsx', code);
