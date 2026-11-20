import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  BookOpen,
  ShieldCheck,
  Users,
  Clock,
  CalendarOff,
  FileText,
  ScanLine,
  LayoutDashboard,
  CheckCircle2,
  HelpCircle,
  Search,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TOC_LEFT = [
  { id: 'getting-started', num: 1, title: 'Getting started & signing in' },
  { id: 'roles', num: 2, title: 'Roles & what each can do' },
  { id: 'workflow', num: 3, title: 'The HRMIS workflow at a glance' },
  { id: 'step-dashboard', num: 4, title: 'Step 1 · Dashboard & analytics' },
  { id: 'step-employees', num: 5, title: 'Step 2 · Managing 201 employee records' },
  { id: 'step-attendance', num: 6, title: 'Step 3 · Timekeeping & DTR logs' },
];

const TOC_RIGHT = [
  { id: 'step-leaves', num: 7, title: 'Step 4 · Leave filing, credits & ledger' },
  { id: 'step-reports', num: 8, title: 'Step 5 · Reports, CS Form 48 & COE' },
  { id: 'step-ocr', num: 9, title: 'Step 6 · OCR document parsing & TLB' },
  { id: 'audit-security', num: 10, title: 'Audit trail & security' },
  { id: 'troubleshooting', num: 11, title: 'Troubleshooting & FAQ' },
];

/* Reusable Annotated Screenshot Frame with Highlighted Callout Pins */
function AnnotatedScreen({ title, url, children, callouts }) {
  return (
    <div className="my-5 rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden break-inside-avoid">
      {/* Browser Top Chrome */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-medium text-slate-600">{title}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-white px-2.5 py-0.5 rounded border border-slate-200">
          {url}
        </span>
      </div>

      {/* Simulated Screen Canvas */}
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">{children}</div>

      {/* Highlighted Callout Legend */}
      <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {callouts.map((c) => (
          <div key={c.num} className="flex items-start gap-2.5 text-sm">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              {c.num}
            </span>
            <p className="text-slate-700 leading-snug">
              <strong className="text-slate-900">{c.label}:</strong> {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pin({ num, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[11px] ring-2 ring-white shadow ${className}`}
    >
      {num}
    </span>
  );
}

export default function UserManual() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handlePrintPDF = () => {
    window.print();
  };

  const allSections = [...TOC_LEFT, ...TOC_RIGHT];
  const filteredTOC = searchQuery.trim()
    ? allSections.filter((s) => s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-slate-800 pb-16">
      {/* Top Action Bar (Hidden when printing PDF) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <Link
            to={user ? '/' : '/login'}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-emerald-800 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{user ? 'Back to HRMIS Dashboard' : 'Back to Sign In'}</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="relative hidden sm:block">
              <Search size={15} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter manual topics..."
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-800 bg-white text-emerald-900 font-semibold text-sm hover:bg-emerald-800 hover:text-white transition-colors shadow-sm"
            >
              <Printer size={16} />
              <span>Print / Save PDF Manual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Container */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Document Header (Matches Reference Screenshot Style) */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              LGU La Paz HRMIS — User Manual
            </h1>
            <p className="text-slate-600 text-sm sm:text-base mt-1">
              Human Resource Management Information System · Municipality of La Paz, Agusan del Sur
            </p>
          </div>

          <button
            onClick={handlePrintPDF}
            className="no-print self-start sm:self-auto px-5 py-2 rounded-full border border-emerald-800 text-emerald-900 font-semibold text-sm hover:bg-emerald-50 transition-colors"
          >
            Print manual
          </button>
        </header>

        {/* Table of Contents Card (2-Column Layout matching image_30801d.png) */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-emerald-900">Contents</h2>
            <span className="text-xs text-slate-400">Version 1.0 · Official Operations Guide</span>
          </div>

          {filteredTOC ? (
            <div className="space-y-2">
              {filteredTOC.length === 0 ? (
                <p className="text-sm text-slate-500">No sections match "{searchQuery}".</p>
              ) : (
                filteredTOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-emerald-800 hover:underline font-medium"
                  >
                    {item.num}. {item.title}
                  </a>
                ))
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2.5 text-[15px]">
              <ol className="space-y-2.5">
                {TOC_LEFT.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-2">
                    <span className="text-slate-500 w-5 text-right font-medium">{item.num}.</span>
                    <a
                      href={`#${item.id}`}
                      className="text-emerald-800 hover:text-emerald-950 hover:underline font-medium"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>

              <ol className="space-y-2.5">
                {TOC_RIGHT.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-2">
                    <span className="text-slate-500 w-6 text-right font-medium">{item.num}.</span>
                    <a
                      href={`#${item.id}`}
                      className="text-emerald-800 hover:text-emerald-950 hover:underline font-medium"
                    >
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* ================= CHAPTERS ================= */}
        <div className="space-y-8">
          {/* 1. GETTING STARTED */}
          <section
            id="getting-started"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              1. Getting started & signing in
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              The LGU La Paz HRMIS is a web-based platform accessible from any modern desktop or
              mobile browser. Only authorized municipal personnel with credentials issued by the
              Human Resource Management Office (HRMO) or IT Administrator may sign in.
            </p>

            <AnnotatedScreen
              title="HRMIS Portal — Login Screen"
              url="https://hrmis-lapaz.vercel.app/login"
              callouts={[
                {
                  num: 1,
                  label: 'Username or Email Field',
                  desc: 'Enter your assigned municipal username (e.g., admin) or official email.',
                },
                {
                  num: 2,
                  label: 'Password & Visibility Toggle',
                  desc: 'Type your password and click the eye icon to verify characters before submitting.',
                },
                {
                  num: 3,
                  label: 'Sign In Button',
                  desc: 'Authenticates your session and redirects you to your role-specific dashboard.',
                },
                {
                  num: 4,
                  label: 'User Manual Link',
                  desc: 'Opens this complete digital manual and printable PDF guide at any time.',
                },
              ]}
            >
              <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
                <div className="text-xs font-bold text-blue-600 uppercase">
                  Authorized Personnel Only
                </div>
                <div className="text-base font-bold text-slate-900">Sign in to HRMIS</div>
                <div className="relative border border-amber-400 bg-amber-50/40 rounded-lg px-3 py-2 text-xs text-slate-600 flex justify-between items-center">
                  <span>Username or Email (e.g., hrmo_staff)</span>
                  <Pin num={1} />
                </div>
                <div className="relative border border-amber-400 bg-amber-50/40 rounded-lg px-3 py-2 text-xs text-slate-600 flex justify-between items-center">
                  <span>••••••••••••</span>
                  <Pin num={2} />
                </div>
                <div className="relative bg-blue-600 text-white rounded-lg py-2 text-center text-xs font-semibold flex items-center justify-center gap-2">
                  <span>Sign In</span>
                  <Pin num={3} />
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                  <span>Need help navigating the system? Read User Manual</span>
                  <Pin num={4} />
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 2. ROLES & PERMISSIONS */}
          <section
            id="roles"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-3">
              2. Roles & what each can do
            </h2>
            <p className="text-slate-600 text-sm mb-4">
              Every user account is assigned a strict role to protect employee privacy and enforce
              Civil Service Commission (CSC) approval workflows:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-left">
                  <tr>
                    <th className="p-3 border-b">Role</th>
                    <th className="p-3 border-b">Primary Responsibilities & Access Scope</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Super Admin / HRMO Head</td>
                    <td className="p-3 text-slate-600">
                      Full access to all 201 employee files, leave approvals, DTR adjustments,
                      Terminal Leave Benefit (TLB) computation, user management, and audit logs.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">HR Staff / Encoder</td>
                    <td className="p-3 text-slate-600">
                      Encodes new employees, uploads OCR scanned documents, imports biometric logs,
                      and generates CS Form 48 & COE printouts.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Department Head</td>
                    <td className="p-3 text-slate-600">
                      Reviews and recommends leave applications and attendance logs for personnel
                      assigned to their specific municipal office.
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-900">Employee (Self-Service)</td>
                    <td className="p-3 text-slate-600">
                      Views personal profile, checks daily DTR logs, monitors VL/SL credit balances,
                      and files online leave requests.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. WORKFLOW AT A GLANCE */}
          <section
            id="workflow"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-3">
              3. The HRMIS workflow at a glance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              {[
                {
                  step: 'Phase 1 · Onboarding',
                  desc: 'Register employee 201 profile or scan Personal Data Sheet via OCR.',
                },
                {
                  step: 'Phase 2 · Daily Operations',
                  desc: 'Record biometric/manual time-in & out; process VL/SL leave filings.',
                },
                {
                  step: 'Phase 3 · Compliance & Exit',
                  desc: 'Print CS Form 48 DTRs, issue COEs, and compute Terminal Leave Benefits.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200"
                >
                  <div className="font-bold text-emerald-900 mb-1">{item.step}</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. STEP 1: DASHBOARD */}
          <section
            id="step-dashboard"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              4. Step 1 · Dashboard & analytics
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Upon signing in, the Dashboard summarizes real-time workforce headcount across
              Regular, Casual, and Job Order (JO) appointments alongside pending leave requests.
            </p>

            <AnnotatedScreen
              title="HRMIS — Executive Dashboard"
              url="https://hrmis-lapaz.vercel.app/"
              callouts={[
                {
                  num: 1,
                  label: 'Navigation Sidebar',
                  desc: 'Switch between Dashboard, Employees, Attendance, Leaves, Reports, OCR & TLB, and Help Manual.',
                },
                {
                  num: 2,
                  label: 'Employment Status KPI Cards',
                  desc: 'Displays live counts of Active Personnel, Regular, Job Order, and Casual employees.',
                },
                {
                  num: 3,
                  label: 'Pending Leave Queue',
                  desc: 'Highlights newly submitted leave requests waiting for HR or Department Head action.',
                },
              ]}
            >
              <div className="grid grid-cols-12 gap-3 text-xs">
                <div className="col-span-3 bg-slate-900 text-white p-3 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-blue-400">
                    <span>HRMIS Menu</span>
                    <Pin num={1} />
                  </div>
                  <div className="bg-blue-600 px-2 py-1 rounded">Dashboard</div>
                  <div className="text-slate-400 px-2 py-0.5">Employees</div>
                  <div className="text-slate-400 px-2 py-0.5">Attendance</div>
                  <div className="text-slate-400 px-2 py-0.5">Leaves</div>
                </div>
                <div className="col-span-9 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-400 flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-[10px]">TOTAL EMPLOYEES</div>
                        <div className="text-lg font-bold text-slate-900">881</div>
                      </div>
                      <Pin num={2} />
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[10px]">REGULAR / CASUAL</div>
                      <div className="text-lg font-bold text-slate-900">381</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                      <div className="text-slate-400 text-[10px]">JOB ORDER (JO)</div>
                      <div className="text-lg font-bold text-slate-900">500</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-400 flex items-center justify-between">
                    <span className="font-medium text-slate-700">
                      Recent Leave Applications & Daily Attendance Summary
                    </span>
                    <Pin num={3} />
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 5. STEP 2: EMPLOYEES */}
          <section
            id="step-employees"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              5. Step 2 · Managing 201 employee records
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Open <strong>Employees</strong> from the sidebar to add new municipal personnel,
              search by name or Employee ID, filter by department, or update salary grades and
              employment status.
            </p>

            <AnnotatedScreen
              title="HRMIS — 201 Employee Directory"
              url="https://hrmis-lapaz.vercel.app/employees"
              callouts={[
                {
                  num: 1,
                  label: '+ Add Employee Button',
                  desc: 'Opens the registration modal for Employee ID, Personal Info, Department, Position, Salary Grade, and Daily Rate.',
                },
                {
                  num: 2,
                  label: 'Search & Department Filter',
                  desc: 'Instantly locate staff by full name, ID number, or assigned municipal office.',
                },
                {
                  num: 3,
                  label: 'Edit / Archive Actions',
                  desc: 'Update promotion details, step increments, or employment status with automatic audit logging.',
                },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2.5 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 border border-amber-400 bg-amber-50/40 rounded px-2.5 py-1.5 flex-1">
                    <span className="text-slate-500">Search name, ID, or office...</span>
                    <Pin num={2} />
                  </div>
                  <div className="bg-blue-600 text-white px-3 py-1.5 rounded font-semibold flex items-center gap-1.5">
                    <span>+ Add Employee</span>
                    <Pin num={1} />
                  </div>
                </div>
                <div className="border border-slate-200 rounded p-2 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">EMP-2026-001</span> · Juan Dela Cruz
                    (Administrative Officer IV — HRMO)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium">
                      Regular
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded border">
                      Edit
                    </span>
                    <Pin num={3} />
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 6. STEP 3: ATTENDANCE */}
          <section
            id="step-attendance"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              6. Step 3 · Timekeeping & DTR logs
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              The <strong>Attendance</strong> module records morning and afternoon time-in/time-out
              entries and automatically flags tardiness and undertime minutes for payroll and DTR
              generation.
            </p>

            <AnnotatedScreen
              title="HRMIS — Daily Time Record & Attendance"
              url="https://hrmis-lapaz.vercel.app/attendance"
              callouts={[
                {
                  num: 1,
                  label: 'Quick Time-In / Time-Out Logger',
                  desc: 'Select an employee and log AM Arrival, AM Departure, PM Arrival, or PM Departure.',
                },
                {
                  num: 2,
                  label: 'Date & Cutoff Filter',
                  desc: 'Filter attendance logs by 1st cutoff (1–15) or 2nd cutoff (16–31) of any month.',
                },
                {
                  num: 3,
                  label: 'Late & Undertime Auto-Calculation',
                  desc: 'Automatically computes late minutes against the standard 8:00 AM – 5:00 PM schedule.',
                },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-600 text-white rounded font-semibold">
                      Log Attendance
                    </span>
                    <Pin num={1} />
                  </div>
                  <div className="flex items-center gap-2 border border-amber-400 px-2.5 py-1 rounded">
                    <span>Month: November 2026</span>
                    <Pin num={2} />
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-700 pt-1">
                  <span>Nov 20, 2026 · AM In: 07:55 AM · PM Out: 05:02 PM</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-700 font-semibold">0 mins late</span>
                    <Pin num={3} />
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 7. STEP 4: LEAVES */}
          <section
            id="step-leaves"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              7. Step 4 · Leave filing, credits & ledger
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Manage Vacation Leave (VL), Sick Leave (SL), Special Privilege Leave (SPL), and
              Forced Leave under CSC Omnibus Rules on Leave. Approving a leave automatically
              deducts the days from the employee&apos;s leave ledger.
            </p>

            <AnnotatedScreen
              title="HRMIS — Leave Applications & Credit Ledger"
              url="https://hrmis-lapaz.vercel.app/leaves"
              callouts={[
                {
                  num: 1,
                  label: 'File Leave Request Form',
                  desc: 'Select employee, leave type (VL, SL, SPL, Maternity/Paternity), inclusive dates, and reason.',
                },
                {
                  num: 2,
                  label: 'Approve / Disapprove Buttons',
                  desc: 'Authorized approvers can approve or reject pending requests with one click.',
                },
                {
                  num: 3,
                  label: 'Monthly Credit Accrual (+1.25 VL / +1.25 SL)',
                  desc: 'Posts monthly earned leave credits for regular employees and updates running balances.',
                },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800">
                    Leave Filing & Earned Credit Ledger
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-blue-600 text-white rounded font-medium">
                      + File Leave
                    </span>
                    <Pin num={1} />
                    <span className="px-2.5 py-1 bg-slate-800 text-white rounded font-medium">
                      Run Monthly Accrual
                    </span>
                    <Pin num={3} />
                  </div>
                </div>
                <div className="p-2 rounded bg-slate-50 border flex items-center justify-between">
                  <span>Maria Santos · Sick Leave (2.0 days) · Status: Pending</span>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded">Approve</span>
                    <span className="px-2 py-0.5 bg-red-600 text-white rounded">Reject</span>
                    <Pin num={2} />
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 8. STEP 5: REPORTS */}
          <section
            id="step-reports"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              8. Step 5 · Reports, CS Form 48 & COE
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Generate official Civil Service compliant printouts directly from the{' '}
              <strong>Reports</strong> module without external word processors.
            </p>

            <AnnotatedScreen
              title="HRMIS — Official Reports & Print Generator"
              url="https://hrmis-lapaz.vercel.app/reports"
              callouts={[
                {
                  num: 1,
                  label: 'CS Form No. 48 (Daily Time Record)',
                  desc: 'Generates the official CSC DTR format complete with morning/afternoon logs and signatory lines.',
                },
                {
                  num: 2,
                  label: 'Certificate of Employment (COE)',
                  desc: 'Auto-populates employee position, appointment status, date hired, and compensation.',
                },
                {
                  num: 3,
                  label: 'Print Document Trigger',
                  desc: 'Hides navigation sidebars automatically so only the clean official form prints.',
                },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded bg-slate-100 border font-medium">
                    CS Form No. 48 (DTR)
                  </span>
                  <Pin num={1} />
                  <span className="px-2.5 py-1 rounded bg-slate-100 border font-medium">
                    Certificate of Employment
                  </span>
                  <Pin num={2} />
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-700 text-white px-3 py-1 rounded font-semibold">
                  <span>Print Official Copy</span>
                  <Pin num={3} />
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 9. STEP 6: OCR & TLB */}
          <section
            id="step-ocr"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              9. Step 6 · OCR document parsing & TLB
            </h2>
            <p className="text-slate-600 text-sm mb-3">
              Use the <strong>OCR &amp; TLB</strong> module to digitize scanned Personal Data Sheets
              (PDS), Service Records, or Certificates, and to compute Terminal Leave Benefits (TLB)
              using the standard CSC constant factor (<code>0.0481927</code>).
            </p>

            <AnnotatedScreen
              title="HRMIS — OCR Scanner & Terminal Leave Benefit Calculator"
              url="https://hrmis-lapaz.vercel.app/ocr"
              callouts={[
                {
                  num: 1,
                  label: 'Document Upload Dropzone',
                  desc: 'Upload JPG, PNG, or scanned service records to extract structured text automatically.',
                },
                {
                  num: 2,
                  label: 'Extracted Text & Autofill Preview',
                  desc: 'Review parsed employee details and save directly into the 201 repository.',
                },
                {
                  num: 3,
                  label: 'Terminal Leave Benefit (TLB) Calculator',
                  desc: 'Multiplies Highest Monthly Salary × Total Accumulated Leave Credits × 0.0481927.',
                },
              ]}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3 rounded-lg border border-amber-400 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>OCR Document Upload</span>
                    <Pin num={1} />
                  </div>
                  <div className="p-2 border border-dashed rounded text-center text-slate-500">
                    Drop scanned PDS / Service Record here
                  </div>
                  <div className="flex items-center justify-between text-slate-600 pt-1">
                    <span>Extracted Text Output</span>
                    <Pin num={2} />
                  </div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-amber-400 space-y-1.5">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span>CSC Terminal Leave Benefit</span>
                    <Pin num={3} />
                  </div>
                  <div className="text-slate-600">
                    Formula: <code className="text-emerald-800">Salary × (VL + SL) × 0.0481927</code>
                  </div>
                  <div className="p-2 bg-emerald-50 rounded font-semibold text-emerald-900">
                    Computed Monetized Value: ₱ 0.00
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 10. AUDIT TRAIL & SECURITY */}
          <section
            id="audit-security"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-2">
              10. Audit trail & security
            </h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
              <li>
                <strong>Immutable Audit Logs:</strong> Every login, employee record creation,
                salary modification, leave approval, and DTR adjustment records the acting user ID,
                timestamp, and action description.
              </li>
              <li>
                <strong>Encrypted Sessions:</strong> Passwords are hashed using bcrypt and user
                sessions are protected via signed JWT tokens.
              </li>
              <li>
                <strong>Best Practice:</strong> Always click <strong>Logout</strong> in the bottom
                left sidebar when using shared municipal workstations.
              </li>
            </ul>
          </section>

          {/* 11. TROUBLESHOOTING & FAQ */}
          <section
            id="troubleshooting"
            className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-20"
          >
            <h2 className="text-xl font-bold text-emerald-900 mb-3">
              11. Troubleshooting & FAQ
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <h3 className="font-bold text-slate-900">
                  The first login takes 15–20 seconds after inactivity. Why?
                </h3>
                <p className="text-slate-600">
                  When hosted on free cloud tiers, the backend server wakes up from idle sleep on
                  the first request. Once awake, all subsequent clicks respond immediately.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  How do I download a PDF copy of this manual?
                </h3>
                <p className="text-slate-600">
                  Click the <strong>Print / Save PDF Manual</strong> button at the top right of
                  this page, choose <strong>Save as PDF</strong> as the destination printer, and
                  click Save.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  I forgot my password or my account is locked.
                </h3>
                <p className="text-slate-600">
                  Contact the LGU La Paz HRMO System Administrator to reset your credentials.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}