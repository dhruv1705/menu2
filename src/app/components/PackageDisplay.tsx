import React, { useEffect, useState } from 'react';
import Image from 'next/image';

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
  discountPercentage?: number;
}

interface PackageDisplayProps {
  package: PackageData;
  onReset: () => void;
}

// Food image mapping for common Indian dishes - using Unsplash images
const foodImages: Record<string, string> = {
  // Starters
  'paneer tikka': 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop',
  'hara bhara kabab': 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop',
  'samosa': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&auto=format&fit=crop',
  'spring roll': 'https://images.unsplash.com/photo-1548839140-29a749e7b8dd?w=600&auto=format&fit=crop',
  'chicken tikka': 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&auto=format&fit=crop',
  
  // Main Courses
  'butter chicken': 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop',
  'paneer butter masala': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=600&auto=format&fit=crop',
  'palak paneer': 'https://images.unsplash.com/photo-1596797038530-2c107aa4e0dc?w=600&auto=format&fit=crop',
  'dal makhani': 'https://images.unsplash.com/photo-1585937421612-70a008356c36?w=600&auto=format&fit=crop',
  'biryani': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&auto=format&fit=crop',
  'chicken curry': 'https://images.unsplash.com/photo-1617692855027-33b14f061079?w=600&auto=format&fit=crop',
  
  // Desserts
  'gulab jamun': 'https://images.unsplash.com/photo-1601303516477-c52d141e6a3f?w=600&auto=format&fit=crop',
  'rasgulla': 'https://images.unsplash.com/photo-1605197180183-5e732666a0b5?w=600&auto=format&fit=crop',
  'ice cream': 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=600&auto=format&fit=crop',
  'kheer': 'https://images.unsplash.com/photo-1571115355423-1d318bd95e22?w=600&auto=format&fit=crop',
  'rasmalai': 'https://images.unsplash.com/photo-1590544139406-73305afde0a8?w=600&auto=format&fit=crop',
};

// Category default images
const categoryImages = {
  starters: 'https://images.unsplash.com/photo-1546241072-48010ad2862c?w=600&auto=format&fit=crop',
  mains: 'https://images.unsplash.com/photo-1585937421612-70a008356c36?w=600&auto=format&fit=crop',
  desserts: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=600&auto=format&fit=crop',
};

// Decorative divider SVG
const DecorativeDivider = () => (
  <div className="flex items-center justify-center my-6">
    <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-1/3"></div>
    <svg className="mx-4 text-purple-400" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.5L14.5 9.5L20 10.5L16 14.5L17 20L12 17.5L7 20L8 14.5L4 10.5L9.5 9.5L12 4.5Z" fill="currentColor" />
    </svg>
    <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent w-1/3"></div>
  </div>
);

export default function PackageDisplay({ package: pkg, onReset }: PackageDisplayProps) {
  const [packagePrice, setPackagePrice] = useState<string>("");
  const [savingsDisplay, setSavingsDisplay] = useState<string>("");
  const [debugInfo, setDebugInfo] = useState<string>("");

  const audienceLabels = {
    'adult': 'Adult',
    'kids': 'Kids',
    'family': 'Family'
  };

  // Function to get image URL for a food item
  const getFoodImage = (item: MenuItem, category: 'starters' | 'mains' | 'desserts'): string => {
    const itemNameLower = item.name.toLowerCase();
    
    // Try to find a direct match
    for (const [key, imageUrl] of Object.entries(foodImages)) {
      if (itemNameLower.includes(key)) {
        return imageUrl;
      }
    }
    
    // Return default category image if no match found
    return categoryImages[category];
  };

  // Extract numerical price value from price string (e.g., "Rs.180" -> 180)
  const extractPriceValue = (priceString: string): number => {
    // Match any number in the string
    const priceMatch = priceString.match(/(\d+)/);
    if (priceMatch && priceMatch[1]) {
      return parseInt(priceMatch[1], 10);
    }
    return 0;
  };

  // Detect the currency symbol from menu items (e.g., "Rs." from "Rs.180")
  const detectCurrencySymbol = (items: MenuItem[]): string => {
    if (!items || items.length === 0) return 'Rs.';
    
    for (const item of items) {
      if (item.price) {
        const match = item.price.match(/^([^\d]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
    }
    
    return 'Rs.';
  };

  useEffect(() => {
    // Calculate the total price of all items
    const calculateTotal = () => {
      const items = [...pkg.starters, ...pkg.mains, ...pkg.desserts];
      let debug = "Price Calculation:\n";
      
      let total = 0;
      items.forEach(item => {
        const price = extractPriceValue(item.price);
        debug += `${item.name}: ${item.price} -> ${price}\n`;
        total += price;
      });
      
      debug += `Total: ${total}\n`;
      setDebugInfo(debug);
      
      return total;
    };
    
    const itemsTotal = calculateTotal();
    const discountPercentage = pkg.discountPercentage || 10;
    const discountedPrice = Math.round(itemsTotal * (1 - discountPercentage / 100));
    const savings = itemsTotal - discountedPrice;
    
    const currencySymbol = detectCurrencySymbol([...pkg.starters, ...pkg.mains, ...pkg.desserts]);
    
    setPackagePrice(`${currencySymbol}${discountedPrice}`);
    setSavingsDisplay(`${currencySymbol}${savings} (${discountPercentage}% off)`);
  }, [pkg]);

  return (
    <div className="menu-container max-w-4xl mx-auto">
      {/* Elegant header design */}
      <div className="text-center mb-8">
        <h1 className="font-serif text-5xl font-bold text-purple-700 mb-1 tracking-wide">
          {audienceLabels[pkg.audienceType as keyof typeof audienceLabels]} Dining Experience
        </h1>
        <div className="h-1 w-24 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full mb-3"></div>
        <p className="text-purple-600 text-lg italic">A curated selection of exquisite dishes</p>
      </div>
      
      {/* Menu paper background */}
      <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-8 shadow-xl border border-purple-100 relative overflow-hidden">
        {/* Decorative corner flourish */}
        <div className="absolute top-0 left-0 w-24 h-24 text-purple-100 opacity-30">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0 0C25 0 50 12.5 50 50C50 75 37.5 100 0 100V0Z" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-24 h-24 text-purple-100 opacity-30 transform rotate-180">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <path d="M0 0C25 0 50 12.5 50 50C50 75 37.5 100 0 100V0Z" />
          </svg>
        </div>
        
        {/* Package price header */}
        <div className="text-center mb-12 relative">
          <h2 className="font-serif text-4xl font-bold text-purple-800 mb-2">
            Curated Menu
          </h2>
          <div className="flex items-center justify-center mb-4">
            <div className="h-px bg-purple-200 w-12"></div>
            <span className="mx-3 text-purple-400">✦</span>
            <div className="h-px bg-purple-200 w-12"></div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-xl p-6 mt-8 shadow-lg transform hover:scale-[1.01] transition-transform">
            <h3 className="text-white text-3xl font-serif mb-2">
              Package Price: <span className="font-bold">{packagePrice}</span>
            </h3>
            <div className="text-white text-opacity-90 text-sm">
              Save {savingsDisplay}
            </div>
            <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold shadow-md transform rotate-3">
              SPECIAL
            </div>
          </div>
        </div>
        
        <DecorativeDivider />
        
        {/* Starters Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-serif text-3xl text-indigo-800 tracking-wide">Starters</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {pkg.starters.map((item, index) => (
              <div key={index} className="flex bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={getFoodImage(item, 'starters')}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100px, 150px"
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-indigo-900/30 to-transparent"></div>
                </div>
                <div className="flex-grow p-4 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-xl font-medium text-gray-800">{item.name}</h4>
                    <div className="ml-4 font-serif text-lg font-bold text-indigo-600">{item.price}</div>
                  </div>
                  <p className="text-sm text-gray-500 italic mt-1">Delicious starter</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <DecorativeDivider />
        
        {/* Main Courses Section */}
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-serif text-3xl text-purple-800 tracking-wide">Main Courses</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {pkg.mains.map((item, index) => (
              <div key={index} className="flex bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={getFoodImage(item, 'mains')}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100px, 150px"
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 to-transparent"></div>
                </div>
                <div className="flex-grow p-4 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-xl font-medium text-gray-800">{item.name}</h4>
                    <div className="ml-4 font-serif text-lg font-bold text-purple-600">{item.price}</div>
                  </div>
                  <p className="text-sm text-gray-500 italic mt-1">Flavorful main dish</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <DecorativeDivider />
        
        {/* Desserts Section */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-serif text-3xl text-pink-700 tracking-wide">Desserts</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {pkg.desserts.map((item, index) => (
              <div key={index} className="flex bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden transform hover:-translate-y-1 transition-transform duration-300">
                <div className="relative w-32 h-32 flex-shrink-0">
                  <Image
                    src={getFoodImage(item, 'desserts')}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100px, 150px"
                    className="object-cover"
                    style={{ objectFit: 'cover' }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-pink-900/30 to-transparent"></div>
                </div>
                <div className="flex-grow p-4 flex flex-col justify-center">
                  <div className="flex justify-between items-baseline">
                    <h4 className="font-serif text-xl font-medium text-gray-800">{item.name}</h4>
                    <div className="ml-4 font-serif text-lg font-bold text-pink-600">{item.price}</div>
                  </div>
                  <p className="text-sm text-gray-500 italic mt-1">Delightful sweet treat</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-gray-600 mb-4">
          This special menu was tailored for {audienceLabels[pkg.audienceType as keyof typeof audienceLabels].toLowerCase()} preferences.
          Enjoy your dining experience!
        </p>
        
        <button
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg text-sm hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-[1.02] shadow-md"
          onClick={onReset}
        >
          Create New Package
        </button>
      </div>
      
      {/* Debug section - only show during development */}
      {process.env.NODE_ENV === 'development' && debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-xs font-mono text-gray-600 whitespace-pre-wrap">
          {debugInfo}
        </div>
      )}
    </div>
  );
} 