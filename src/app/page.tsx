"use client";
import { useState } from 'react';
import MenuInput from './components/MenuInput';
import MenuDisplay from './components/MenuDisplay';
import PackageDisplay from './components/PackageDisplay';

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

export default function Home() {
  const [step, setStep] = useState(1);
  const [menuText, setMenuText] = useState('');
  const [fileType, setFileType] = useState('');
  const [audienceType, setAudienceType] = useState('adult');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [packageResult, setPackageResult] = useState<PackageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateMenu = () => {
    // Simple parsing of menu text
    const parsedItems = menuText.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => {
        const parts = line.split('-');
        return {
          name: parts[0]?.trim() || 'Unknown item',
          price: parts[1]?.trim() || 'N/A'
        };
      });
    
    setMenuItems(parsedItems);
    setStep(2);
  };

  const handleGeneratePackage = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Call our API to generate the package
      const response = await fetch('/api/generate-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          menuItems,
          audienceType,
          discountPercentage
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate package');
      }
      
      const data = await response.json();
      setPackageResult(data.package);
      setStep(3);
    } catch (err) {
      setError('Error generating package. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setMenuItems([]);
    setPackageResult(null);
    setError('');
    setMenuText('');
    setFileType('');
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8">
          AI Menu Package Generator
        </h1>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-100 mb-6 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            <span className="ml-3 text-gray-700 font-medium">Generating your package...</span>
          </div>
        )}
        
        {!isLoading && (
          <>
            {step === 1 && (
              <MenuInput 
                menuText={menuText} 
                setMenuText={setMenuText}
                audienceType={audienceType}
                setAudienceType={setAudienceType}
                discountPercentage={discountPercentage}
                setDiscountPercentage={setDiscountPercentage}
                onGenerate={handleGenerateMenu}
                setFileType={setFileType}
              />
            )}
            
            {step === 2 && (
              <MenuDisplay 
                menuItems={menuItems} 
                onNext={handleGeneratePackage} 
              />
            )}
            
            {step === 3 && packageResult && (
              <PackageDisplay 
                package={packageResult}
                onReset={handleReset}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
