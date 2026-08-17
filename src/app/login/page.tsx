'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, UserPlus, ArrowRight, BookOpen, Check } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        redirect: false,
        username,
        password,
        email: activeTab === 'signup' ? email : undefined,
        action: activeTab, // Let backend know if it's login or signup
        stayLoggedIn: stayLoggedIn ? 'true' : 'false',
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.replace('/');
        router.refresh();
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-lg shadow-primary/20">
            <BookOpen className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">LeetCode FSRS</h1>
          <p className="text-muted-foreground">Master patterns with spaced repetition.</p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-3xl overflow-hidden border border-border/50 animate-in fade-in zoom-in-95 duration-500 delay-150 fill-mode-both shadow-2xl">
          
          {/* Tabs */}
          <div className="flex p-2 gap-2 bg-secondary/30">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2
                ${activeTab === 'login' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <LogIn className="w-4 h-4" />
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`flex-1 py-3 text-sm font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2
                ${activeTab === 'signup' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}
            >
              <UserPlus className="w-4 h-4" />
              Sign Up
            </button>
          </div>

          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              {activeTab === 'signup' && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="text-sm font-medium text-foreground">Recovery Email <span className="text-muted-foreground font-normal">(Optional)</span></label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm"
                />
              </div>

              {/* Stay Logged In Checkbox - Mobile & Desktop Touch-Friendly */}
              <label 
                htmlFor="stayLoggedIn"
                className="flex items-start sm:items-center gap-3 p-2 -mx-2 rounded-xl hover:bg-secondary/30 active:bg-secondary/50 cursor-pointer select-none transition-colors touch-manipulation group"
              >
                <div className="relative flex items-center justify-center mt-0.5 sm:mt-0 flex-shrink-0">
                  <input
                    id="stayLoggedIn"
                    type="checkbox"
                    checked={stayLoggedIn}
                    onChange={(e) => setStayLoggedIn(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all duration-200 ${
                    stayLoggedIn 
                      ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/30' 
                      : 'bg-background border-input hover:border-primary/50 group-hover:border-primary/50'
                  }`}>
                    {stayLoggedIn && <Check className="w-3.5 h-3.5 stroke-[3] animate-in zoom-in-50 duration-150" />}
                  </div>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-medium text-foreground leading-snug group-hover:text-primary transition-colors">
                    Stay logged in
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">
                    Keep your session active on this device
                  </span>
                </div>
              </label>

              {error && (
                <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium animate-in fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:bg-primary/90 active:scale-[0.98] shadow-md flex items-center justify-center gap-2 group disabled:opacity-70 disabled:pointer-events-none mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                ) : (
                  <>
                    {activeTab === 'login' ? 'Sign In to Dashboard' : 'Create Account'}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
