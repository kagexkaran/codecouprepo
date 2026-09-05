const fs = require('fs');
let code = fs.readFileSync('src/components/Couple.tsx', 'utf8');

const target = `      {/* Middle Section: Active Effects with Complete Task Button & Time Adjustment */}`;
const newCode = `      {/* Received Gifts Section */}
      {user.giftInbox && user.giftInbox.length > 0 && (
        <div className="p-6 bg-pink-950/40 border-4 border-pink-500 shadow-[8px_8px_0px_0px_rgba(236,72,153,1)] animate-in fade-in slide-in-from-bottom-4 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="w-7 h-7 text-pink-400" />
            <h2 className="text-2xl sm:text-3xl font-black uppercase text-pink-400">Gifts Received</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {user.giftInbox.map(gift => {
              const cardDef = INITIAL_CARDS.find(c => c.id === gift.cardId);
              return (
                <div key={gift.id} className="bg-black border-4 border-pink-500 p-4 flex flex-col items-start gap-4 shadow-[4px_4px_0_rgba(236,72,153,0.5)]">
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-12 h-16 bg-gray-900 border-2 border-black overflow-hidden shrink-0">
                      {cardDef?.imageUrl ? (
                        <img src={cardDef.imageUrl} alt={cardDef?.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[8px] font-black">CARD</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-black uppercase text-white line-clamp-1">{cardDef?.name || 'Unknown Card'}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-0.5 truncate">From {gift.fromName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (onClaimGift) onClaimGift(gift.id);
                    }}
                    className="w-full px-3 py-2 bg-pink-500 hover:bg-pink-400 text-black border-2 border-black font-black uppercase text-xs cursor-pointer shadow-[3px_3px_0_rgba(0,0,0,1)] hover:translate-y-px hover:shadow-none transition-all whitespace-nowrap"
                  >
                    Claim Card
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Middle Section: Active Effects with Complete Task Button & Time Adjustment */}`;

code = code.replace(target, newCode);
fs.writeFileSync('src/components/Couple.tsx', code);
