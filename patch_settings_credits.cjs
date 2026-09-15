const fs = require('fs');
let code = fs.readFileSync('src/components/Settings.tsx', 'utf8');

const target = `        </div>
      </div>
    </div>`;

const newCode = `        </div>

        {/* Credits */}
        <div className="pt-8 text-center text-xs font-mono text-gray-500 flex flex-col items-center gap-1">
          <p>Created by Karan chaudhary</p>
          <a href="https://www.linkedin.com/in/karanchaudhary-dev/" target="_blank" rel="noopener noreferrer" className="text-pink-400 hover:text-pink-300 underline underline-offset-2 font-bold">
            LinkedIn
          </a>
          <p className="mt-2 text-[10px] uppercase">© {new Date().getFullYear()} All Copyright Reserved</p>
        </div>
      </div>
    </div>`;

code = code.replace(target, newCode);

fs.writeFileSync('src/components/Settings.tsx', code);
