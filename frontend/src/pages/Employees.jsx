import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Search, User, X } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [meta, setMeta] = useState({ departments: [], positions: [] });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_no: '', first_name: '', last_name: '', department_id: '', position_id: '', date_hired: '', employment_status: 'regular'
  });

  const fetchData = async () => {
    try {
      const [empRes, metaRes] = await Promise.all([
        api.get('/employees'),
        api.get('/employees/meta')
      ]);
      setEmployees(empRes.data);
      setMeta(metaRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      setIsModalOpen(false);
      setFormData({ employee_no: '', first_name: '', last_name: '', department_id: '', position_id: '', date_hired: '', employment_status: 'regular' });
      fetchData(); // Refresh list
    } catch (err) {
      alert(err.response?.data?.error || 'Error creating employee');
    }
  };

  const filtered = employees.filter(e => 
    `${e.first_name} ${e.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    e.employee_no.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="p-6">Loading directory...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Employee Directory</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          <input 
            type="text" placeholder="Search by name or employee number..." 
            className="w-full outline-none"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-medium">Employee No.</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Department</th>
              <th className="p-4 font-medium">Position</th>
              <th className="p-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(emp => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{emp.employee_no}</td>
                <td className="p-4 text-sm flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User size={16} />
                  </div>
                  {emp.last_name}, {emp.first_name}
                </td>
                <td className="p-4 text-sm text-gray-600">{emp.department_name || 'N/A'}</td>
                <td className="p-4 text-sm text-gray-600">{emp.position_title || 'N/A'}</td>
                <td className="p-4 text-sm">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium uppercase">
                    {emp.employment_status}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan="5" className="p-8 text-center text-gray-500">No employees found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ADD EMPLOYEE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Employee</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Employee No." required className="w-full border p-2 rounded" 
                value={formData.employee_no} onChange={e => setFormData({...formData, employee_no: e.target.value})} />
              <div className="flex gap-2">
                <input type="text" placeholder="First Name" required className="w-full border p-2 rounded" 
                  value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                <input type="text" placeholder="Last Name" required className="w-full border p-2 rounded" 
                  value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
              </div>
              <select className="w-full border p-2 rounded" required value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
                <option value="">Select Department</option>
                {meta.departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <select className="w-full border p-2 rounded" required value={formData.position_id} onChange={e => setFormData({...formData, position_id: e.target.value})}>
                <option value="">Select Position</option>
                {meta.positions.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
              </select>
              <input type="date" required className="w-full border p-2 rounded" 
                value={formData.date_hired} onChange={e => setFormData({...formData, date_hired: e.target.value})} />
              <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Save Employee</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}