import React from 'react';

interface MenuItem {
  name: string;
  price: string;
}

interface PackageData {
  audienceType: string;
  packagePrice: string;
  starters: MenuItem[];
  mains: MenuItem[];
  desserts: MenuItem[];
  totalSavings?: string;
}

interface PackageDisplayProps {
  package: PackageData;
  onReset: () => void;
}

export default function PackageDisplay({ package: pkg, onReset }: PackageDisplayProps) {
  const audienceLabels = {
    'adult': 'Adult',
    'kids': 'Kids',
    'family': 'Family'
  };

  const calculateItemsTotal = (items: MenuItem[]): number => {
    return items.reduce((sum, item) => {
      const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
      return isNaN(price) ? sum : sum + price;
    }, 0);
  };

  const formatPrice = (price: number): string => {
    return `£${price.toFixed(2)}`;
  };

  // Calculate the total price of all items (for comparison with package price)
  const itemsTotal = calculateItemsTotal([...pkg.starters, ...pkg.mains, ...pkg.desserts]);
  const packagePrice = parseFloat(pkg.packagePrice.replace(/[^0-9.]/g, ''));
  const savings = itemsTotal - packagePrice;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
        Your {audienceLabels[pkg.audienceType as keyof typeof audienceLabels]} Package
      </h2>
      
      <div className="p-8 bg-white border border-gray-100 rounded-2xl shadow-lg">
        <div className="mb-8 text-center">
          <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
            Package Price: {pkg.packagePrice}
          </h3>
          {savings > 0 && (
            <p className="mt-2 text-sm font-medium text-green-600 bg-green-50 py-1 px-3 rounded-full inline-block">
              Save {formatPrice(savings)} compared to ordering items separately
            </p>
          )}
        </div>
        
        <div className="space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-semibold text-lg text-indigo-700 mb-4">Starters</h4>
            <ul className="space-y-3">
              {pkg.starters.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 px-4 rounded-lg bg-indigo-50 bg-opacity-50 hover:bg-opacity-70 transition-colors">
                  <span className="text-md font-medium">{item.name}</span>
                  <span className="text-indigo-800 font-semibold">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="border-b border-gray-100 pb-6">
            <h4 className="font-semibold text-lg text-purple-700 mb-4">Main Courses</h4>
            <ul className="space-y-3">
              {pkg.mains.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 px-4 rounded-lg bg-purple-50 bg-opacity-50 hover:bg-opacity-70 transition-colors">
                  <span className="text-md font-medium">{item.name}</span>
                  <span className="text-purple-800 font-semibold">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-lg text-pink-700 mb-4">Desserts</h4>
            <ul className="space-y-3">
              {pkg.desserts.map((item, index) => (
                <li key={index} className="flex justify-between items-center py-2 px-4 rounded-lg bg-pink-50 bg-opacity-50 hover:bg-opacity-70 transition-colors">
                  <span className="text-md font-medium">{item.name}</span>
                  <span className="text-pink-800 font-semibold">{item.price}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 text-center italic">
        This package was tailored for {audienceLabels[pkg.audienceType as keyof typeof audienceLabels]} preferences.
      </p>
      
      <button
        className="w-full px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg text-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
        onClick={onReset}
      >
        Create New Package
      </button>
    </div>
  );
} 