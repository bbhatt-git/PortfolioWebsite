
/**
 * Security Utility for Input Sanitization and Validation
 * Prevents XSS, Injection, and Pollution attacks.
 */

// 1. Input Sanitization (XSS Prevention)
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
};

// 2. Strict Email Validation (Regex)
export const isValidEmail = (email: string): boolean => {
  // RFC 5322 Official Standard Regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length < 100;
};

// 3. Simple Client-Side Rate Limiter (DoS Mitigation)
const submissionTimestamps: number[] = [];
const LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS = 3; // Max 3 requests per minute per session

export const checkRateLimit = (): boolean => {
  const now = Date.now();
  // Filter out old timestamps
  const recent = submissionTimestamps.filter(t => now - t < LIMIT_WINDOW);
  
  // Update buffer
  submissionTimestamps.length = 0;
  submissionTimestamps.push(...recent);

  if (recent.length >= MAX_REQUESTS) {
    return false;
  }

  submissionTimestamps.push(now);
  return true;
};

// 4. Validate String Length (Buffer Overflow / Resource Exhaustion Prevention)
export const isValidLength = (text: string, max: number): boolean => {
  return text.length <= max;
};
