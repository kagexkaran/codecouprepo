const fs = require('fs');
let code = fs.readFileSync('src/components/Collection.tsx', 'utf8');

const modalCode = `
      {/* Modal for Sending a Card */}
      {cardToSend && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
          onClick={() => { setCardToSend(null); retroAudio.playButtonClick(); }}
        >
          <div
            className="bg-[#2a2a3c] border-4 border-black shadow-[16px_16px_0_rgba(0,0,0,1)] max-w-sm w-full relative p-6 flex flex-col items-center text-center"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-2xl font-black uppercase text-white mb-4">Send Gift</h3>
            <div className="w-32 h-40 bg-gray-900 border-2 border-black overflow-hidden shadow-[4px_4px_0_rgba(0,0,0,1)] mb-4">
              {cardToSend.imageUrl ? (
                <img src={cardToSend.imageUrl} alt={cardToSend.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs font-black">CARD</div>
              )}
            </div>
            <p className="text-sm text-gray-300 font-bold uppercase mb-4 leading-relaxed">
              Gift <span className="text-pink-400 font-black">{cardToSend.name}</span> to <span className="text-white font-black">{user.partnerName || 'Your Partner'}</span>?
            </p>
            <div className="bg-yellow-900/50 border border-yellow-500 text-yellow-300 px-3 py-2 text-xs font-black uppercase flex items-center justify-center gap-1.5 mb-6 w-full shadow-[2px_2px_0_rgba(0,0,0,1)]">
              <Sparkles size={16} className="text-yellow-400" />
              Reward: +10 Coins for gifting
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => { setCardToSend(null); retroAudio.playButtonClick(); }}
                className="flex-1 py-2.5 bg-gray-700 hover:bg-gray-600 text-white border-2 border-black font-black uppercase text-xs cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onSendCard(cardToSend.id);
                  setCardToSend(null);
                }}
                className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-400 text-white border-2 border-black font-black uppercase text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all"
              >
                Confirm Send
              </button>
            </div>
          </div>
        </div>
      )}
`;

code = code.replace('    </div>\n  );\n};', '    </div>\n' + modalCode + '  );\n};');
fs.writeFileSync('src/components/Collection.tsx', code);
