import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  // If we are on Vercel (Production), return a simple message immediately
  // This prevents the build from bundling heavy local-only dependencies
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ 
      success: false, 
      error: "This action is only available on Localhost (PC)." 
    });
  }

  // ... your existing heavy local logic for F: drive creation goes here ...
}