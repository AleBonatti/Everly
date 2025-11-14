'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Email validation
  const validateEmail = (email: string): boolean => {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }

    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }

    setPasswordError('');
    return true;
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPassword: string): boolean => {
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return false;
    }

    if (confirmPassword !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }

    setConfirmPasswordError('');
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAuthError('');

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();

      console.log('Attempting signup with:', {
        email,
        hasPassword: !!password,
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      console.log('Signup response:', { data, error });

      if (error) {
        // Handle specific error cases
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack,
        });

        if (
          error.message.includes('already registered') ||
          error.message.includes('User already registered')
        ) {
          setAuthError(
            'This email is already registered. Please sign in instead.'
          );
        } else if (error.message.includes('password')) {
          setAuthError(
            'Password does not meet requirements. Please try a stronger password.'
          );
        } else if (
          error.message.includes('Database error') ||
          error.status === 500
        ) {
          setAuthError(
            'Unable to create account due to a server error. Please check your Supabase configuration or try again later.'
          );
        } else if (error.message.includes('Email rate limit')) {
          setAuthError(
            'Too many signup attempts. Please wait a few minutes and try again.'
          );
        } else {
          setAuthError(`Unable to create account: ${error.message}`);
        }
        return;
      }

      // Success - redirect to home (or show email confirmation message)
      router.push('/');
      router.refresh();
    } catch (error) {
      setAuthError('Something went wrong. Please try again later.');
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-10 shadow-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              Create an account
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Start tracking your future wishlist items
            </p>
          </div>

          {/* Auth error message */}
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4"
            >
              <p className="text-sm font-medium text-red-800">{authError}</p>
            </motion.div>
          )}

          {/* Signup form */}
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <Input
              label="Email address"
              type="email"
              id="email"
              name="email"
              autoComplete="email"
              required
              fullWidth
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
                setAuthError('');
              }}
              onBlur={() => validateEmail(email)}
              error={emailError}
            />

            <Input
              label="Password"
              type="password"
              id="password"
              name="password"
              autoComplete="new-password"
              required
              fullWidth
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
                setAuthError('');
                // Re-validate confirm password if it's already filled
                if (confirmPassword) {
                  validateConfirmPassword(confirmPassword);
                }
              }}
              onBlur={() => validatePassword(password)}
              error={passwordError}
              helperText={
                !passwordError ? 'Must be at least 6 characters' : undefined
              }
            />

            <Input
              label="Confirm password"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              fullWidth
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmPasswordError('');
                setAuthError('');
              }}
              onBlur={() => validateConfirmPassword(confirmPassword)}
              error={confirmPasswordError}
            />

            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="relative w-full"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader variant="primary" size="sm" />
                  <span>Creating account...</span>
                </span>
              ) : (
                'Create account'
              )}
            </Button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="font-medium text-sky-600 transition-colors hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
