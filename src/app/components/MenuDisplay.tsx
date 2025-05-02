import React from 'react';

interface MenuItem {
  name: string;
  price: string;
}

interface MenuDisplayProps {
  menuItems: MenuItem[];
  onNext: () => void;
}

export default function MenuDisplay({ menuItems, onNext }: MenuDisplayProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        Your Menu Items
      </h2>
      
      <div className="overflow-hidden border border-gray-100 rounded-xl shadow-md">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-indigo-700 uppercase tracking-wider">
                Item
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-purple-700 uppercase tracking-wider">
                Price
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {menuItems.map((item, index) => (
              <tr key={index} className={`transition-colors hover:bg-indigo-50/30 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-purple-700 text-right">
                  {item.price}
                </td>
              </tr>
            ))}
            {menuItems.length === 0 && (
              <tr>
                <td colSpan={2} className="px-6 py-8 text-center text-sm text-gray-500">
                  No menu items found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      <div className="flex justify-center pt-4">
        <button 
          className={`w-full px-6 py-3 font-medium rounded-lg text-sm transition-all duration-300 shadow-md transform hover:scale-[1.02] focus:outline-none focus:ring-4 ${
            menuItems.length === 0 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-purple-300'
          }`}
          onClick={onNext}
          disabled={menuItems.length === 0}
        >
          Generate Package
        </button>
      </div>
    </div>
  );
} 