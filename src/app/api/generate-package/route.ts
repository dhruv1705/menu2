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
    const { menuItems, audienceType } = await request.json();

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
      
      Also calculate an appropriate package price that offers at least 10% savings compared to ordering items individually.
      
      Return ONLY a JSON object with these fields:
      - starters: array of objects, each with name and price 
      - mains: array of objects, each with name and price
      - desserts: array of objects, each with name and price
      - packagePrice: the discounted package total price as a string with currency symbol
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
        return items.reduce((sum, item) => {
          const price = parseFloat(item.price.replace(/[^0-9.]/g, ''));
          return isNaN(price) ? sum : sum + price;
        }, 0);
      };
      
      const individualTotal = calculateTotalPrice([
        ...(packageData.starters || []),
        ...(packageData.mains || []),
        ...(packageData.desserts || [])
      ]);
      
      const packagePrice = parseFloat(packageData.packagePrice.replace(/[^0-9.]/g, ''));
      const savings = individualTotal - packagePrice;
      
      // Format the package price if needed
      if (!packageData.packagePrice.includes('£') && !packageData.packagePrice.includes('$')) {
        packageData.packagePrice = `£${packageData.packagePrice.replace(/[^0-9.]/g, '')}`;
      }
      
      return NextResponse.json({
        success: true,
        package: {
          ...packageData,
          audienceType,
          totalSavings: savings > 0 ? `£${savings.toFixed(2)}` : undefined
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