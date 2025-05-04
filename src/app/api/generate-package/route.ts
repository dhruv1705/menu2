import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini client with validation
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.error("Invalid GEMINI_API_KEY in environment variables");
    throw new Error("Missing or invalid Gemini API key. Please add a valid GEMINI_API_KEY to your .env.local file");
  }
  return new GoogleGenerativeAI(apiKey);
};

// Use the newer model
const GEMINI_MODEL = 'gemini-1.5-flash';

interface MenuItem {
  name: string;
  price: string;
}

export async function POST(request: Request) {
  try {
    const { menuItems, audienceType, discountPercentage = 10 } = await request.json();

    // Validate request
    if (!menuItems || !Array.isArray(menuItems) || !audienceType) {
      return NextResponse.json(
        { error: 'Invalid request. Menu items and audience type are required.' },
        { status: 400 }
      );
    }

    // Define audience preferences to guide the AI
    const audiencePreferences = {
      adult: {
        preferences: "sophisticated dishes, balanced flavors, may include alcoholic options",
        avoid: "overly childish presentations, extremely spicy or unusual flavors unless specifically preferred by adults",
        starterCount: 2,
        mainCount: 1,
        dessertCount: 1
      },
      kids: {
        preferences: "fun presentations, mild flavors, familiar foods, smaller portions",
        avoid: "spicy foods, alcoholic ingredients, overly complex dishes, bitter foods",
        starterCount: 1,
        mainCount: 1,
        dessertCount: 1
      },
      family: {
        preferences: "variety of options that appeal to both adults and children, sharable dishes, comfort foods",
        avoid: "extremely niche or polarizing flavors, overly fancy presentations",
        starterCount: 2,
        mainCount: 2,
        dessertCount: 1
      }
    };
    
    const preferences = audiencePreferences[audienceType as keyof typeof audiencePreferences];

    // Create a prompt for Gemini
    const prompt = `
      You are a helpful restaurant menu package creator.

      Based on this menu: ${JSON.stringify(menuItems)}
      
      Create a package for ${audienceType} dining preferences. Select the following:
      - ${preferences.starterCount} starter(s)
      - ${preferences.mainCount} main course(s)
      - ${preferences.dessertCount} dessert(s)
      
      Consider these preferences: ${preferences.preferences}
      Avoid: ${preferences.avoid}
      
      IMPORTANT PRICING INSTRUCTIONS:
      1. Calculate the sum of all individual items you selected
      2. Apply a ${discountPercentage}% discount to that sum to get the package price (exactly ${discountPercentage}% off)
      3. Use the SAME CURRENCY SYMBOL as the menu items (e.g., if prices are in Rs., your package price should be in Rs.)
      
      Return ONLY a JSON object with these fields:
      - starters: array of objects, each with name and price (preserve original format) 
      - mains: array of objects, each with name and price (preserve original format)
      - desserts: array of objects, each with name and price (preserve original format)
      - packagePrice: the discounted package total price as a string with the SAME currency symbol as in the menu items
    `;

    try {
      // Get Gemini client with validation
      const genAI = getGeminiClient();
      
      // Initialize the model
      const model = genAI.getGenerativeModel({
        model: GEMINI_MODEL,
        generationConfig: {
          temperature: 0.2,
          topK: 32,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      });

      console.log(`Sending package generation request to Gemini API for audience type: ${audienceType}`);

      // Generate content using Gemini
      const result = await model.generateContent(prompt);
      const response = result.response;
      const packageText = response.text();
      
      // Parse the JSON response, handling markdown code blocks if present
      let packageData;
      try {
        // Extract JSON from markdown code blocks if present
        let jsonContent = packageText;
        if (packageText.includes('```')) {
          // Extract content between code block markers
          const match = packageText.match(/```(?:json)?\s*([\s\S]*?)```/);
          if (match && match[1]) {
            jsonContent = match[1].trim();
          }
        }
        
        packageData = JSON.parse(jsonContent);
      } catch (parseError) {
        console.error('Error parsing Gemini response as JSON:', parseError);
        console.log('Raw response:', packageText);
        return NextResponse.json(
          { error: 'Failed to parse Gemini response as valid JSON' },
          { status: 422 }
        );
      }
      
      // Validate the response has the expected structure
      if (!packageData.starters || !packageData.mains || !packageData.desserts || !packageData.packagePrice) {
        return NextResponse.json(
          { error: 'Gemini response missing required fields' },
          { status: 422 }
        );
      }
      
      // Calculate the savings compared to buying individually
      const calculateTotalPrice = (items: MenuItem[]): number => {
        console.log('Items to calculate:', JSON.stringify(items));
        
        let total = 0;
        for (const item of items) {
          // Log each item for debugging
          console.log(`Processing item: ${item.name}, price: ${item.price}`);
          
          // Extract the numeric part correctly
          const priceMatch = item.price.match(/(\d+)/);
          if (priceMatch && priceMatch[1]) {
            const price = parseInt(priceMatch[1], 10);
            console.log(`Extracted price for ${item.name}: ${price}`);
            total += price;
          } else {
            console.log(`Failed to extract price for ${item.name}`);
          }
        }
        
        console.log(`Total calculated price: ${total}`);
        return total;
      };
      
      // Detect the currency symbol from menu items
      const detectCurrencySymbol = (items: MenuItem[]): string => {
        // Default to Rs. if we can't detect
        if (!items || items.length === 0) return 'Rs.';
        
        // Try to extract currency symbol from the first item with a price
        for (const item of items) {
          if (item.price) {
            // Extract currency symbols like Rs., Rs, $, £, €, etc.
            const match = item.price.match(/^([^\d]+)/);
            if (match && match[1]) {
              console.log(`Detected currency symbol: ${match[1]}`);
              return match[1];
            }
          }
        }
        
        console.log('Using default currency symbol: Rs.');
        return 'Rs.';
      };
      
      // Calculate the total price of all selected items
      const individualTotal = calculateTotalPrice([
        ...(packageData.starters || []),
        ...(packageData.mains || []),
        ...(packageData.desserts || [])
      ]);
      
      console.log('Individual total price:', individualTotal);
      
      // Get the currency symbol
      const currencySymbol = detectCurrencySymbol([
        ...(packageData.starters || []),
        ...(packageData.mains || []),
        ...(packageData.desserts || [])
      ]);
      
      // Calculate the correct discounted price based on the user's selected percentage
      const correctDiscountedPrice = Math.round(individualTotal * (1 - discountPercentage / 100));
      const savings = Math.round(individualTotal - correctDiscountedPrice);
      
      console.log('Calculated package price:', correctDiscountedPrice);
      console.log('Calculated savings:', savings);
      
      // Update the package price with correct currency and value
      packageData.packagePrice = `${currencySymbol}${correctDiscountedPrice}`;
      
      // Write debug logs to file
      try {
        const fs = require('fs');
        const debugInfo = `
Time: ${new Date().toISOString()}
Menu Items: ${JSON.stringify(packageData, null, 2)}
Individual Total: ${individualTotal}
Discount: ${discountPercentage}%
Package Price: ${correctDiscountedPrice}
Savings: ${savings}
        `;
        fs.appendFileSync('./debug/prices.txt', debugInfo);
      } catch (error) {
        console.error('Failed to write debug log:', error);
      }
      
      return NextResponse.json({
        success: true,
        package: {
          ...packageData,
          audienceType,
          discountPercentage,
          totalSavings: savings > 0 ? `${currencySymbol}${savings}` : undefined
        }
      });
    } catch (geminiError) {
      console.error('Gemini API error:', geminiError);
      
      // Provide a more user-friendly error message based on error type
      if (geminiError instanceof Error) {
        const errorMessage = geminiError.message;
        
        if (errorMessage.includes('403') || errorMessage.includes('401') || errorMessage.includes('API key')) {
          return NextResponse.json(
            { error: 'Invalid Gemini API key. Please update your GEMINI_API_KEY in the .env.local file.' },
            { status: 401 }
          );
        } else if (errorMessage.includes('429')) {
          return NextResponse.json(
            { error: 'Gemini API rate limit exceeded. Please try again later.' },
            { status: 429 }
          );
        }
      }
      
      return NextResponse.json(
        { error: 'Failed to generate package with Gemini.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error generating package:', error);
    return NextResponse.json(
      { error: 'Failed to generate package' },
      { status: 500 }
    );
  }
} 