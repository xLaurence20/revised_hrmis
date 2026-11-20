import { useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Users, FileWarning, CheckCircle, Calendar, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = ['administrator', 'hr_personnel', 'reviewer', 'final_approver'].includes(user?.role);
  
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, approvedLeaves: 0 });
  const [myBalances, setMyBalances] = useState({ vl: 0, sl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (isAdmin) {
          // Fetch Admin Stats
          const { data } = await api.get('/reports/dashboard');
          setStats(data);
        } else {
          // Fetch Employee Balances
          const { data } = await api.get('/leaves/my-balances');
          setMyBalances(data);
        }
      } catch (err) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // --- EMPLOYEE PORTAL VIEW ---
  if (!isAdmin) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome back!</h1>
          <p className="text-slate-500">Here is your personal HR summary.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Calendar size={28} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Vacation Leave Balance</p>
              <p className="text-3xl font-bold text-slate-900">{parseFloat(myBalances.vl).toFixed(2)} <span className="text-lg text-slate-500 font-normal">days</span></p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full"><Clock size={28} /></div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Sick Leave Balance</p>
              <p className="text-3xl font-bold text-slate-900">{parseFloat(myBalances.sl).toFixed(2)} <span className="text-lg text-slate-500 font-normal">days</span></p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl">
          <h3 className="font-bold text-blue-900 mb-2">Need to file a leave?</h3>
          <p className="text-sm text-blue-700 mb-4">You can submit a new leave application directly through the portal.</p>
          <a href="/leaves" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Go to Leave Portal
          </a>
        </div>
      </div>
    );
  }

  // --- ADMIN / HR EXECUTIVE VIEW ---
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
        <p className="text-slate-500">Overview of municipal HR analytics and pending tasks.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full"><Users size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Active Employees</p>
            <p className="text-3xl font-bold text-slate-900">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-yellow-100 text-yellow-600 rounded-full"><FileWarning size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Pending Leaves</p>
            <p className="text-3xl font-bold text-slate-900">{stats.pendingLeaves}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Approved Leaves</p>
            <p className="text-3xl font-bold text-slate-900">{stats.approvedLeaves}</p>
          </div>
        </div>
      </div>
    </div>
  );
}