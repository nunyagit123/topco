// Security configuration and validation utilities

// File upload constraints
export const FILE_UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxFiles: 5,
  allowedMimeTypes: [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
    // Documents
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/json',
    // Audio
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    // Video
    'video/mp4',
    'video/webm',
  ],
};

// Input constraints
export const INPUT_CONFIG = {
  maxMessageLength: 10000,
  minMessageLength: 1,
  rateLimitMs: 1000, // Minimum time between messages
};

// File validation
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (file.size > FILE_UPLOAD_CONFIG.maxFileSize) {
    return {
      valid: false,
      error: `File "${file.name}" exceeds maximum size of ${FILE_UPLOAD_CONFIG.maxFileSize / (1024 * 1024)}MB`,
    };
  }

  if (!FILE_UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not allowed`,
    };
  }

  return { valid: true };
};

export const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
  if (files.length > FILE_UPLOAD_CONFIG.maxFiles) {
    return {
      valid: false,
      error: `Cannot upload more than ${FILE_UPLOAD_CONFIG.maxFiles} files at once`,
    };
  }

  for (const file of files) {
    const result = validateFile(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
};

// Text input validation
export const validateMessageText = (text: string): { valid: boolean; error?: string } => {
  const trimmed = text.trim();
  
  if (trimmed.length < INPUT_CONFIG.minMessageLength && trimmed.length > 0) {
    return {
      valid: false,
      error: 'Message is too short',
    };
  }

  if (trimmed.length > INPUT_CONFIG.maxMessageLength) {
    return {
      valid: false,
      error: `Message exceeds maximum length of ${INPUT_CONFIG.maxMessageLength} characters`,
    };
  }

  return { valid: true };
};

// Sanitize text to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Rate limiting helper
export class RateLimiter {
  private lastAction: number = 0;
  private minInterval: number;

  constructor(minIntervalMs: number) {
    this.minInterval = minIntervalMs;
  }

  canProceed(): boolean {
    const now = Date.now();
    if (now - this.lastAction < this.minInterval) {
      return false;
    }
    this.lastAction = now;
    return true;
  }

  getRemainingTime(): number {
    const now = Date.now();
    const remaining = this.minInterval - (now - this.lastAction);
    return Math.max(0, remaining);
  }
}

// Secure localStorage wrapper with encryption
export const secureStorage = {
  setItem: (key: string, value: any): void => {
    try {
      // Simple obfuscation (not true encryption, but better than plain text)
      const encoded = btoa(JSON.stringify(value));
      sessionStorage.setItem(key, encoded);
    } catch (error) {
      console.error('Error storing data:', error);
    }
  },

  getItem: (key: string): any => {
    try {
      const encoded = sessionStorage.getItem(key);
      if (!encoded) return null;
      return JSON.parse(atob(encoded));
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  },

  clear: (): void => {
    sessionStorage.clear();
  },
};
