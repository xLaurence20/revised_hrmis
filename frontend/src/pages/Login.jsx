import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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

  return (
    <div className="min-h-screen flex bg-slate-900 overflow-hidden relative">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center" 
        style={{ 
          backgroundImage: "url('/bg-hall.jpg')",
          filter: "blur(4px) brightness(0.4)"
        }}
      />
      
      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between p-8 md:p-16">
        
        {/* Left Side: Branding & Info */}
        <div className="w-full md:w-1/2 text-white mb-12 md:mb-0">
          <div className="flex items-center gap-4 mb-16">
            <img src="/lapaz-logo.png" alt="La Paz Logo" className="w-12 h-12 object-contain bg-white rounded-full p-1" onError={(e) => e.target.style.display = 'none'} />
            <div>
              <h2 className="font-bold text-lg leading-tight">Municipality of La Paz</h2>
              <p className="text-slate-300 text-sm">Agusan del Sur • Philippines</p>
            </div>
          </div>

          <p className="text-blue-400 font-semibold tracking-widest text-xs mb-3 uppercase">Republic of the Philippines</p>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Human Resource Management<br/>Information System
          </h1>
          <p className="text-slate-300 text-lg mb-8 max-w-lg leading-relaxed">
            Serving the Municipality of La Paz, Agusan del Sur — manage personnel records, attendance, leave credits, and terminal benefits under one auditable platform.
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
              <span className="text-sm">Civil Service compliant forms, leave cards, and reports</span>
            </div>
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="w-full md:w-[450px]">
          <div className="bg-slate-100 p-8 md:p-10 rounded-3xl shadow-2xl">
            <div className="flex flex-col items-center mb-8">
              <img src="/lapaz-logo.png" alt="La Paz Logo" className="w-20 h-20 object-contain mb-4" onError={(e) => e.target.style.display = 'none'} />
              <h2 className="text-xl font-bold text-slate-900">HRMIS</h2>
              <p className="text-sm text-slate-500">Municipality of La Paz</p>
            </div>

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Sign in to your account</h3>
              <p className="text-slate-500 text-sm mt-2">Enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Username or Email</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type="text" required placeholder="juan.delacruz"
                    className="w-full pl-10 pr-3 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                    value={identifier} onChange={(e) => setIdentifier(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input
                    type={showPassword ? "text" : "password"} required placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 mt-4">
                Sign in
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
  <span>Trouble signing in? Contact Municipal HR.</span>
  <a
    href="/help"
    className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
  >
    User Manual
  </a>
</div>
          </div>
          
          <div className="text-center mt-8 text-slate-400 text-xs">
            © {new Date().getFullYear()} Municipality of La Paz, Agusan del Sur. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}