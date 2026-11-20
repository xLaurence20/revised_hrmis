import { useState, useEffect } from 'react';
import api from '../api';
import {
  Plus,
  Check,
  X,
  CalendarPlus,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accruing, setAccruing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    days: 1,
    reason: '',
  });

  const canApprove = ['administrator', 'final_approver'].includes(user?.role);
  const canReview = ['administrator', 'reviewer'].includes(user?.role);
  const canAccrue = ['administrator', 'hr_personnel'].includes(user?.role);

  const fetchLeaves = async () => {
    try {
      const { data } = await api.get('/leaves');
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error('Failed to load leave applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Submitting leave application...');
    try {
      await api.post('/leaves', formData);
      toast.success('Leave application submitted!', { id: loadingToast });
      setIsModalOpen(false);
      setFormData({
        leave_type: 'vacation',
        start_date: '',
        end_date: '',
        days: 1,
        reason: '',
      });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error submitting leave', { id: loadingToast });
    }
  };

  const handleAction = async (id, action) => {
    const label =
      action === 'approve' ? 'Approve' : action === 'reject' ? 'Reject' : 'Mark as Reviewed';
    if (!window.confirm(`${label} this leave application?`)) return;

    const loadingToast = toast.loading(`Processing ${action}...`);
    try {
      await api.put(`/leaves/${id}/action`, { action });
      toast.success(`Leave application ${action}d!`, { id: loadingToast });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Action failed', { id: loadingToast });
    }
  };

  const handleRunMonthlyAccrual = async () => {
    if (
      !window.confirm(
        'Run monthly earned leave accrual (+1.25 VL and +1.25 SL) for all eligible regular employees?'
      )
    ) {
      return;
    }

    setAccruing(true);
    const loadingToast = toast.loading('Posting monthly leave credits...');
    try {
      const { data } = await api.post('/leaves/accrue');
      toast.success(data?.message || 'Monthly +1.25 VL / +1.25 SL accrual completed!', {
        id: loadingToast,
      });
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to run monthly accrual', {
        id: loadingToast,
      });
    } finally {
      setAccruing(false);
    }
  };

  const filteredLeaves = leaves.filter((leave) => {
    const matchesStatus = statusFilter === 'all' || leave.status === statusFilter;
    const fullName = `${leave.first_name || ''} ${leave.last_name || ''}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      (leave.leave_type || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const pendingCount = leaves.filter((l) => l.status === 'pending').length;
  const reviewedCount = leaves.filter((l) => l.status === 'reviewed').length;
  const approvedCount = leaves.filter((l) => l.status === 'approved').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header matching Manual Screenshot */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Leave Filing &amp; Earned Credit Ledger
          </h1>
          <p className="text-slate-500 text-sm">
            Manage leave applications, CSC review/approval workflow, and monthly VL/SL credit
            accruals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            <span>File Leave</span>
          </button>

          {canAccrue && (
            <button
              onClick={handleRunMonthlyAccrual}
              disabled={accruing}
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors shadow-sm"
            >
              <CalendarPlus size={18} />
              <span>{accruing ? 'Posting...' : 'Run Monthly Accrual'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary Pills & Filter Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { key: 'all', label: `All (${leaves.length})` },
            { key: 'pending', label: `Pending (${pendingCount})` },
            { key: 'reviewed', label: `Reviewed (${reviewedCount})` },
            { key: 'approved', label: `Approved (${approvedCount})` },
            { key: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === tab.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee or leave type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Leaves Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">Employee</th>
              <th className="p-4 font-semibold">Leave Type</th>
              <th className="p-4 font-semibold">Inclusive Dates</th>
              <th className="p-4 font-semibold">Days</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  Loading leave applications...
                </td>
              </tr>
            ) : filteredLeaves.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500">
                  No leave applications found.
                </td>
              </tr>
            ) : (
              filteredLeaves.map((leave) => (
                <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-900">
                    {leave.last_name}, {leave.first_name}
                    {leave.reason && (
                      <p className="text-xs font-normal text-slate-500 truncate max-w-xs">
                        {leave.reason}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-sm capitalize text-slate-700">
                    {(leave.leave_type || '').replace('_', ' ')}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {new Date(leave.start_date).toLocaleDateString()} –{' '}
                    {new Date(leave.end_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-sm font-bold text-slate-900">
                    {parseFloat(leave.days).toFixed(1)}
                  </td>
                  <td className="p-4 text-sm">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                        leave.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700'
                          : leave.status === 'rejected'
                          ? 'bg-red-100 text-red-700'
                          : leave.status === 'reviewed'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {leave.status === 'approved' && <CheckCircle2 size={12} />}
                      {leave.status === 'rejected' && <XCircle size={12} />}
                      {leave.status === 'pending' && <Clock size={12} />}
                      {leave.status === 'reviewed' && <Eye size={12} />}
                      {leave.status}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      {leave.status === 'pending' && canReview && (
                        <button
                          onClick={() => handleAction(leave.id, 'review')}
                          className="px-3 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium text-xs transition-colors"
                        >
                          Review
                        </button>
                      )}
                      {(leave.status === 'pending' || leave.status === 'reviewed') &&
                        canApprove && (
                          <>
                            <button
                              onClick={() => handleAction(leave.id, 'approve')}
                              className="px-3 py-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <Check size={14} /> Approve
                            </button>
                            <button
                              onClick={() => handleAction(leave.id, 'reject')}
                              className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700 font-medium text-xs inline-flex items-center gap-1 transition-colors"
                            >
                              <X size={14} /> Reject
                            </button>
                          </>
                        )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FILE LEAVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">File Leave Application</h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Leave Type
                </label>
                <select
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.leave_type}
                  onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                >
                  <option value="vacation">Vacation Leave (VL)</option>
                  <option value="sick">Sick Leave (SL)</option>
                  <option value="special_privilege">Special Privilege Leave (SPL)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Number of Days
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.days}
                  onChange={(e) =>
                    setFormData({ ...formData, days: parseFloat(e.target.value) || 0.5 })
                  }
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">
                  Reason / Purpose
                </label>
                <textarea
                  placeholder="Enter reason for leave..."
                  required
                  className="w-full border border-slate-300 p-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}