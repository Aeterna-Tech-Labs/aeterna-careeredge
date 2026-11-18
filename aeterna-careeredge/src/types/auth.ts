// src/types/auth.ts
// Shared TypeScript types for authentication

export interface SignupInput {
  name: string;
  email: string;
  mobile: string;
  password: string;
  counsellorConsent: boolean;
}

export interface LoginInput {
  identifier: string; // email or mobile
  password: string;
}

export interface ApiError {
  error: string;
  field?: string; // which form field caused the error
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  mobile: string | null;
  onboardingCompleted: boolean;
}
