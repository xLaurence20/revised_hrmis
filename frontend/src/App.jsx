import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import OCR from './pages/OCR';
import UserManual from './pages/UserManual';
import {
  Users,
  LayoutDashboard,
  LogOut,
  Clock,
  CalendarOff,
  FileText,
  ScanLine,
  HelpCircle,
} from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { path: '/employees', label: 'Employees', icon: <Users size={20} /> },
    { path: '/attendance', label: 'Attendance', icon: <Clock size={20} /> },
    { path: '/leaves', label: 'Leaves', icon: <CalendarOff size={20} /> },
    { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
    { path: '/ocr', label: 'OCR & TLB', icon: <ScanLine size={20} /> },
    { path: '/help', label: 'Help & User Manual', icon: <HelpCircle size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl z-20 no-print">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800">
          <img
            src="/lapaz-logo.png"
            alt="La Paz Seal"
            className="w-10 h-10 object-contain bg-white rounded-full p-0.5 flex-shrink-0"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="min-w-0">
            <span className="text-lg font-bold tracking-wide block leading-tight">HRMIS</span>
            <span className="text-[11px] text-slate-400 block truncate">
              LGU La Paz • Agusan del Sur
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2 rounded-lg bg-slate-800/60">
            <p className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">
              Active Role
            </p>
            <p className="text-sm font-medium text-slate-200 truncate">{user.role}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-400 hover:text-red-300 w-full text-left transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto print:overflow-visible">
        <Toaster position="top-right" />
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
          {/* Public User Manual accessible from Login page */}
          <Route path="/manual" element={<UserManual />} />

          {/* Authenticated Portal Routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
          <Route path="/leaves" element={<Layout><Leaves /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/ocr" element={<Layout><OCR /></Layout>} />
          <Route path="/help" element={<Layout><UserManual /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}