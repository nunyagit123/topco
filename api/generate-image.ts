import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function for image generation
export const config = {
  runtime: 'edge',
  maxDuration: 60, // Allow up to 60 seconds for image generation
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { prompt, modelId } = await req.json();

    if (!prompt) {
      return new Response('Missing prompt', { status: 400 });
    }

    // Initialize Gemini client with server-side API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Generate image
    const model = modelId || 'gemini-2.5-flash-image';
    const result = await ai.models.generateContent({
      model: model,
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
    });

    // Extract image data
    if (result.candidates && result.candidates.length > 0) {
      const candidate = result.candidates[0];
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if ((part as any).inlineData) {
            const imageData = (part as any).inlineData.data;
            return new Response(JSON.stringify({ 
              success: true, 
              imageData,
              mimeType: (part as any).inlineData.mimeType || 'image/png'
            }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          }
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: false, 
      error: 'No image generated' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('Image generation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message || 'Internal server error' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
