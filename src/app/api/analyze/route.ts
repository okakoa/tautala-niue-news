import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export async function POST(req: Request) {
  try {
    if (!genAI) {
      return NextResponse.json(
        { error: "Server Configuration Error: GEMINI_API_KEY environment variable is missing." },
        { status: 500 }
      );
    }

    const { url } = await req.json();

    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      return NextResponse.json(
        { error: "Please provide a valid URL starting with http:// or https://" },
        { status: 400 }
      );
    }

    // Prepare the Gemini API Call
    const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

    const prompt = `You are an expert news editor and community manager for "Tautala Niue News" - a global community news platform for the island nation of Niue.

A writer has submitted the following URL as a potential topic or source: ${url}

Please analyze what kind of content this URL represents (based on the URL structure and general knowledge) and generate:
1. A brief summary of what the topic is likely about.
2. 3 Action Steps or Recommendations on how to angle this topic specifically for the Niuean global community (e.g., connecting it to Community, Health, Education, Politics, Sports, Entertainments, Regional, or Global).
3. A draft of a catchy 3-paragraph news article based on this, suitable for immediate publishing and pushing to social media.

Format your response clearly using markdown. Use clear headers, bullet points, and simple, non-technical language. Do not output anything other than the requested sections.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "An error occurred while generating the content. Please try again." },
      { status: 500 }
    );
  }
}
