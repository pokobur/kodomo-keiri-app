import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatFlat, isValidAmount } from '../../utils/validation';
import { ExpenseRequestModal } from './ExpenseRequestModal';

export const WishList: React.FC = () => {
  const { currentWishlistItems, currentProject, addWishlistItem, updateWishlistItem, deleteWishlistItem } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [priority, setPriority] = useState<1 | 2 | 3 | 4>(2);
  const [memo, setMemo] = useState('');
  
  const [buyModalOpen, setBuyModalOpen] = useState(false);
  const [buyItemTitle, setBuyItemTitle] = useState('');
  const [buyItemPrice, setBuyItemPrice] = useState(0);
  const [buyItemId, setBuyItemId] = useState<string | undefined>(undefined);

  if (!currentProject) return null;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !price || !isValidAmount(Number(price))) return;
    
    addWishlistItem({ projectId: currentProject.id, title, price: Number(price), priority, memo });
    setIsAdding(false);
    setTitle('');
    setPrice('');
    setPriority(2);
    setMemo('');
  };

  const renderStars = (p: number, onClick?: (newP: 1|2|3|4) => void) => {
    return (
      <div className="flex gap-1 text-xl">
        {[1, 2, 3, 4].map((star) => (
          <span 
            key={star} 
            className={`cursor-pointer ${star <= p ? 'text-yellow-400' : 'text-gray-300'}`}
            onClick={() => onClick && onClick(star as 1|2|3|4)}
          >
            {star <= p ? '★' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  const unpurchasedItems = currentWishlistItems.filter(item => !item.isPurchased);

  return (
    <div className="space-y-6">
      {unpurchasedItems.length === 0 && !isAdding && (
        <div className="bg-white rounded-3xl p-6 shadow-md text-center">
          <p className="text-gray-500 text-lg font-bold mb-4">ほしいものが ないよ！</p>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-pink-400 text-white font-bold rounded-xl py-3 px-6 text-lg shadow-md"
          >
            ほしいものを ついかする ➕
          </button>
        </div>
      )}

      {unpurchasedItems.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {unpurchasedItems.map(item => {
            const progress = item.isTarget ? Math.min(100, Math.floor((currentProject.savingsBalance / item.price) * 100)) : 0;
            
            return (
              <div key={item.id} className="bg-white rounded-3xl p-5 shadow-lg border-4 border-pink-100 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{item.title}</h3>
                  <div className="flex flex-col items-end">
                    {renderStars(item.priority, (p) => updateWishlistItem(item.id, { priority: p }))}
                    <button 
                      onClick={() => deleteWishlistItem(item.id)}
                      className="text-gray-400 text-sm mt-1"
                    >
                      けす 🗑️
                    </button>
                  </div>
                </div>
                
                <p className="text-2xl font-extrabold text-pink-600 mb-2">{formatFlat(item.price)}</p>
                {item.memo && <p className="text-gray-600 bg-gray-50 p-2 rounded-lg text-sm mb-3">{item.memo}</p>}

                <div className="mt-auto pt-4 space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={item.isTarget} 
                      onChange={(e) => updateWishlistItem(item.id, { isTarget: e.target.checked })}
                      className="w-5 h-5 accent-pink-500 rounded"
                    />
                    <span className="font-bold text-gray-700">もくひょうに する 🎯</span>
                  </label>

                  {item.isTarget && (
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className="bg-green-400 h-4 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setBuyItemTitle(item.title);
                      setBuyItemPrice(item.price);
                      setBuyItemId(item.id);
                      setBuyModalOpen(true);
                    }}
                    className="w-full bg-yellow-400 text-yellow-900 font-bold rounded-xl py-3 text-lg shadow-md mt-2"
                  >
                    かったよ！🎉
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {unpurchasedItems.length > 0 && !isAdding && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setIsAdding(true)}
            className="bg-pink-400 text-white font-bold rounded-xl py-3 px-8 text-lg shadow-md hover:bg-pink-500 transition-colors"
          >
            ほしいものを ついかする ➕
          </button>
        </div>
      )}

      {isAdding && (
        <div className="bg-pink-50 rounded-3xl p-6 shadow-md border-4 border-pink-200">
          <h3 className="text-xl font-bold text-gray-800 mb-4">✨ ほしいもの を おしえて！</h3>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-bold mb-1">なまえ</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-2 border-pink-300 rounded-xl p-2 text-lg"
                placeholder="じてんしゃ"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">いくら？</label>
              <input
                type="number"
                min="10"
                step="10"
                value={price}
                onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                className="w-full border-2 border-pink-300 rounded-xl p-2 text-lg"
                placeholder="1000"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">どれくらい ほしい？</label>
              <div className="bg-white p-2 rounded-xl inline-block">
                {renderStars(priority, setPriority)}
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">めも</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                className="w-full border-2 border-pink-300 rounded-xl p-2 text-lg"
                placeholder="あかい やつ"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="flex-1 bg-gray-300 text-gray-800 font-bold rounded-xl py-2"
              >
                やめる
              </button>
              <button
                type="submit"
                className="flex-1 bg-pink-500 text-white font-bold rounded-xl py-2 shadow"
              >
                ついか！
              </button>
            </div>
          </form>
        </div>
      )}

      <ExpenseRequestModal 
        isOpen={buyModalOpen} 
        onClose={() => setBuyModalOpen(false)} 
        initialTitle={buyItemTitle}
        initialAmount={buyItemPrice}
        initialWishlistItemId={buyItemId}
      />
    </div>
  );
};
