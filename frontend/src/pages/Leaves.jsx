import { useState, useEffect } from 'react';
import api from '../api';
import { Plus, Check, X, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    leave_type: 'vacation', start_date: '', end_date: '', days: 1, reason: ''
  });

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', formData);
      setIsModalOpen(false);
      setFormData({ leave_type: 'vacation', start_date: '', end_date: '', days: 1, reason: '' });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Error submitting leave');
    }
  };

  const handleAction = async (id, action) => {
    if (!window.confirm(`Are you sure you want to ${action} this leave?`)) return;
    try {
      await api.put(`/leaves/${id}/action`, { action });
      fetchLeaves();
    } catch (err) {
      alert(err.response?.data?.error || 'Action failed');
    }
  };

  const canApprove = ['administrator', 'final_approver'].includes(user?.role);
  const canReview = ['administrator', 'reviewer'].includes(user?.role);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          <Plus size={18} /> File Leave
        </button>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">Type</th>
              <th className="p-4 font-medium">Dates</th>
              <th className="p-4 font-medium">Days</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center">Loading...</td></tr>
            ) : leaves.map(leave => (
              <tr key={leave.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{leave.last_name}, {leave.first_name}</td>
                <td className="p-4 text-sm capitalize">{leave.leave_type.replace('_', ' ')}</td>
                <td className="p-4 text-sm">{new Date(leave.start_date).toLocaleDateString()} to {new Date(leave.end_date).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-bold">{leave.days}</td>
                <td className="p-4 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase
                    ${leave.status === 'approved' ? 'bg-green-100 text-green-700' : 
                      leave.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                      leave.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 
                      'bg-yellow-100 text-yellow-700'}`}>
                    {leave.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-right flex justify-end gap-2">
                  {leave.status === 'pending' && canReview && (
                    <button onClick={() => handleAction(leave.id, 'review')} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded">Review</button>
                  )}
                  {(leave.status === 'pending' || leave.status === 'reviewed') && canApprove && (
                    <>
                      <button onClick={() => handleAction(leave.id, 'approve')} className="text-green-600 hover:bg-green-50 px-2 py-1 rounded flex items-center gap-1"><Check size={16}/> Approve</button>
                      <button onClick={() => handleAction(leave.id, 'reject')} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded flex items-center gap-1"><X size={16}/> Reject</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {leaves.length === 0 && !loading && (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No leave applications found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FILE LEAVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">File Leave Application</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select className="w-full border p-2 rounded" value={formData.leave_type} onChange={e => setFormData({...formData, leave_type: e.target.value})}>
                <option value="vacation">Vacation Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="special_privilege">Special Privilege Leave</option>
              </select>
              <div className="flex gap-2">
                <div className="w-full">
                  <label className="text-xs text-gray-500">Start Date</label>
                  <input type="date" required className="w-full border p-2 rounded" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
                </div>
                <div className="w-full">
                  <label className="text-xs text-gray-500">End Date</label>
                  <input type="date" required className="w-full border p-2 rounded" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500">Number of Days</label>
                <input type="number" step="0.5" required className="w-full border p-2 rounded" value={formData.days} onChange={e => setFormData({...formData, days: parseFloat(e.target.value)})} />
              </div>
              <textarea placeholder="Reason for leave" required className="w-full border p-2 rounded" rows="3" value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})} />
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}