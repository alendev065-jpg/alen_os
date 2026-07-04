import { useState, type FormEvent } from 'react';
import { useAuth } from '../lib/auth';
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, Fingerprint } from 'lucide-react';

export default function AuthPortal() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const fn = mode === 'login' ? signIn : signUp;
    const { error } = await fn(email, password);

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    if (mode === 'signup') {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen bg-alen-black flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-alen-red blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white blur-[120px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-alen-red mb-4 rounded-sm">
            <Fingerprint size={28} className="text-white" />
          </div>
          <h1 className="font-mono text-2xl font-bold tracking-widest2 text-white leading-none">ALEN</h1>
          <p className="font-mono text-xs tracking-widest text-alen-gray mt-2 leading-none">
            MASTER DIRECTORY
          </p>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/10 backdrop-blur-sm rounded-sm p-6 sm:p-8">
          {/* Mode toggle */}
          <div className="flex mb-6 border border-white/10 rounded-sm overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`flex-1 py-2.5 font-mono text-xs font-bold tracking-widest transition-colors ${
                mode === 'login' ? 'bg-alen-red text-white' : 'text-alen-gray hover:text-white'
              }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null); }}
              className={`flex-1 py-2.5 font-mono text-xs font-bold tracking-widest transition-colors ${
                mode === 'signup' ? 'bg-alen-red text-white' : 'text-alen-gray hover:text-white'
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block font-mono text-xs tracking-widest text-alen-gray mb-1.5">
                EMAIL
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-alen-gray" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@alen.os"
                  className="w-full bg-alen-black border border-white/10 text-white font-mono text-sm pl-10 pr-3 py-2.5 rounded-sm placeholder:text-alen-gray/40 focus:border-alen-red focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block font-mono text-xs tracking-widest text-alen-gray mb-1.5">
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-alen-gray" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-alen-black border border-white/10 text-white font-mono text-sm pl-10 pr-3 py-2.5 rounded-sm placeholder:text-alen-gray/40 focus:border-alen-red focus:outline-none transition-colors"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 bg-alen-red/10 border border-alen-red/30 text-alen-red px-3 py-2.5 rounded-sm">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
                <span className="font-mono text-xs leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-alen-red text-white font-mono text-xs font-bold tracking-widest py-3 rounded-sm hover:bg-alen-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'ACCESS SYSTEM' : 'CREATE ACCOUNT'}
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>

          {/* Switch link */}
          <p className="text-center font-mono text-xs text-alen-gray mt-5">
            {mode === 'login' ? "No account? " : "Already registered? "}
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="text-white underline underline-offset-2 hover:text-alen-red transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center font-mono text-xs text-alen-gray/50 mt-6 tracking-widest">
          ALEN.OS // SECURE ACCESS // v4.0
        </p>
      </div>
    </div>
  );
}
