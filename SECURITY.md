# Security Guidelines

This document outlines the security measures implemented in this application and best practices for maintaining security.

## 🔐 Implemented Security Measures

### 1. Environment Variables
All sensitive API keys and configuration are stored in environment variables:
- Firebase configuration (`.env` file)
- Gemini API key (`.env` file)
- **Important:** Never commit the `.env` file to version control

### 2. File Upload Security
- **Maximum file size:** 10MB per file
- **Maximum files:** 5 files per upload
- **Allowed file types:** 
  - Images: JPEG, PNG, GIF, WebP, SVG
  - Documents: PDF, Plain Text, CSV, JSON
  - Audio: MP3, WAV, OGG
  - Video: MP4, WebM
- **Validation:** All files are validated before upload

### 3. Input Validation & Sanitization
- **Message length limits:** 1-10,000 characters
- **Rate limiting:** Minimum 1 second between messages
- **XSS Prevention:** All user inputs are validated and sanitized

### 4. Markdown Rendering Security
- Dangerous HTML elements blocked: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`
- All disallowed elements are unwrapped rather than rendered

### 5. Data Storage Security
- **SessionStorage:** Chat sessions stored in sessionStorage (cleared on browser close)
- **No persistent sensitive data:** Sensitive information is not stored long-term
- **Sanitization:** All data is sanitized before storage

### 6. Firebase Security
- API keys moved to environment variables
- Authentication required for all operations
- **TODO:** Configure Firebase Security Rules (see below)

## ⚠️ Additional Security Steps Required

### Firebase Security Rules
You **must** configure Firebase Security Rules in your Firebase Console:

#### Firestore Security Rules Example:
\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Only authenticated users can read/write their own data
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

#### Storage Security Rules Example:
\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
\`\`\`

### Firebase Console Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Authentication** → **Settings** → **Authorized domains**
4. Add only your production domain(s)
5. Navigate to **Firestore Database** → **Rules**
6. Apply the security rules shown above
7. Navigate to **Storage** → **Rules**
8. Apply the storage security rules shown above

### API Key Security
1. **Rotate your Firebase API key** since it was exposed in source control
   - Go to Google Cloud Console → Credentials
   - Create new API key
   - Update `.env` file
   - Delete old key

2. **Restrict API keys:**
   - Go to Google Cloud Console → Credentials
   - Edit your API key
   - Add application restrictions (HTTP referrers)
   - Add API restrictions (only enable APIs you use)

3. **Gemini API Key:**
   - Current implementation exposes API key in client
   - **RECOMMENDED:** Create a backend proxy server
   - Backend should validate requests and call Gemini API
   - Never expose API keys in client-side code

## 🛡️ Best Practices

### For Development
1. Never commit `.env` file to version control
2. Use `.env.example` as a template (without actual keys)
3. Share API keys securely (encrypted messages, password managers)
4. Regularly rotate API keys
5. Monitor API usage for suspicious activity

### For Production
1. **Use a backend API proxy** for all AI API calls
2. Implement proper CORS headers
3. Add Content Security Policy (CSP) headers
4. Enable HTTPS only
5. Implement request throttling/rate limiting on the server
6. Add logging and monitoring for security events
7. Regular security audits and dependency updates

### Content Security Policy (CSP)
Add these meta tags to `index.html`:
\`\`\`html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' 'unsafe-eval'; 
               style-src 'self' 'unsafe-inline'; 
               img-src 'self' data: https:; 
               connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.cloudfunctions.net;
               frame-ancestors 'none';">
\`\`\`

## 📋 Security Checklist

- [x] API keys moved to environment variables
- [x] File upload validation implemented
- [x] Input validation and sanitization
- [x] XSS prevention in markdown rendering
- [x] Rate limiting on client side
- [x] SessionStorage instead of localStorage
- [ ] **Firebase Security Rules configured** (Required!)
- [ ] **API keys rotated** (Required!)
- [ ] **API key restrictions set** (Required!)
- [ ] Backend API proxy for Gemini (Highly Recommended)
- [ ] CSP headers configured
- [ ] HTTPS enforced in production
- [ ] Server-side rate limiting
- [ ] Monitoring and logging setup

## 🚨 Security Incident Response

If you suspect a security breach:
1. Immediately rotate all API keys
2. Review Firebase audit logs
3. Check for unauthorized access
4. Update security rules to be more restrictive
5. Monitor for unusual API usage
6. Contact affected users if data was exposed

## 📞 Security Contacts

- Report vulnerabilities responsibly
- Never share API keys in public channels
- Use encrypted communication for sensitive data

---

**Last Updated:** February 2, 2026
**Next Review:** Monthly security audit recommended
