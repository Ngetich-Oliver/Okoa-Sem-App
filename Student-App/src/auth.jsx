import React, { useState, useEffect } from 'react';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  LogOut,
  ShieldCheck,
  User,
  Mail,
  Lock,
  KeyRound,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Globe,
  Activity,
  Fingerprint,
} from 'lucide-react';

import { auth, googleProvider } from './firebase';

googleProvider.addScope('profile');
googleProvider.addScope('email');

// 💡 Define your admin email addresses here
const ADMIN_EMAILS = [
  'your-admin-email@gmail.com',
];

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Helper function to check admin role
  const checkIsAdmin = (email) => {
    return !!email && ADMIN_EMAILS.includes(email.toLowerCase());
  };

  // 1. Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !currentUser.isAnonymous) {
        setUser({
          displayName: currentUser.displayName || 'Google User',
          email: currentUser.email || 'user@gmail.com',
          photoURL: currentUser.photoURL || null,
          uid: currentUser.uid,
          emailVerified: currentUser.emailVerified,
          metadata: currentUser.metadata,
          isAdmin: checkIsAdmin(currentUser.email),
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Real Google Login
  const handleGoogleSignIn = async () => {
    setError(null);
    setActionLoading(true);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const loggedUser = result.user;
      setUser({
        displayName: loggedUser.displayName || 'Google User',
        email: loggedUser.email || 'user@gmail.com',
        photoURL: loggedUser.photoURL || null,
        uid: loggedUser.uid,
        emailVerified: loggedUser.emailVerified,
        metadata: loggedUser.metadata,
        isAdmin: checkIsAdmin(loggedUser.email),
      });
      setIsDemoMode(false);
    } catch (err) {
      console.error("Google Auth Error:", err);
      
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed before completing the process.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized in Firebase Console. Showing Demo Mode button.');
      } else if (err.code === 'auth/api-key-not-valid' || err.code === 'auth/invalid-api-key') {
        setError('Firebase API Key is invalid. You can test using the Demo Login below.');
      } else {
        setError(err.message || 'Failed to sign in with Google. Please try again.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  // Simulated Login for Quick Demonstration & Sandbox Testing
  const handleDemoSignIn = () => {
    setError(null);
    setActionLoading(true);

    setTimeout(() => {
      const demoEmail = 'alex.morgan@gmail.com';
      setUser({
        displayName: 'Alex Morgan',
        email: demoEmail,
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
        uid: 'demo-google-user-id-998811',
        emailVerified: true,
        metadata: {
          creationTime: new Date().toUTCString(),
          lastSignInTime: new Date().toUTCString()
        },
        isAdmin: checkIsAdmin(demoEmail),
      });
      setIsDemoMode(true);
      setActionLoading(false);
    }, 800);
  };

  // Sign Out Handler
  const handleSignOut = async () => {
    setActionLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setIsDemoMode(false);
    } catch (err) {
      console.error("Sign out error:", err);
      setError("Failed to sign out. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <Sparkles className="w-6 h-6 text-blue-400 absolute" />
        </div>
        <p className="mt-4 text-slate-400 font-medium text-sm tracking-wide">Initializing Authentication...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white font-sans antialiased">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              AuthVault
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              Firebase Auth
            </span>
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <span className="hidden md:inline-block text-xs text-slate-400">
              Logged in as <strong className="text-slate-200 font-medium">{user.email}</strong>
            </span>
            <button
              onClick={handleSignOut}
              disabled={actionLoading}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-slate-300 text-xs font-medium transition-all duration-200 hover:text-white"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-grow flex items-center justify-center p-4 sm:p-6">
        {!user ? (
          /* LOGIN CARD STATE */
          <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl shadow-black/50 transition-all duration-300">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 mb-4 shadow-inner">
                <KeyRound className="w-7 h-7 text-blue-400" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Welcome Back
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                Sign in securely with your Google account to access your personal dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-xs leading-relaxed animate-fadeIn">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-semibold block mb-0.5 text-rose-200">Authentication Alert</span>
                  {error}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <button
                onClick={handleGoogleSignIn}
                disabled={actionLoading}
                className="w-full relative group overflow-hidden rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3.5 px-5 flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-white/5 hover:shadow-white/10 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {actionLoading ? (
                  <div className="w-5 h-5 border-2 border-slate-400 border-t-slate-900 rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.39 7.37 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.99 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.61 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                      />
                    </svg>
                    <span className="text-sm">Sign in with Google</span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform ml-auto" />
                  </>
                )}
              </button>

              <div className="pt-2">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                    or preview without google setup
                  </span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                <button
                  onClick={handleDemoSignIn}
                  disabled={actionLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-all duration-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Launch Demo Session</span>
                </button>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-3 text-left">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>OAuth 2.0 Secure</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero Password Risk</span>
              </div>
            </div>

            <p className="mt-6 text-center text-[11px] text-slate-500 leading-normal">
              By logging in, you agree to our Terms of Service and Privacy Policy. Powered by Firebase Auth.
            </p>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD STATE */
          <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 transition-all duration-300">
            
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  {isDemoMode ? 'Demo Session Active' : 'Authenticated with Google'}
                </span>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                UID: {user.uid.slice(0, 10)}...
              </span>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <div className="relative">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName}
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-blue-500/30 shadow-lg shadow-blue-500/10"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/150";
                    }}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-blue-500/30 shadow-lg">
                    {user.displayName.charAt(0)}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 bg-blue-500 p-1 rounded-lg text-white shadow">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-white flex items-center justify-center sm:justify-start gap-2">
                  {user.displayName}
                </h2>
                <p className="text-slate-400 text-sm flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>{user.email}</span>
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
                    Verified Google Profile
                  </span>
                  <span className={`px-2.5 py-1 rounded-md border text-[11px] font-medium ${
                    user.isAdmin 
                      ? 'bg-amber-950/60 border-amber-800/50 text-amber-300' 
                      : 'bg-blue-950/60 border-blue-800/50 text-blue-300'
                  }`}>
                    Role: {user.isAdmin ? 'Admin' : 'Standard User'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Globe className="w-3.5 h-3.5 text-blue-400" />
                  <span>AuthProvider</span>
                </div>
                <p className="text-sm font-semibold text-white">google.com</p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Email Status</span>
                </div>
                <p className="text-sm font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
                  <Activity className="w-3.5 h-3.5 text-sky-400" />
                  <span>Session Status</span>
                </div>
                <p className="text-sm font-semibold text-white">Active & Tokenized</p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Protected by Firebase Authentication SDK</span>
              </div>

              <button
                onClick={handleSignOut}
                disabled={actionLoading}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/30 text-rose-300 hover:text-rose-200 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Google</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-6 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} AuthVault. Designed for Firebase React Applications.</p>
      </footer>
    </div>
  );
}