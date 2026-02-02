import { Message, Role } from '../types';

// Model definitions remain the same
export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash' },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro' },
];

export const IMAGE_MODELS = [
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash (Fast)', isPaid: false },
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3.0 Pro (High Quality)', isPaid: true },
];

export const DEFAULT_MODEL = AVAILABLE_MODELS[0].id;
export const DEFAULT_IMAGE_MODEL = IMAGE_MODELS[0].id;

/**
 * Stream chat response via Vercel API proxy
 * This keeps the API key secure on the server side
 */
export const streamChatResponse = async (
  history: Message[],
  newMessageText: string,
  attachments: { mimeType: string; data: string }[],
  modelName: string,
  onChunk: (text: string) => void
) => {
  try {
    // Call our Vercel API route instead of calling Gemini directly
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        history: history.map(msg => ({
          role: msg.role,
          text: msg.text,
          attachments: msg.attachments,
          thought: msg.thought,
        })),
        newMessage: newMessageText,
        attachments,
        modelName,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    // Read the streaming response
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              onChunk(parsed.text);
            }
            if (parsed.groundingMetadata) {
              console.log('[DEBUG] Grounding metadata:', parsed.groundingMetadata);
            }
          } catch (e) {
            console.error('Error parsing chunk:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error streaming response:", error);
    throw error;
  }
};

/**
 * Generate image via Vercel API proxy
 */
export const generateImage = async (prompt: string, modelId: string = DEFAULT_IMAGE_MODEL): Promise<string | null> => {
  try {
    // Call our Vercel API route
    const response = await fetch('/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        modelId,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    const result = await response.json();
    
    if (result.success && result.imageData) {
      return result.imageData;
    }
    
    return null;
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};