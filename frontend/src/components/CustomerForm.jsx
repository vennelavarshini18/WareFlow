import React, { useState, useEffect } from 'react';

const CATEGORIES = [
  { 
    id: 'grocery', 
    name: 'Grocery', 
    icon: '🛒', 
    items: ['Milk', 'Eggs', 'Chocolates', 'Detergent', 'Flour', 'Bread'],
    color: 'from-yellow-600 to-yellow-700',
    hover: 'shadow-yellow-500/20'
  },
  { 
    id: 'electronics', 
    name: 'Electronics', 
    icon: '🔌', 
    items: ['Laptop', 'Smartwatch', 'Headphones', 'Cables'],
    color: 'from-blue-600 to-blue-700',
    hover: 'shadow-blue-500/20'
  },
  { 
    id: 'pharmacy', 
    name: 'Pharmacy', 
    icon: '💊', 
    items: ['Vitamins', 'Painkillers', 'First Aid', 'Masks'],
    color: 'from-teal-600 to-teal-700',
    hover: 'shadow-teal-500/20'
  },
  { 
    id: 'skincare', 
    name: 'Skincare', 
    icon: '✨', 
    items: ['Face Cream', 'Sunscreen', 'Serum', 'Lotion'],
    color: 'from-pink-600 to-pink-700',
    hover: 'shadow-pink-500/20'
  },
  { 
    id: 'footwear', 
    name: 'Footwear', 
    icon: '👟', 
    items: ['Sneakers', 'Boots', 'Sandals', 'Socks'],
    color: 'from-orange-600 to-orange-700',
    hover: 'shadow-orange-500/20'
  },
  { 
    id: 'clothes', 
    name: 'Clothes', 
    icon: '👕', 
    items: ['T-Shirt', 'Jeans', 'Jacket', 'Sweater'],
    color: 'from-emerald-600 to-emerald-700',
    hover: 'shadow-emerald-500/20'
  },
  { 
    id: 'stationery', 
    name: 'Stationery', 
    icon: '📓', 
    items: ['Notebook', 'Pens', 'Markers', 'Stapler'],
    color: 'from-indigo-600 to-indigo-700',
    hover: 'shadow-indigo-500/20'
  },
  { 
    id: 'accessories', 
    name: 'Accessories', 
    icon: '⌚', 
    items: ['Watch', 'Sunglasses', 'Belt', 'Wallet'],
    color: 'from-slate-600 to-slate-700',
    hover: 'shadow-slate-500/20'
  }
];

export default function NexusStorefront({ onOrderPlaced }) {
  const [inventory, setInventory] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/inventory')
      .then(res => res.json())
      .then(data => {
        setInventory(data.inventory);
        setLoading(false);
      })
      .catch(err => console.error("Backend offline?"));
  }, []);

  const placeOrder = async (categoryId, itemName) => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categoryId, item: itemName })
      });
      if (res.ok) {
        onOrderPlaced(); // Navigate back or show success
      } else {
        const errorData = await res.json();
        alert(`Failed: ${errorData.error}`);
      }
    } catch (err) { alert("Network Error"); }
  };

  if (loading) return <div className="w-screen h-screen flex justify-center items-center bg-gray-950 font-mono text-cyan-400 text-xl tracking-widest uppercase text-center mt-20">CONNECTING TO WAREHOUSE...</div>;

  return (
    <div className="w-screen min-h-screen bg-gray-950 text-white overflow-y-auto overflow-x-hidden font-sans p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-5xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-4">NEXUS STOREFRONT</h1>
          <p className="text-gray-400 uppercase tracking-widest text-sm">Autonomous Category-Based Fulfillment</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {CATEGORIES.map((cat) => {
            const stock = inventory[cat.id] || 0;
            const inStock = stock > 0;

            return (
              <div key={cat.id} className={`bg-gray-900 border ${inStock ? 'border-gray-800' : 'border-red-900/50'} rounded-3xl p-6 shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}>
                <div className="flex justify-between items-start mb-6">
                  <span className="text-5xl group-hover:scale-110 transition-transform duration-300 ease-out">{cat.icon}</span>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-2 py-1 rounded tracking-widest ${inStock ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-500'}`}>
                      {inStock ? `${stock} UNITS` : 'OUT OF STOCK'}
                    </span>
                    <h3 className="text-2xl font-bold mt-3 text-gray-100">{cat.name}</h3>
                  </div>
                </div>

                {/* Sub-items Grid */}
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {cat.items.map(item => (
                    <button
                      key={item}
                      disabled={!inStock}
                      onClick={() => placeOrder(cat.id, item)}
                      className={`text-xs text-left px-3 py-2 rounded-xl border font-bold transition-all truncate
                        ${inStock 
                          ? 'border-gray-800 hover:border-cyan-500 hover:bg-gray-800 text-gray-400 hover:text-white hover:shadow-[0_0_10px_rgba(56,189,248,0.3)] cursor-pointer' 
                          : 'border-transparent text-gray-700 bg-gray-900/50 cursor-not-allowed'}`}
                      title={item}
                    >
                      <span className="text-gray-500 mr-2">+</span>
                      {item}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-gray-500 font-mono italic text-center w-full px-2">
                  {inStock ? `Click an item to dispatch robot` : 'Category replenishment required'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
