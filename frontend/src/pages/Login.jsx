import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, Eye, EyeOff, BookOpen } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import api from '../api';
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, setUser } = useAuth(); // Ensure setUser is available if your context supports it, otherwise just navigate
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Authenticating...');
    try {
      await login(identifier, password);
      toast.success('Login successful!', { id: loadingToast });
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials', { id: loadingToast });
    }
  };

  // --- NEW: Handle Google Sign-In Success ---
    const handleGoogleSuccess = async (credentialResponse) => {
    const loadingToast = toast.loading('Signing in with Google...');
    try {
      const { data } = await api.post('/auth/google', { token: credentialResponse.credential });
      
      toast.success('Google login successful!', { id: loadingToast });
      
      // ✅ CHANGE THIS LINE: Force a full reload so the app sees the new login cookie
      window.location.href = '/'; 
      
    } catch (err) {
      toast.error('Google login failed', { id: loadingToast });
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: "url(/bg-hall.jpg)",
          filter: 'blur(4px) brightness(0.4)',
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-8 md:p-16 gap-12">
        {/* Left Side: Branding & Info */}
        <div className="w-full md:w-1/2 text-white">
          <div className="flex items-center gap-4 mb-12">
            <img
              src="/lapaz-logo.png"
              alt="Municipality of La Paz Seal"
              className="w-12 h-12 object-contain bg-white rounded-full p-1"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <div>
              <h2 className="font-bold text-lg leading-tight">Municipality of La Paz</h2>
              <p className="text-slate-300 text-sm">Agusan del Sur • Philippines</p>
            </div>
          </div>

          <p className="text-blue-400 font-semibold tracking-widest text-xs mb-3 uppercase">
            Republic of the Philippines
          </p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Human Resource Management
            <br />
            Information System
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
            Serving the Municipality of La Paz, Agusan del Sur — manage personnel records,
            attendance, leave credits, and terminal benefits under one auditable platform.
          </p>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-md space-y-4">
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck size={20} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">Role-based access control for all municipal offices</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck size={20} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">Immutable audit trail on every HR transaction</span>
            </div>
            <div className="flex items-center gap-3 text-slate-200">
              <ShieldCheck size={20} className="text-blue-400 flex-shrink-0" />
              <span className="text-sm">
                CS Form No. 48 DTR printing, leave ledgers, and TLB computation
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full md:w-1/2 max-w-md bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          <div className="mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
              Authorized Personnel Only
            </span>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">Sign in to HRMIS</h2>
            <p className="text-slate-500 text-sm mt-1">
              Enter your username or email address to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Username or Email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type="text"
                  required
                  placeholder="Enter username or email"
                  className="w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-slate-800"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Sign In
            </button>
          </form>

          {/* --- NEW: Google Sign-In Divider & Button --- */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="w-full flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error('Google login failed')}
              useOneTap
              theme="outline"
              size="large"
              text="signin_with"
              shape="rectangular"
              width="100%"
            />
          </div>
          {/* ---------------------------------------- */}

          {/* Bottom User Manual & Help Link */}
          <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col items-center gap-3">
            <Link
              to="/manual"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-emerald-700/30 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100 font-medium text-sm transition-colors"
            >
              <BookOpen size={17} className="text-emerald-700" />
              <span>User Manual &amp; Printable PDF Guide</span>
            </Link>

            <p className="text-xs text-slate-400 text-center">
              LGU La Paz, Agusan del Sur • Human Resource Management Information System
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}