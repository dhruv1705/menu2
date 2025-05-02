import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { randomUUID } from 'crypto';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';

export async function POST(request: NextRequest) {
  try {
    // Create a unique temporary file path
    const tempFilePath = join(tmpdir(), `${randomUUID()}.pdf`);
    
    // Parse form data from request
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Ensure it's a PDF
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
    }
    
    // Convert the file to a buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Parse the PDF directly, without saving to disk
    try {
      const data = await pdfParse(buffer, {
        // Disable using test files
        max: 0
      });
      
      // Extract text from PDF
      const text = data.text;
      
      // Parse the text to extract menu items
      const menuItems = parseMenuText(text);
      
      return NextResponse.json({ 
        success: true, 
        text: menuItems
      });
    } catch (pdfError) {
      console.error('PDF parsing error:', pdfError);
      return NextResponse.json({ error: 'Failed to parse PDF content' }, { status: 422 });
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

// Helper function to parse menu text and format it properly
function parseMenuText(text: string): string {
  // This is a simple approach that can be improved based on the actual PDF structure
  // For now, we're trying to detect lines that might be menu items with prices
  
  const lines = text.split('\n');
  const menuItems: string[] = [];
  
  // Basic pattern matching for lines that might be menu items
  const pricePattern = /\$?\d+(\.\d{2})?|\£\d+(\.\d{2})?/;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip empty lines
    if (!line) continue;
    
    // Check if line contains a price
    if (pricePattern.test(line)) {
      // Try to extract item name and price
      const parts = line.split(/\s+/);
      const lastPart = parts[parts.length - 1];
      
      // If the last part matches our price pattern
      if (pricePattern.test(lastPart)) {
        const price = lastPart;
        const name = parts.slice(0, -1).join(' ');
        
        if (name) {
          menuItems.push(`${name} - ${price}`);
          continue;
        }
      }
      
      // If we couldn't extract a clean name/price, just add the line as is
      menuItems.push(line);
    } 
    // Also check for lines that have text followed by multiple spaces and then more text
    else if (line.includes('  ')) {
      menuItems.push(line.replace(/\s{2,}/g, ' - '));
    }
  }
  
  return menuItems.join('\n');
} 