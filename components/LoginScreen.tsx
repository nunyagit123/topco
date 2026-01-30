import React from 'react';
import { signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';
import { LogIn, Mail } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      onLoginSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess();
    } catch (err: any) {
      console.error('Email auth error:', err);
      let errorMessage = 'Authentication failed';
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use. Try signing in instead.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg">
            <span className="text-4xl font-bold text-white">T</span>
          </div>
          <h1 className="text-4xl font-bold text-white">TopcoBot</h1>
          <p className="text-slate-400">Sign in to continue</p>
        </div>

        {/* Login Options */}
        <div className="space-y-4">
          {!showEmailForm ? (
            <>
              {/* Google Login Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                )}
                <span>{isLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-700"></div>
                <span className="text-xs text-slate-500">OR</span>
                <div className="flex-1 h-px bg-slate-700"></div>
              </div>

              {/* Email Button */}
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-medium py-4 px-6 rounded-xl transition-colors"
              >
                <Mail size={20} />
                <span>Continue with Email</span>
              </button>
            </>
          ) : (
            <>
              {/* Email Form */}
              <form onSubmit={handleEmailAuth} className="space-y-4">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
                <input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-400 py-3 px-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-4 px-6 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 mx-auto border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              {/* Toggle Sign Up / Sign In */}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="w-full text-sm text-slate-400 hover:text-white transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>

              {/* Back Button */}
              <button
                onClick={() => {
                  setShowEmailForm(false);
                  setError(null);
                  setEmail('');
                  setPassword('');
                }}
                className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                ← Back to login options
              </button>
            </>
          )}

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-xs text-slate-500 mt-8">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};
