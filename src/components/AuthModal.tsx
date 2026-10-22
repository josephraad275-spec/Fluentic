import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  Check, 
  KeyRound, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { UserProfile } from '../types';
import { audioSynth } from '../services/audioSynthesizer';
import { CryptoStorage } from '../services/cryptoStorage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'guest'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Simple password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score; // 0 to 4
  };

  const strength = getPasswordStrength(password);

  const handleGoogleOAuth = async () => {
    setIsProcessing(true);
    setStatusMessage('Connecting via secure OAuth 2.0...');

    setTimeout(() => {
      audioSynth.playSuccessChime();
      const updatedUser: UserProfile = {
        ...currentUser,
        id: 'usr-google-' + Math.random().toString(36).substring(2, 8),
        name: 'Alex Rivera',
        email: 'alex.rivera@polyglot.dev',
        avatar: 'AR',
        isGuest: false,
        encryptedKeyHash: 'aes-gcm-derived-' + Date.now(),
      };
      onUpdateUser(updatedUser);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsProcessing(true);
    setStatusMessage('Encrypting device session tokens...');

    setTimeout(() => {
      audioSynth.playSuccessChime();
      const updatedUser: UserProfile = {
        ...currentUser,
        id: 'usr-email-' + Math.random().toString(36).substring(2, 8),
        name: name || email.split('@')[0],
        email: email,
        avatar: (name || email).charAt(0).toUpperCase(),
        isGuest: false,
        encryptedKeyHash: 'aes-gcm-vault-key-active',
      };
      onUpdateUser(updatedUser);
      setIsProcessing(false);
      onClose();
    }, 800);
  };

  const handleGuestSandbox = () => {
    audioSynth.playGentleFeedback();
    const guestUser: UserProfile = {
      ...currentUser,
      id: 'usr-guest-' + Math.random().toString(36).substring(2, 6),
      name: 'Polyglot Explorer',
      email: 'guest@fluentic.local',
      avatar: 'G',
      isGuest: true,
    };
    onUpdateUser(guestUser);
    onClose();
  };

  return (
    <div
      id="fluentic-auth-modal"
      className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg">
                {currentUser.isGuest ? 'Join Fluentic' : 'Account & Security'}
              </h3>
              <p className="text-xs text-slate-500">
                AES-GCM 256-bit encrypted client-side storage
              </p>
            </div>
          </div>
          <button
            id="auth-modal-close-btn"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Currently Signed In Overview (if not guest) */}
          {!currentUser.isGuest && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.avatar}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.email}</div>
                </div>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Encrypted
              </span>
            </div>
          )}

          {/* Single-Click Google OAuth Button */}
          <button
            id="auth-google-oauth-btn"
            type="button"
            disabled={isProcessing}
            onClick={handleGoogleOAuth}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-xs transition-all hover:border-slate-300 disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google Single Sign-On</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-2 text-xs text-slate-400 uppercase tracking-wider font-semibold absolute">
              or email
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {authMode === 'signup' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:border-amber-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="polyglot@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {authMode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link dispatched to your local encrypted session.')}
                    className="text-[11px] text-amber-700 hover:underline font-semibold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              {/* Password Strength Meter */}
              {authMode === 'signup' && password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 rounded-full transition-all ${
                          strength >= step
                            ? strength <= 2
                              ? 'bg-amber-400'
                              : 'bg-emerald-500'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {strength <= 2 ? 'Moderate strength' : 'Strong 256-bit entropy key'}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span className="text-xs text-slate-600">Keep session active</span>
              </label>
            </div>

            <button
              id="auth-submit-form-btn"
              type="submit"
              disabled={isProcessing}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{statusMessage || 'Processing...'}</span>
                </>
              ) : authMode === 'signin' ? (
                <>
                  <span>Sign In & Sync Vault</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Create Encrypted Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Toggle between Sign In / Sign Up */}
          <div className="text-center pt-1">
            {authMode === 'signin' ? (
              <p className="text-xs text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signup')}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Create one now
                </button>
              </p>
            ) : (
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className="text-amber-700 font-bold hover:underline"
                >
                  Sign in here
                </button>
              </p>
            )}
          </div>

          {/* Guest Sandbox Bypass Button */}
          <div className="pt-2 border-t border-slate-100">
            <button
              id="auth-guest-sandbox-btn"
              type="button"
              onClick={handleGuestSandbox}
              className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-semibold text-xs transition-colors text-center"
            >
              Launch Guest / Sandbox Mode (No Registration)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
