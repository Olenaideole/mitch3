import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.XAI_API_KEY || 'XAI_API_KEY not set';
  return NextResponse.json({ xai_api_key: apiKey });
}
