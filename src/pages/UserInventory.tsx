import React, { useState, useMemo, ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface Item {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic';
  acquiredAt: number;
}

const demoItems: Item[] = Array.from({ length: 18 }).map((_, i) => ({
  id: `item-${i + 1}`,
  name: [
    'Explorer Badge',
    'Streak Booster', 
    'VIP Pass',
    'Weather Shield',
    'Speed Ticket',
    'Double Points'
  ][i % 6],
  rarity: ['common', 'rare', 'epic'][i % 3] as 'common' | 'rare' | 'epic',
  acquiredAt: Date.now() - i * 86400000,
}));

const rarityToClass: Record<string, string> = {
  common: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  rare: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  epic: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
};

const UserInventory: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [rarity, setRarity] = useState<string>('all');
  const [sort, setSort] = useState<string>('recent');

  const items = useMemo(() => {
    let list = demoItems;
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (rarity !== 'all') {
      list = list.filter((i) => i.rarity === rarity);
    }
    if (sort === 'recent') {
      list = [...list].sort((a, b) => b.acquiredAt - a.acquiredAt);
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => a.acquiredAt - b.acquiredAt);
    } else if (sort === 'alpha') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    return list;
  }, [query, rarity, sort]);

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container px-3 py-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="mb-6"
        >
          <h1
            style={{
              fontSize: '4rem',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #f97316)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: 0,
              paddingBottom: '1rem'
            }}
          >
            Your Inventory
          </h1>
          <motion.p className="text-lg text-black" initial={{y:-10}}>Manage boosters, badges, and unique items</motion.p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }} 
          className="card-modern bg-white mb-6"
        >
          <div className="row">
            <div className="col">
              <input
                type="text"
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                placeholder="Search items..."
                className="input-modern bg-white text-black"
              />
            </div>
            <div className="col">
              <select 
                value={rarity} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setRarity(e.target.value)} 
                className="input-modern bg-white text-black"
              >
                <option value="all">All rarities</option>
                <option value="common">Common</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
              </select>
            </div>
            <div className="col">
              <select 
                value={sort} 
                onChange={(e: ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)} 
                className="input-modern bg-white text-black"
              >
                <option value="recent">Most recent</option>
                <option value="oldest">Oldest first</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>
        </motion.div>

        {items.length === 0 ? (
          <div className="py-12 pt-4">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-white mb-2">No items found</h3>
            <p className="text-gray-400">
              {query || rarity !== 'all' 
                ? 'Try adjusting your filters or search terms'
                : 'Start building your collection!'
              }
            </p>
          </div>
        ) : (
          <div className="row pt-4 text-center" style={{gap: '1rem'}}>
            {items.map((item, i) => (
              <motion.div 
                key={item.id} 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: 0.02 * i }} 
                className="card-modern bg-white lift col-3 ml-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`px-3 py-1 rounded border text-xs font-bold uppercase ${rarityToClass[item.rarity] || rarityToClass.common}`}>
                    {item.rarity.charAt(0).toLocaleUpperCase() + item.rarity.slice(1)}
                  </div>
                  <div className="text-gray-400 text-sm">
                    Received on {new Date(item.acquiredAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">
                    {item.rarity === 'epic' ? '💎' : item.rarity === 'rare' ? '🔮' : '🎖️'}
                  </div>
                  <div className="text-lg font-bold text-black">{item.name}</div>
                </div>
                
                <div className="flex gap-2">
                  <button className="btn-modern btn-primary flex-1">Use</button>
                  <button className="btn-modern btn-secondary text-black flex-1">Details</button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInventory;

