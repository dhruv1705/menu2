import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are loaded
  const envStatus = {
    GEMINI_API_KEY: {
      exists: Boolean(process.env.GEMINI_API_KEY),
      length: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
      // Don't show the actual key for security
      masked: process.env.GEMINI_API_KEY ? `${process.env.GEMINI_API_KEY.substring(0, 3)}...${process.env.GEMINI_API_KEY.substring(process.env.GEMINI_API_KEY.length - 3)}` : null
    },
    OPENAI_API_KEY: {
      exists: Boolean(process.env.OPENAI_API_KEY),
      length: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0,
      // Don't show the actual key for security
      masked: process.env.OPENAI_API_KEY ? `${process.env.OPENAI_API_KEY.substring(0, 3)}...${process.env.OPENAI_API_KEY.substring(process.env.OPENAI_API_KEY.length - 3)}` : null
    },
    NODE_ENV: process.env.NODE_ENV,
    appDir: process.cwd(),
    envFiles: {
      dotEnvLocal: '.env.local'
    }
  };

  return NextResponse.json({ 
    status: 'ok',
    environment: envStatus
  });
} 