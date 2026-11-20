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
import { Users, LayoutDashboard, LogOut, Clock, CalendarOff, FileText, ScanLine } from 'lucide-react';

// 1. Security Guard Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  
  // If the route has allowedRoles and the user's role isn't in it, redirect to dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }
  
  return children;
}

function Layout({ children }) {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;

  // 2. Define which roles can see which links in the sidebar
  const navItems = [
    { path: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['administrator', 'hr_personnel', 'attendance_staff', 'leave_staff', 'gsis_staff', 'reviewer', 'final_approver', 'employee'] },
    { path: '/employees', label: 'Employees', icon: <Users size={20} />, roles: ['administrator', 'hr_personnel', 'reviewer', 'final_approver'] },
    { path: '/attendance', label: 'Attendance', icon: <Clock size={20} />, roles: ['administrator', 'attendance_staff', 'hr_personnel', 'reviewer'] },
    { path: '/leaves', label: 'Leaves', icon: <CalendarOff size={20} />, roles: ['administrator', 'leave_staff', 'reviewer', 'final_approver', 'employee'] },
    { path: '/reports', label: 'Reports', icon: <FileText size={20} />, roles: ['administrator', 'hr_personnel', 'final_approver'] },
    { path: '/ocr', label: 'OCR & TLB', icon: <ScanLine size={20} />, roles: ['administrator', 'hr_personnel'] },
  ];

  // 3. Filter the sidebar links based on the logged-in user's role
  const allowedNavItems = navItems.filter(item => item.roles.includes(user.role));

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl z-20">
        {/* Branding Header */}
        <div className="p-6 flex flex-col items-center border-b border-slate-800 text-center">
          <img src="/lapaz-logo.png" alt="Logo" className="w-14 h-14 mb-3 bg-white rounded-full p-1" onError={(e) => e.target.style.display = 'none'} />
          <h2 className="font-bold text-sm leading-tight text-white">Municipality of La Paz</h2>
          <p className="text-[10px] text-blue-400 mt-1 uppercase tracking-widest font-semibold">HRMIS Portal</p>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {allowedNavItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20 font-semibold' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white font-medium'
                }`
              }
            >
              {item.icon} 
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="px-4 py-2 mb-2 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-bold uppercase">
              {user.role.substring(0, 2)}
            </div>
            <div>
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-medium text-white capitalize truncate">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 w-full text-left transition-colors mt-2"
          >
            <LogOut size={18} /> <span className="font-medium text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-50/50">
        <Toaster position="top-right" toastOptions={{ style: { background: '#333', color: '#fff', borderRadius: '10px' } }} />
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
          
          {/* Universal Routes */}
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
          
          {/* Protected Routes */}
          <Route path="/employees" element={
            <ProtectedRoute allowedRoles={['administrator', 'hr_personnel', 'reviewer', 'final_approver']}>
              <Layout><Employees /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/attendance" element={
            <ProtectedRoute allowedRoles={['administrator', 'attendance_staff', 'hr_personnel', 'reviewer']}>
              <Layout><Attendance /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/leaves" element={
            <ProtectedRoute allowedRoles={['administrator', 'leave_staff', 'reviewer', 'final_approver', 'employee']}>
              <Layout><Leaves /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/reports" element={
            <ProtectedRoute allowedRoles={['administrator', 'hr_personnel', 'final_approver']}>
              <Layout><Reports /></Layout>
            </ProtectedRoute>
          } />

          <Route path="/ocr" element={
            <ProtectedRoute allowedRoles={['administrator', 'hr_personnel']}>
              <Layout><OCR /></Layout>
            </ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}