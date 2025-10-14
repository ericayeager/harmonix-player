import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
  score: number; // 0-5, 5 being strongest
}

export function validatePassword(password: string): PasswordValidationResult {
  const result: PasswordValidationResult = {
    isValid: false,
    errors: [],
    suggestions: [],
    score: 0,
  };

  if (typeof password !== 'string') {
    result.errors.push('Password must be a string');
    return result;
  }

  // Basic length checks
  if (password.length < 8) {
    result.errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    result.errors.push('Password must not exceed 128 characters');
  }

  // Character composition checks
  if (!/[A-Z]/.test(password)) result.errors.push('Include at least one uppercase letter');
  if (!/[a-z]/.test(password)) result.errors.push('Include at least one lowercase letter');
  if (!/\d/.test(password)) result.errors.push('Include at least one digit');
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) result.errors.push('Include at least one special character');

  // Common-pattern checks
  if (/password|123456|qwerty|letmein|admin/i.test(password)) {
    result.errors.push('Avoid common words or repeated patterns');
  }

  // Strength scoring
  let score = 0;
  if (password.length >= 12) score++;
  if (/[A-Z].*[A-Z]/.test(password)) score++;
  if (/[a-z].*[a-z]/.test(password)) score++;
  if (/\d.*\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?].*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;

  result.score = score;

  // Suggestions for improving password
  if (result.errors.length > 0) {
    if (!result.errors.some(e => /length/i.test(e))) result.suggestions.push('Make the password longer (12+ chars)');
    result.suggestions.push('Mix uppercase, lowercase, numbers and symbols');
    result.suggestions.push('Avoid common words and repeated sequences');
  } else if (score < 3) {
    result.suggestions.push('Consider making the password longer or adding additional character types');
  }

  result.isValid = result.errors.length === 0;
  return result;
}

export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (typeof email !== 'string') return { isValid: false, error: 'Email must be a string' };
  const basic = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!basic.test(email)) return { isValid: false, error: 'Invalid email format' };
  if (email.length > 320) return { isValid: false, error: 'Email is too long' };
  if (email.includes('..')) return { isValid: false, error: 'Email cannot contain consecutive dots' };
  return { isValid: true };
}

export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMAIL_NOT_CONFIRMED: 'Please confirm your email before signing in',
  RATE_LIMIT: 'Too many requests, please wait a moment',
  USER_EXISTS: 'An account with this email already exists',
  WEAK_PASSWORD: 'Password does not meet complexity requirements',
  INVALID_EMAIL: 'Invalid email address',
  NETWORK_ERROR: 'Network error, please check your connection',
  UNKNOWN: 'An unknown error occurred',
} as const;
