import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import { Users, LayoutDashboard, LogOut } from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold border-b border-slate-800">HRMIS</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/employees" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <Users size={20} /> Employees
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={logout} className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-red-400 w-full text-left">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}