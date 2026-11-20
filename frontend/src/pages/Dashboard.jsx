import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Briefcase,
  UserCheck,
  FileWarning,
  CheckCircle,
  Calendar,
  Clock,
  ArrowRight,
  Building2,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = ['administrator', 'hr_personnel', 'reviewer', 'final_approver'].includes(
    user?.role
  );

  const [stats, setStats] = useState({
    totalEmployees: 0,
    regularCasual: 0,
    jobOrder: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
  });
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [myBalances, setMyBalances] = useState({ vl: 0, sl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        if (isAdmin) {
          const today = new Date().toISOString().split('T')[0];

          // Fetch dashboard stats + employees + leaves + today's attendance in parallel
          const [dashRes, empRes, leavesRes, attRes] = await Promise.allSettled([
            api.get('/reports/dashboard'),
            api.get('/employees'),
            api.get('/leaves'),
            api.get(`/attendance?date=${today}`),
          ]);

          const dashData = dashRes.status === 'fulfilled' ? dashRes.value.data : {};
          const empList =
            empRes.status === 'fulfilled' && Array.isArray(empRes.value.data)
              ? empRes.value.data
              : [];
          const leaveList =
            leavesRes.status === 'fulfilled' && Array.isArray(leavesRes.value.data)
              ? leavesRes.value.data
              : [];
          const attList =
            attRes.status === 'fulfilled' && Array.isArray(attRes.value.data)
              ? attRes.value.data
              : [];

          // Compute Regular/Casual vs Job Order breakdown from employees list (with safe fallbacks)
          const activeEmployees = empList.filter(
            (e) => !e.status || e.status.toLowerCase() === 'active'
          );
          const regularCasualCount = activeEmployees.filter((e) =>
            ['regular', 'casual', 'permanent', 'coterminous'].includes(
              (e.employment_status || '').toLowerCase()
            )
          ).length;
          const jobOrderCount = activeEmployees.filter((e) =>
            ['job order', 'jo', 'contract of service', 'cos'].includes(
              (e.employment_status || '').toLowerCase()
            )
          ).length;

          setStats({
            totalEmployees: dashData.totalEmployees ?? activeEmployees.length,
            regularCasual: dashData.regularCasual ?? regularCasualCount,
            jobOrder: dashData.jobOrder ?? jobOrderCount,
            pendingLeaves:
              dashData.pendingLeaves ??
              leaveList.filter((l) => (l.status || '').toLowerCase() === 'pending').length,
            approvedLeaves:
              dashData.approvedLeaves ??
              leaveList.filter((l) => (l.status || '').toLowerCase() === 'approved').length,
          });

          setRecentLeaves(leaveList.slice(0, 5));
          setTodayAttendance(attList.slice(0, 5));
        } else {
          // Employee Self-Service View
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
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
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
              <Calendar size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Vacation Leave Balance</p>
              <p className="text-3xl font-bold text-slate-900">
                {parseFloat(myBalances.vl || 0).toFixed(2)}{' '}
                <span className="text-lg text-slate-500 font-normal">days</span>
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
            <div className="p-4 bg-emerald-100 text-emerald-600 rounded-full">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Sick Leave Balance</p>
              <p className="text-3xl font-bold text-slate-900">
                {parseFloat(myBalances.sl || 0).toFixed(2)}{' '}
                <span className="text-lg text-slate-500 font-normal">days</span>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-blue-900 mb-1">Need to file a leave?</h3>
            <p className="text-sm text-blue-700">
              You can submit a new leave application directly through the portal.
            </p>
          </div>
          <Link
            to="/leaves"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors self-start sm:self-auto"
          >
            <span>Go to Leave Portal</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // --- ADMIN / HR EXECUTIVE VIEW ---
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Executive Dashboard</h1>
          <p className="text-slate-500 text-sm">
            Municipality of La Paz, Agusan del Sur · Workforce &amp; HR Analytics
          </p>
        </div>
        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-lg shadow-sm self-start sm:self-auto">
          <Building2 size={15} className="text-blue-600" />
          <span>LGU La Paz HRMO</span>
        </div>
      </div>

      {/* Top Row: Workforce Breakdown Cards (Matches Manual Screenshot) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Employees
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.totalEmployees}</p>
            <p className="text-xs text-slate-400 mt-1">Active municipal personnel</p>
          </div>
          <div className="p-3.5 bg-blue-100 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Regular / Casual
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.regularCasual}</p>
            <p className="text-xs text-slate-400 mt-1">Plantilla &amp; casual appointments</p>
          </div>
          <div className="p-3.5 bg-emerald-100 text-emerald-600 rounded-xl">
            <UserCheck size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Job Order (JO)
            </p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">{stats.jobOrder}</p>
            <p className="text-xs text-slate-400 mt-1">Contractual &amp; project-based staff</p>
          </div>
          <div className="p-3.5 bg-indigo-100 text-indigo-600 rounded-xl">
            <Briefcase size={24} />
          </div>
        </div>
      </div>

      {/* Second Row: Leave Status Counters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
              <FileWarning size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Pending Leave Applications</p>
              <p className="text-2xl font-bold text-slate-900">{stats.pendingLeaves}</p>
            </div>
          </div>
          <Link
            to="/leaves"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Review</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
              <CheckCircle size={22} />
            </div>
            <div>
              <p className="text-sm text-slate-500 font-medium">Approved Leaves</p>
              <p className="text-2xl font-bold text-slate-900">{stats.approvedLeaves}</p>
            </div>
          </div>
          <Link
            to="/reports"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <span>Reports</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Bottom Section: Recent Leave Applications & Daily Attendance Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recent Leave Applications &amp; Daily Attendance Summary
            </h2>
            <p className="text-xs text-slate-500">
              Latest leave filings and today&apos;s recorded time logs across municipal offices
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link to="/leaves" className="text-blue-600 hover:underline">
              All Leaves
            </Link>
            <span className="text-slate-300">|</span>
            <Link to="/attendance" className="text-blue-600 hover:underline">
              Attendance Logs
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
          {/* Left Column: Recent Leave Applications */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Recent Leave Applications
            </h3>
            {recentLeaves.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">No leave applications recorded yet.</p>
            ) : (
              <div className="space-y-3">
                {recentLeaves.map((leave, idx) => {
                  const status = (leave.status || 'pending').toLowerCase();
                  const badgeStyle =
                    status === 'approved'
                      ? 'bg-emerald-100 text-emerald-700'
                      : status === 'rejected' || status === 'disapproved'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700';

                  return (
                    <div
                      key={leave.id || idx}
                      className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {leave.employee_name ||
                            `${leave.first_name || ''} ${leave.last_name || ''}`.trim() ||
                            `Employee #${leave.employee_id}`}
                        </p>
                        <p className="text-xs text-slate-500">
                          {leave.leave_type || 'Leave'} · {leave.days_applied || 1} day(s)
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize flex-shrink-0 ${badgeStyle}`}
                      >
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Daily Attendance Summary */}
          <div className="p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Today&apos;s Daily Attendance Summary
            </h3>
            {todayAttendance.length === 0 ? (
              <p className="text-sm text-slate-400 py-4">
                No time-in logs recorded yet for today.
              </p>
            ) : (
              <div className="space-y-3">
                {todayAttendance.map((log, idx) => (
                  <div
                    key={log.id || idx}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                  >
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {log.employee_name ||
                          `${log.first_name || ''} ${log.last_name || ''}`.trim() ||
                          `Employee #${log.employee_id}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        AM In: {log.am_in || '--:--'} · PM Out: {log.pm_out || '--:--'}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                        Number(log.late_minutes || 0) > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {Number(log.late_minutes || 0) > 0
                        ? `${log.late_minutes}m late`
                        : 'On time'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}