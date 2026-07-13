import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Eye, EyeOff, Sparkles, User, Lock, Heart } from 'lucide-react';

export default function Auth() {
  const { login, register, error, setError, loginWithBiometrics } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password || (!isLogin && !name)) {
      setError('Please fill in all required fields.');
      return;
    }
    
    setLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-cream-100">
      <div className="w-full max-w-md bg-white rounded-3xl border border-sage-100 p-8 shadow-premium text-center">
        
        {/* Calming Brand Icon & Title */}
        <div className="flex justify-center mb-6">
          <img src="/Rise21.png" alt="Rise21 Logo" className="w-48 h-48 object-contain" />
        </div>

        {/* Auth Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-sm rounded-2xl text-left animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 text-left">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
                <input
                  type="text"
                  placeholder="e.g. Tushar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
                  required={!isLogin}
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              Username
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-cream-600 uppercase tracking-wider mb-2 ml-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-cream-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-12 py-3 bg-cream-50 border border-cream-200 rounded-2xl text-sm focus:outline-none focus:border-sage-300 focus:ring-1 focus:ring-sage-300 transition-all font-sans"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-cream-400 hover:text-cream-600 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sage-500 hover:bg-sage-600 text-white font-medium py-3 rounded-2xl text-sm transition-all shadow-premium hover:shadow-premium-hover mt-4 flex items-center justify-center font-sans active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : isLogin ? (
              'Sign In'
            ) : (
              'Create Account'
            )}
          </button>

          {isLogin && !!localStorage.getItem('sadhna_bio_credential_id') && (
            <button
              type="button"
              onClick={loginWithBiometrics}
              className="w-full bg-cream-50 hover:bg-cream-100/80 text-sage-800 border border-cream-200 font-semibold py-3 rounded-2xl text-xs transition-all shadow-sm mt-3 flex items-center justify-center gap-2 font-sans active:scale-[0.98]"
            >
              <span className="text-sm">🔒</span>
              <span>Sign in with Face ID / Touch ID</span>
            </button>
          )}
        </form>

        {/* Toggle between register and login */}
        <div className="mt-8 pt-6 border-t border-cream-200 text-sm font-sans">
          {isLogin ? (
            <p className="text-cream-600">
              New to Rise21?{' '}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError('');
                }}
                className="text-sage-500 hover:text-sage-600 font-semibold focus:outline-none"
              >
                Create an account
              </button>
            </p>
          ) : (
            <p className="text-cream-600">
              Already have an account?{' '}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError('');
                }}
                className="text-sage-500 hover:text-sage-600 font-semibold focus:outline-none"
              >
                Sign in here
              </button>
            </p>
          )}
        </div>

        {/* Motivational Footer */}
        <div className="mt-8 flex items-center justify-center text-[11px] text-cream-400 font-sans tracking-wide">
          <Heart className="w-3 h-3 text-sage-300 mr-1 animate-pulse" /> 1% better every day through awareness
        </div>

      </div>
    </div>
  );
}
