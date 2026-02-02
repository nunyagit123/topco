import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function for streaming chat responses
export const config = {
  runtime: 'edge', // Use Edge Runtime for better streaming performance
};

export default async function handler(req: Request) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { history, newMessage, attachments, modelName } = await req.json();

    // Validate input
    if (!newMessage && (!attachments || attachments.length === 0)) {
      return new Response('Missing message or attachments', { status: 400 });
    }

    // Initialize Gemini client with server-side API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return new Response('Server configuration error', { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format history
    const previousHistory = history.map((msg: any) => {
      const parts: any[] = [];
      
      if (msg.text) {
        parts.push({ text: msg.text });
      }

      if (msg.attachments && msg.attachments.length > 0) {
        msg.attachments.forEach((att: any) => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data,
            },
          });
        });
      }

      return {
        role: msg.role,
        parts: parts,
      };
    });

    // Build current message
    const currentMessageParts: any[] = [];
    
    if (attachments && attachments.length > 0) {
      attachments.forEach((att: any) => {
        currentMessageParts.push({
          inlineData: {
            mimeType: att.mimeType,
            data: att.data
          }
        });
      });
    }
    
    if (newMessage) {
      currentMessageParts.push({ text: newMessage });
    }

    const contents = [
      ...previousHistory,
      {
        role: 'user',
        parts: currentMessageParts
      }
    ];

    // Make request with grounding
    const requestParams: any = {
      model: modelName || 'gemini-3-flash-preview',
      contents: contents,
      config: {
        thinkingConfig: { thinkingBudget: 1024 },
        grounding: {
          googleSearch: {}
        }
      },
    };

    const responseStream = await ai.models.generateContentStream(requestParams);

    // Create a streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream) {
            if (chunk.text) {
              // Send each chunk as a line of text
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.text })}\n\n`));
            }
            
            // Check for grounding metadata
            if ((chunk as any).groundingMetadata) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ groundingMetadata: (chunk as any).groundingMetadata })}\n\n`));
            }
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
