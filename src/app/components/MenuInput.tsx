import React, { useState, useRef } from 'react';

interface MenuInputProps {
  menuText: string;
  setMenuText: (text: string) => void;
  audienceType: string;
  setAudienceType: (type: string) => void;
  onGenerate: () => void;
  setFileType: (type: string) => void;
}

export default function MenuInput({
  menuText,
  setMenuText,
  audienceType,
  setAudienceType,
  onGenerate,
  setFileType
}: MenuInputProps) {
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      await processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setFileName(file.name);
      await processFile(file);
    }
  };

  const processFile = async (file: File) => {
    setIsLoading(true);
    setErrorMessage('');
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
    setFileType(fileExtension);

    try {
      // Use Gemini API to process any type of menu file
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/process-menu', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process menu');
      }
      
      const data = await response.json();
      setMenuText(data.text);
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Error processing file');
      setMenuText('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const supportedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.webp', '.heic', '.txt', '.csv'];

  return (
    <div className="space-y-6">
      <div>
        <label className="block mb-2 text-sm font-medium text-gray-900">
          Upload your menu (PDF or image of your menu)
        </label>
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
            isDragging ? 'border-purple-500 bg-purple-50 shadow-md' : 'border-gray-300 hover:border-purple-400 hover:bg-purple-50/30'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleButtonClick}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept={supportedExtensions.join(',')}
            onChange={handleFileChange}
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
              <span className="ml-3 text-sm font-medium text-purple-700">Processing menu with AI...</span>
            </div>
          ) : (
            <>
              <svg 
                className="mx-auto h-14 w-14 text-purple-400" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              
              <p className="mt-4 text-sm font-medium text-gray-600">
                {fileName ? fileName : 'Drag and drop your menu file here, or click to select file'}
              </p>
              <p className="mt-2 text-xs text-gray-500">Supports PDF, images (PNG, JPG), and text files</p>
            </>
          )}
        </div>

        {errorMessage && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100 text-red-700 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p>{errorMessage}</p>
          </div>
        )}

        {menuText && !isLoading && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h3 className="text-sm font-medium text-indigo-700 mb-2">Preview:</h3>
            <div className="text-sm text-gray-700 max-h-32 overflow-y-auto whitespace-pre-line bg-white p-3 rounded-lg shadow-sm">
              {menuText.split('\n').slice(0, 5).join('\n')}
              {menuText.split('\n').length > 5 && '...'}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-900">Select your audience:</label>
        <div className="grid grid-cols-3 gap-4">
          <label className="relative flex cursor-pointer items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-purple-200 bg-white shadow-sm">
            <input
              type="radio"
              value="adult"
              checked={audienceType === 'adult'}
              onChange={() => setAudienceType('adult')}
              className="sr-only"
            />
            <span className={`text-sm font-medium ${audienceType === 'adult' ? 'text-purple-700' : 'text-gray-700'}`}>Adults</span>
            {audienceType === 'adult' && (
              <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500"></span>
            )}
          </label>
          <label className="relative flex cursor-pointer items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-purple-200 bg-white shadow-sm">
            <input
              type="radio"
              value="kids"
              checked={audienceType === 'kids'}
              onChange={() => setAudienceType('kids')}
              className="sr-only"
            />
            <span className={`text-sm font-medium ${audienceType === 'kids' ? 'text-purple-700' : 'text-gray-700'}`}>Kids</span>
            {audienceType === 'kids' && (
              <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500"></span>
            )}
          </label>
          <label className="relative flex cursor-pointer items-center justify-center p-4 rounded-xl border border-gray-200 hover:border-purple-200 bg-white shadow-sm">
            <input
              type="radio"
              value="family"
              checked={audienceType === 'family'}
              onChange={() => setAudienceType('family')}
              className="sr-only"
            />
            <span className={`text-sm font-medium ${audienceType === 'family' ? 'text-purple-700' : 'text-gray-700'}`}>Family</span>
            {audienceType === 'family' && (
              <span className="absolute top-2 right-2 h-3 w-3 rounded-full bg-purple-500"></span>
            )}
          </label>
        </div>
      </div>

      <button
        className={`w-full px-6 py-3 font-medium rounded-lg text-sm focus:outline-none focus:ring-4 transition-all duration-300 shadow-md transform hover:scale-[1.02] ${
          !menuText.trim() || isLoading 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 focus:ring-purple-300'
        }`}
        onClick={onGenerate}
        disabled={!menuText.trim() || isLoading}
      >
        Generate Menu
      </button>
    </div>
  );
} 