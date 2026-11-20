import { useState, useEffect } from 'react';
import api from '../api';
import { Users, FileWarning, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ totalEmployees: 0, pendingLeaves: 0, approvedLeaves: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/dashboard')
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Executive Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500 flex items-center gap-4">
          <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total Active Employees</p>
            <p className="text-3xl font-bold">{stats.totalEmployees}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500 flex items-center gap-4">
          <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><FileWarning size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Pending Leaves</p>
            <p className="text-3xl font-bold">{stats.pendingLeaves}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500 flex items-center gap-4">
          <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle size={24} /></div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Approved Leaves</p>
            <p className="text-3xl font-bold">{stats.approvedLeaves}</p>
          </div>
        </div>
      </div>
    </div>
  );
}