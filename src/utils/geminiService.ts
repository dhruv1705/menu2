import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Initialize the Gemini API client with better error handling for the API key
const getApiKey = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not defined in environment variables");
    throw new Error("Missing Gemini API key. Please add GEMINI_API_KEY to your .env.local file");
  }
  return apiKey;
};

// Updated to use the recommended model by Google
// The gemini-pro-vision model was deprecated on July 12, 2024
const GEMINI_MODEL = 'gemini-1.5-flash';

interface MenuItem {
  name: string;
  price: string;
  category?: string;
}

/**
 * Extract menu information from a file using Gemini AI
 * @param fileBuffer - The file buffer containing the menu (PDF or image)
 * @param fileType - The type of file (pdf, jpg, png, etc.)
 * @returns A list of menu items with name and price
 */
export async function extractMenuFromFile(fileBuffer: Buffer, fileType: string): Promise<string> {
  try {
    // Get API key with validation
    const apiKey = getApiKey();
    
    // Initialize the client only when needed with correct class name
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      // Gemini 1.5 might require a system instruction
      generationConfig: {
        temperature: 0.2,
        topK: 32,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    });

    // Convert the file buffer to base64
    const base64Data = fileBuffer.toString('base64');
    
    // Determine MIME type based on file extension
    const mimeType = getMimeType(fileType);
    
    if (!mimeType) {
      throw new Error(`Unsupported file type: ${fileType}`);
    }

    // Configure safety settings
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
      },
    ];

    // Prepare the prompt for Gemini
    const prompt = `You are a helpful assistant that extracts menu items and prices from images or PDFs of restaurant menus.

Please extract all menu items with their prices from this menu.
For each item, format it as a single line with the item name, followed by a hyphen, followed by the price.

For example:
Margherita Pizza - £12.99
Caesar Salad - £8.50
Tiramisu - £6.95

Only include items that have both a name and price. Do not include any additional text, explanations, or headings.`;

    // Create the image part
    const imageParts = [{
      inlineData: {
        data: base64Data,
        mimeType,
      },
    }];

    // Log API request information for debugging (without sensitive data)
    console.log(`Sending request to Gemini API for file type: ${fileType}`);

    // Generate content using Gemini
    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            ...imageParts,
          ],
        },
      ],
      safetySettings,
    });

    const response = result.response;
    const menuText = response.text();
    
    return menuText;
  } catch (error) {
    console.error('Error in Gemini API:', error);
    throw new Error('Failed to process menu with Gemini AI: ' + (error instanceof Error ? error.message : String(error)));
  }
}

/**
 * Get MIME type based on file extension
 */
function getMimeType(fileType: string): string | null {
  const extensionToMimeType: Record<string, string> = {
    'pdf': 'application/pdf',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'webp': 'image/webp',
    'heic': 'image/heic',
  };

  return extensionToMimeType[fileType.toLowerCase()] || null;
} 