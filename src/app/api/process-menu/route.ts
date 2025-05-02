import { NextRequest, NextResponse } from 'next/server';
import { extractMenuFromFile } from '@/utils/geminiService';

export async function POST(request: NextRequest) {
  try {
    // Parse form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Get file extension
    const filename = file.name;
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    
    // Check if file type is supported
    const supportedTypes = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'heic'];
    if (!supportedTypes.includes(fileExtension)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${fileExtension}. Supported types: ${supportedTypes.join(', ')}` 
      }, { status: 400 });
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract menu items using Gemini AI
    try {
      const menuText = await extractMenuFromFile(buffer, fileExtension);
      
      return NextResponse.json({ 
        success: true, 
        text: menuText
      });
    } catch (aiError) {
      console.error('AI processing error:', aiError);
      return NextResponse.json({ 
        error: aiError instanceof Error ? aiError.message : 'Error processing menu with AI' 
      }, { status: 422 });
    }
  } catch (error) {
    console.error('Request processing error:', error);
    return NextResponse.json({ 
      error: 'Failed to process request' 
    }, { status: 500 });
  }
} 