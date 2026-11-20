import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Leaves from './pages/Leaves';
import Reports from './pages/Reports';
import OCR from './pages/OCR'

import { Users, LayoutDashboard, LogOut, Clock, CalendarOff, FileText, ScanLine  } from 'lucide-react';

function Layout({ children }) {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col no-print">
        <div className="p-6 text-xl font-bold border-b border-slate-800">HRMIS</div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/employees" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <Users size={20} /> Employees
          </Link>
          <Link to="/attendance" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <Clock size={20} /> Attendance
          </Link>
          <Link to="/leaves" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <CalendarOff size={20} /> Leaves
          </Link>
          <Link to="/reports" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <FileText size={20} /> Reports
          </Link>
          <Link to="/ocr" className="flex items-center gap-3 p-3 rounded hover:bg-slate-800 text-slate-300">
            <ScanLine size={20} /> OCR & TLB
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
          <Route path="/attendance" element={<Layout><Attendance /></Layout>} />
          <Route path="/leaves" element={<Layout><Leaves /></Layout>} />
          <Route path="/reports" element={<Layout><Reports /></Layout>} />
          <Route path="/ocr" element={<Layout><OCR /></Layout>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}