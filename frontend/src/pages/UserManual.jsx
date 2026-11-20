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
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  Download,
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
  { id: 'audit-security', num: 10, title: 'Audit trail & security policies' },
  { id: 'troubleshooting', num: 11, title: 'Troubleshooting & FAQ' },
];

/* ================= REUSABLE UI COMPONENTS ================= */

function Pin({ num, className = '' }) {
  return (
    <span
      className={`inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white font-bold text-[11px] ring-2 ring-white shadow-sm z-10 ${className}`}
    >
      {num}
    </span>
  );
}

function Step({ num, title, children }) {
  return (
    <div className="flex gap-4 mb-5">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border border-emerald-200 shadow-sm">
        {num}
      </div>
      <div className="flex-1 pt-1">
        <h4 className="font-bold text-slate-900 text-sm mb-1.5">{title}</h4>
        <div className="text-sm text-slate-600 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  );
}

function ProTip({ children }) {
  return (
    <div className="my-5 p-4 rounded-xl bg-blue-50/80 border border-blue-200 flex gap-3">
      <div className="text-blue-600 mt-0.5 flex-shrink-0"><Lightbulb size={18} /></div>
      <div>
        <div className="font-bold text-blue-900 text-sm mb-1">Pro Tip</div>
        <div className="text-sm text-blue-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function Warning({ children }) {
  return (
    <div className="my-5 p-4 rounded-xl bg-amber-50/80 border border-amber-200 flex gap-3">
      <div className="text-amber-600 mt-0.5 flex-shrink-0"><AlertTriangle size={18} /></div>
      <div>
        <div className="font-bold text-amber-900 text-sm mb-1">Important Notice</div>
        <div className="text-sm text-amber-800 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

function AnnotatedScreen({ title, url, children, callouts }) {
  return (
    <div className="my-6 rounded-xl border border-slate-300 bg-white shadow-sm overflow-hidden break-inside-avoid">
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs font-semibold text-slate-600">{title}</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 bg-white px-2.5 py-1 rounded border border-slate-200 shadow-sm">
          {url}
        </span>
      </div>
      <div className="p-4 bg-slate-50/70 border-b border-slate-200">{children}</div>
      <div className="p-4 bg-white grid grid-cols-1 md:grid-cols-2 gap-3">
        {callouts.map((c) => (
          <div key={c.num} className="flex items-start gap-3 text-sm">
            <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
              {c.num}
            </span>
            <p className="text-slate-700 leading-snug">
              <strong className="text-slate-900 block text-xs uppercase tracking-wide mb-0.5">{c.label}</strong> 
              {c.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */

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
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .shadow-sm { box-shadow: none !important; }
          .border { border: 1px solid #cbd5e1 !important; }
          .break-inside-avoid { break-inside: avoid; page-break-inside: avoid; }
          a { text-decoration: none !important; color: #064e3b !important; }
          .max-w-5xl { max-width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      {/* Top Action Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 no-print shadow-sm">
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
                className="pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-full bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 w-64 transition-all"
              />
            </div>

            <button
              onClick={handlePrintPDF}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-emerald-800 bg-white text-emerald-900 font-semibold text-sm hover:bg-emerald-800 hover:text-white transition-colors shadow-sm"
            >
              <Printer size={16} />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Document Container */}
      <div className="max-w-5xl mx-auto px-6 pt-8">
        {/* Document Header */}
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

        {/* Document Control Block */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs no-print">
          <div>
            <div className="text-slate-500 font-medium uppercase tracking-wider mb-1">Document Owner</div>
            <div className="font-semibold text-slate-900">HRMO, LGU La Paz</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium uppercase tracking-wider mb-1">Effective Date</div>
            <div className="font-semibold text-slate-900">November 20, 2026</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium uppercase tracking-wider mb-1">Version</div>
            <div className="font-semibold text-slate-900">2.0 (Super Detailed)</div>
          </div>
          <div>
            <div className="text-slate-500 font-medium uppercase tracking-wider mb-1">Classification</div>
            <div className="font-semibold text-slate-900">Internal Use Only</div>
          </div>
        </div>

        {/* Table of Contents Card */}
        <section className="bg-white rounded-2xl border border-slate-200/90 p-6 sm:p-8 shadow-sm mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-emerald-900 flex items-center gap-2">
              <BookOpen size={18} /> Table of Contents
            </h2>
            <span className="text-xs text-slate-400 font-medium">Official Operations Guide</span>
          </div>

          {filteredTOC ? (
            <div className="space-y-2">
              {filteredTOC.length === 0 ? (
                <p className="text-sm text-slate-500 italic">No sections match "{searchQuery}".</p>
              ) : (
                filteredTOC.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="block text-sm text-emerald-800 hover:bg-emerald-50 px-2 py-1.5 rounded-md hover:underline font-medium transition-colors"
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
                  <li key={item.id} className="flex items-baseline gap-2 group">
                    <span className="text-slate-400 w-6 text-right font-bold group-hover:text-emerald-600 transition-colors">{item.num}.</span>
                    <a href={`#${item.id}`} className="text-slate-700 group-hover:text-emerald-800 group-hover:underline font-medium transition-colors">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
              <ol className="space-y-2.5">
                {TOC_RIGHT.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-2 group">
                    <span className="text-slate-400 w-6 text-right font-bold group-hover:text-emerald-600 transition-colors">{item.num}.</span>
                    <a href={`#${item.id}`} className="text-slate-700 group-hover:text-emerald-800 group-hover:underline font-medium transition-colors">
                      {item.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* ================= CHAPTERS ================= */}
        <div className="space-y-10">
          
          {/* 1. GETTING STARTED */}
          <section id="getting-started" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">1</span>
              Getting started & signing in
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mb-6">
              The LGU La Paz HRMIS is a secure, web-based platform accessible from any modern desktop or mobile browser. Only authorized municipal personnel with credentials issued by the Human Resource Management Office (HRMO) or IT Administrator may sign in.
            </p>

            <div className="mb-6">
              <Step num="1" title="Access the Portal">
                Open your preferred web browser (Chrome, Edge, or Firefox recommended) and navigate to the official HRMIS login URL provided by your IT department.
              </Step>
              <Step num="2" title="Enter Credentials">
                Input your assigned municipal username (usually your official email or employee ID) and your temporary or permanent password. Use the "eye" icon to verify your password characters before submitting.
              </Step>
              <Step num="3" title="Authentication & Redirect">
                Click the <strong>Sign In</strong> button. The system will validate your credentials and automatically redirect you to the dashboard tailored to your specific user role.
              </Step>
            </div>

            <Warning>
              For security compliance, <strong>never share your password</strong> with colleagues. Always click <strong>Logout</strong> in the bottom-left sidebar when stepping away from shared municipal workstations.
            </Warning>

            <AnnotatedScreen
              title="HRMIS Portal — Login Screen"
              url="https://hrmis-lapaz.vercel.app/login"
              callouts={[
                { num: 1, label: 'Username or Email Field', desc: 'Enter your assigned municipal username (e.g., admin) or official email address.' },
                { num: 2, label: 'Password & Visibility Toggle', desc: 'Type your password and click the eye icon to verify characters before submitting.' },
                { num: 3, label: 'Sign In Button', desc: 'Authenticates your session securely and redirects you to your role-specific dashboard.' },
                { num: 4, label: 'User Manual Link', desc: 'Opens this complete digital manual and printable PDF guide at any time.' },
              ]}
            >
              <div className="max-w-md mx-auto bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="text-center space-y-1 mb-4">
                  <div className="text-xs font-bold text-blue-600 uppercase tracking-widest">Authorized Personnel Only</div>
                  <div className="text-lg font-bold text-slate-900">Sign in to HRMIS</div>
                </div>
                <div className="relative border border-amber-400 bg-amber-50/40 rounded-lg px-3 py-2.5 text-xs text-slate-600 flex justify-between items-center">
                  <span>Username or Email (e.g., hrmo_staff)</span>
                  <Pin num={1} />
                </div>
                <div className="relative border border-amber-400 bg-amber-50/40 rounded-lg px-3 py-2.5 text-xs text-slate-600 flex justify-between items-center">
                  <span>••••••••••••</span>
                  <Pin num={2} />
                </div>
                <div className="relative bg-blue-600 text-white rounded-lg py-2.5 text-center text-xs font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 cursor-pointer transition-colors">
                  <span>Sign In</span>
                  <Pin num={3} />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-emerald-800 font-medium">
                  <span>Need help navigating? Read User Manual</span>
                  <Pin num={4} />
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 2. ROLES & PERMISSIONS */}
          <section id="roles" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">2</span>
              Roles & what each can do
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Every user account is assigned a strict role to protect employee privacy, maintain data integrity, and enforce Civil Service Commission (CSC) approval workflows.
            </p>
            
            <div className="overflow-x-auto mb-6">
              <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 text-left">
                  <tr>
                    <th className="p-3 border-b font-semibold">Role</th>
                    <th className="p-3 border-b font-semibold">Access Scope</th>
                    <th className="p-3 border-b font-semibold">Key Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Super Admin / HRMO Head</td>
                    <td className="p-3 text-slate-600">Full system-wide access to all modules, employee files, and configurations.</td>
                    <td className="p-3 text-slate-600">Approve all leaves, adjust DTRs, compute TLB, manage user roles, view audit logs.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">HR Staff / Encoder</td>
                    <td className="p-3 text-slate-600">Broad access to employee records and daily operations, but restricted from system settings.</td>
                    <td className="p-3 text-slate-600">Encode new hires, upload OCR documents, import biometric CSVs, generate CS Form 48 & COE.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Department Head</td>
                    <td className="p-3 text-slate-600">Scoped access limited to personnel assigned to their specific municipal office.</td>
                    <td className="p-3 text-slate-600">Review and recommend/approve leave applications and attendance logs for their team.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-900">Employee (Self-Service)</td>
                    <td className="p-3 text-slate-600">Read-only access to personal data and specific self-service modules.</td>
                    <td className="p-3 text-slate-600">View personal 201 profile, check daily DTR logs, monitor VL/SL credit balances, file leave requests.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <ProTip>
              If you believe your access level is incorrect or you need temporary elevated permissions for a specific task (e.g., covering for an absent HR staff), submit a formal request to the HRMO System Administrator.
            </ProTip>
          </section>

          {/* 3. WORKFLOW AT A GLANCE */}
          <section id="workflow" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">3</span>
              The HRMIS workflow at a glance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              {[
                { step: 'Phase 1: Onboarding', desc: 'HR encodes new employee 201 profile or scans Personal Data Sheet (PDS) via OCR for auto-population.', icon: Users },
                { step: 'Phase 2: Daily Ops', desc: 'Employees log biometric/manual time-in & out. HR imports daily logs and resolves discrepancies.', icon: Clock },
                { step: 'Phase 3: Leave Mgmt', desc: 'Employee files VL/SL online. Department Head recommends. HRMO approves and deducts from ledger.', icon: CalendarOff },
                { step: 'Phase 4: Compliance', desc: 'At month-end, HR generates CS Form 48 DTRs, issues COEs, and computes Terminal Leave Benefits.', icon: FileText },
              ].map((item, idx) => (
                <div key={item.step} className="relative p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                    {idx + 1}
                  </div>
                  <item.icon size={20} className="text-emerald-700 mb-2 mt-1" />
                  <div className="font-bold text-emerald-900 mb-1">{item.step}</div>
                  <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 4. STEP 1: DASHBOARD */}
          <section id="step-dashboard" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">4</span>
              Step 1 · Dashboard & analytics
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Upon signing in, the Dashboard summarizes real-time workforce headcount across Regular, Casual, and Job Order (JO) appointments, alongside pending action items requiring your attention.
            </p>

            <div className="mb-6">
              <Step num="1" title="Review Headcount KPIs">
                Observe the top-row cards for live counts of Active Personnel, broken down by employment status. This helps HRMO track staffing levels against the approved Plantilla of Personnel.
              </Step>
              <Step num="2" title="Monitor Pending Actions">
                Check the "Pending Leave Queue" or "Action Required" widgets. These highlight newly submitted requests waiting for your specific role's approval or review.
              </Step>
              <Step num="3" title="Navigate to Modules">
                Use the persistent left-hand Navigation Sidebar to jump directly to specific modules like Employees, Attendance, or Reports.
              </Step>
            </div>

            <AnnotatedScreen
              title="HRMIS — Executive Dashboard"
              url="https://hrmis-lapaz.vercel.app/"
              callouts={[
                { num: 1, label: 'Navigation Sidebar', desc: 'Switch between Dashboard, Employees, Attendance, Leaves, Reports, OCR & TLB, and Help Manual.' },
                { num: 2, label: 'Employment Status KPI Cards', desc: 'Displays live, real-time counts of Active Personnel, Regular, Job Order, and Casual employees.' },
                { num: 3, label: 'Pending Leave Queue', desc: 'Highlights newly submitted leave requests waiting for HR or Department Head action.' },
              ]}
            >
              <div className="grid grid-cols-12 gap-3 text-xs">
                <div className="col-span-3 bg-slate-900 text-white p-3 rounded-lg space-y-2">
                  <div className="flex items-center justify-between font-bold text-blue-400 mb-2">
                    <span>HRMIS Menu</span>
                    <Pin num={1} />
                  </div>
                  <div className="bg-blue-600 px-3 py-1.5 rounded flex items-center gap-2 font-medium">
                    <LayoutDashboard size={14} /> Dashboard
                  </div>
                  <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                    <Users size={14} /> Employees
                  </div>
                  <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                    <Clock size={14} /> Attendance
                  </div>
                  <div className="text-slate-400 px-3 py-1.5 flex items-center gap-2 hover:text-white cursor-pointer transition-colors">
                    <CalendarOff size={14} /> Leaves
                  </div>
                </div>
                <div className="col-span-9 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-white p-3 rounded-lg border border-amber-400 shadow-sm flex justify-between items-start">
                      <div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Employees</div>
                        <div className="text-2xl font-bold text-slate-900 mt-1">881</div>
                        <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1">
                          <CheckCircle2 size={10} /> +3 this month
                        </div>
                      </div>
                      <Pin num={2} />
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Regular / Casual</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">381</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Job Order (JO)</div>
                      <div className="text-2xl font-bold text-slate-900 mt-1">500</div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-400 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={14} className="text-amber-600" /> Pending Leave Applications
                      </span>
                      <Pin num={3} />
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-slate-50 rounded border border-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">MS</div>
                          <div>
                            <div className="font-semibold text-slate-800">Maria Santos</div>
                            <div className="text-[10px] text-slate-500">Sick Leave · 2 days · Nov 18-19</div>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold border border-amber-200">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 5. STEP 2: EMPLOYEES */}
          <section id="step-employees" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">5</span>
              Step 2 · Managing 201 employee records
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              The <strong>Employees</strong> module is the central repository for all municipal personnel data. Use it to add new hires, search by name or Employee ID, filter by department, or update salary grades and employment status.
            </p>

            <div className="mb-6">
              <Step num="1" title="Add a New Employee">
                Click the blue <strong>+ Add Employee</strong> button. Fill out the registration modal with the Employee ID, Personal Information, Department, Position, Salary Grade, and Daily/Monthly Rate.
              </Step>
              <Step num="2" title="Search & Filter Records">
                Use the search bar at the top of the directory to instantly locate staff by full name, ID number, or assigned municipal office. Use the "Filter" dropdown to narrow down by employment status.
              </Step>
              <Step num="3" title="Edit or Archive">
                Click <strong>Edit</strong> on a specific row to update promotion details, step increments, or contact info. Use <strong>Archive</strong> (not delete) for separated employees to preserve historical audit trails.
              </Step>
            </div>

            <ProTip>
              When adding a new employee, ensure the <strong>Employee ID</strong> matches the format used in the biometric attendance system to enable seamless CSV imports later.
            </ProTip>

            <AnnotatedScreen
              title="HRMIS — 201 Employee Directory"
              url="https://hrmis-lapaz.vercel.app/employees"
              callouts={[
                { num: 1, label: '+ Add Employee Button', desc: 'Opens the registration modal for Employee ID, Personal Info, Department, Position, Salary Grade, and Daily Rate.' },
                { num: 2, label: 'Search & Department Filter', desc: 'Instantly locate staff by full name, ID number, or assigned municipal office.' },
                { num: 3, label: 'Edit / Archive Actions', desc: 'Update promotion details, step increments, or employment status with automatic audit logging.' },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="relative flex-1 max-w-xs">
                    <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
                    <input type="text" placeholder="Search name, ID, or office..." className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500" readOnly />
                    <Pin num={2} className="absolute -right-2 -top-2" />
                  </div>
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-white border border-slate-300 rounded-md text-slate-700 font-medium flex items-center gap-1.5 hover:bg-slate-50">
                      <Download size={14} /> Import CSV
                    </button>
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-medium flex items-center gap-1.5 hover:bg-blue-700 shadow-sm">
                      <span>+ Add Employee</span>
                      <Pin num={1} />
                    </button>
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Employee ID</th>
                      <th className="p-3 font-semibold">Full Name</th>
                      <th className="p-3 font-semibold">Position & Department</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600">EMP-2026-001</td>
                      <td className="p-3 font-semibold text-slate-900">Juan Dela Cruz</td>
                      <td className="p-3 text-slate-600">Admin Officer IV <span className="text-slate-400">· HRMO</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">REGULAR</span></td>
                      <td className="p-3 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-medium mr-3 hover:underline">Edit</button>
                        <button className="text-red-600 hover:text-red-800 font-medium hover:underline">Archive</button>
                        <Pin num={3} className="ml-2" />
                      </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-mono text-slate-600">EMP-2026-042</td>
                      <td className="p-3 font-semibold text-slate-900">Ana Reyes</td>
                      <td className="p-3 text-slate-600">Municipal Agriculturist <span className="text-slate-400">· MAO</span></td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md text-[10px] font-bold border border-blue-200">CASUAL</span></td>
                      <td className="p-3 text-right">
                        <button className="text-blue-600 hover:text-blue-800 font-medium mr-3 hover:underline">Edit</button>
                        <button className="text-red-600 hover:text-red-800 font-medium hover:underline">Archive</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 6. STEP 3: ATTENDANCE */}
          <section id="step-attendance" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">6</span>
              Step 3 · Timekeeping & DTR logs
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              The <strong>Attendance</strong> module records morning and afternoon time-in/time-out entries. It automatically flags tardiness and undertime minutes against the standard 8:00 AM – 5:00 PM schedule for payroll and DTR generation.
            </p>

            <div className="mb-6">
              <Step num="1" title="Manual Time Log Entry">
                Click <strong>Log Attendance</strong>, select the employee from the dropdown, choose the date, and input the AM/PM time-in and time-out values.
              </Step>
              <Step num="2" title="Biometric CSV Import (HR Staff)">
                Instead of manual entry, navigate to the "Import" tab, upload the monthly CSV export from the municipal biometric scanner, and map the columns to the HRMIS fields.
              </Step>
              <Step num="3" title="Resolve Discrepancies">
                Review rows flagged with "Late" or "Undertime". If the tardiness was due to an official authorized reason, use the "Adjust" feature to add a remark and override the late minutes.
              </Step>
            </div>

            <AnnotatedScreen
              title="HRMIS — Daily Time Record & Attendance"
              url="https://hrmis-lapaz.vercel.app/attendance"
              callouts={[
                { num: 1, label: 'Quick Time-In / Time-Out Logger', desc: 'Select an employee and log AM Arrival, AM Departure, PM Arrival, or PM Departure manually.' },
                { num: 2, label: 'Date & Cutoff Filter', desc: 'Filter attendance logs by 1st cutoff (1–15) or 2nd cutoff (16–31) of any specific month.' },
                { num: 3, label: 'Late & Undertime Auto-Calculation', desc: 'Automatically computes late minutes against the standard 8:00 AM – 5:00 PM schedule.' },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap justify-between items-center gap-2">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-emerald-600 text-white rounded-md font-medium flex items-center gap-1.5 hover:bg-emerald-700 shadow-sm">
                      <Clock size={14} /> Log Attendance
                    </button>
                    <Pin num={1} />
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>November 2026</option>
                      <option>October 2026</option>
                    </select>
                    <select className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option>1st Cutoff (1-15)</option>
                      <option>2nd Cutoff (16-31)</option>
                    </select>
                    <Pin num={2} />
                  </div>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Employee</th>
                      <th className="p-3 font-semibold">AM In</th>
                      <th className="p-3 font-semibold">AM Out</th>
                      <th className="p-3 font-semibold">PM In</th>
                      <th className="p-3 font-semibold">PM Out</th>
                      <th className="p-3 font-semibold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr className="hover:bg-slate-50">
                      <td className="p-3 text-slate-600">Nov 20, 2026</td>
                      <td className="p-3 font-semibold text-slate-900">Juan Dela Cruz</td>
                      <td className="p-3 text-emerald-700 font-mono">07:55 AM</td>
                      <td className="p-3 text-slate-400 font-mono">--:--</td>
                      <td className="p-3 text-slate-400 font-mono">--:--</td>
                      <td className="p-3 text-slate-400 font-mono">--:--</td>
                      <td className="p-3 text-right">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-bold border border-emerald-200">On Time</span>
                        <Pin num={3} className="ml-1" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 7. STEP 4: LEAVES */}
          <section id="step-leaves" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">7</span>
              Step 4 · Leave filing, credits & ledger
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Manage Vacation Leave (VL), Sick Leave (SL), Special Privilege Leave (SPL), and Forced Leave under CSC Omnibus Rules on Leave. Approving a leave automatically deducts the days from the employee's leave ledger.
            </p>

            <div className="mb-6">
              <Step num="1" title="File a Leave Request (Employee View)">
                Navigate to <strong>Leaves</strong> and click <strong>+ File Leave</strong>. Select the leave type, inclusive dates, number of days, and attach a medical certificate if required (for SL Greater than 2 days).
              </Step>
              <Step num="2" title="Review & Approve (Approver View)">
                Department Heads and HRMO will see pending requests in their dashboard. Click <strong>Approve</strong> to endorse/accept, or <strong>Reject</strong> with a mandatory remark explaining the denial.
              </Step>
              <Step num="3" title="Monitor Leave Ledger & Balances">
                HR Staff can click <strong>Run Monthly Accrual</strong> at the end of each month to automatically post the earned +1.25 VL and +1.25 SL credits for eligible regular employees.
              </Step>
            </div>

            <ProTip>
              The system enforces CSC rules: an employee cannot file a leave if their remaining credit balance is insufficient, unless the request is marked as "Leave Without Pay" (LWOP).
            </ProTip>

            <AnnotatedScreen
              title="HRMIS — Leave Applications & Credit Ledger"
              url="https://hrmis-lapaz.vercel.app/leaves"
              callouts={[
                { num: 1, label: 'File Leave Request Form', desc: 'Select employee, leave type (VL, SL, SPL, Maternity/Paternity), inclusive dates, and reason.' },
                { num: 2, label: 'Approve / Disapprove Buttons', desc: 'Authorized approvers can approve or reject pending requests with one click, triggering a ledger update.' },
                { num: 3, label: 'Monthly Credit Accrual', desc: 'Posts monthly earned leave credits (+1.25 VL / +1.25 SL) for regular employees and updates running balances.' },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap justify-between items-center gap-2">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <CalendarOff size={14} className="text-blue-600" /> Leave Applications & Ledger
                  </span>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md font-medium flex items-center gap-1.5 hover:bg-blue-700 shadow-sm">
                      <span>+ File Leave</span>
                      <Pin num={1} />
                    </button>
                    <button className="px-3 py-1.5 bg-slate-800 text-white rounded-md font-medium flex items-center gap-1.5 hover:bg-slate-900 shadow-sm">
                      <span>Run Monthly Accrual</span>
                      <Pin num={3} />
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <div className="p-3 rounded-lg bg-amber-50/50 border border-amber-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">MS</div>
                      <div>
                        <div className="font-semibold text-slate-900">Maria Santos</div>
                        <div className="text-[10px] text-slate-500">Sick Leave (SL) · 2.0 days · Nov 18-19, 2026</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold border border-amber-200">PENDING</span>
                      <button className="px-3 py-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 font-medium text-[10px]">Approve</button>
                      <button className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-[10px]">Reject</button>
                      <Pin num={2} />
                    </div>
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 8. STEP 5: REPORTS */}
          <section id="step-reports" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">8</span>
              Step 5 · Reports, CS Form 48 & COE
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Generate official Civil Service compliant printouts directly from the <strong>Reports</strong> module without needing external word processors or manual formatting.
            </p>

            <div className="mb-6">
              <Step num="1" title="Select Report Type">
                Choose between <strong>CS Form No. 48 (Daily Time Record)</strong>, <strong>Certificate of Employment (COE)</strong>, or the <strong>Monthly Leave Summary</strong>.
              </Step>
              <Step num="2" title="Configure Date Range & Filters">
                Select the specific employee(s), department, and the applicable cutoff period or date range for the report.
              </Step>
              <Step num="3" title="Generate & Print PDF">
                Click <strong>Generate</strong> to preview the document. Click <strong>Print Official Copy</strong>. The system will automatically hide navigation sidebars and format the page for clean, official A4 printing.
              </Step>
            </div>

            <AnnotatedScreen
              title="HRMIS — Official Reports & Print Generator"
              url="https://hrmis-lapaz.vercel.app/reports"
              callouts={[
                { num: 1, label: 'CS Form No. 48 (Daily Time Record)', desc: 'Generates the official CSC DTR format complete with morning/afternoon logs and signatory lines.' },
                { num: 2, label: 'Certificate of Employment (COE)', desc: 'Auto-populates employee position, appointment status, date hired, and current compensation.' },
                { num: 3, label: 'Print Document Trigger', desc: 'Hides navigation sidebars automatically via CSS print rules so only the clean official form prints.' },
              ]}
            >
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden text-xs shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-wrap justify-between items-center gap-2">
                  <span className="font-bold text-slate-800 flex items-center gap-2">
                    <FileText size={14} className="text-emerald-600" /> Official Reports Generator
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 group-hover:text-blue-700">CS Form No. 48 (DTR)</span>
                      <Pin num={1} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">Official Daily Time Record with morning/afternoon logs and signatory lines.</p>
                    <button className="w-full py-1.5 bg-slate-100 text-slate-700 rounded font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">Generate</button>
                  </div>
                  <div className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-800 group-hover:text-blue-700">Certificate of Employment</span>
                      <Pin num={2} />
                    </div>
                    <p className="text-[11px] text-slate-500 mb-3">Auto-populates employee position, appointment status, date hired, and compensation.</p>
                    <button className="w-full py-1.5 bg-slate-100 text-slate-700 rounded font-medium group-hover:bg-blue-600 group-hover:text-white transition-colors">Generate</button>
                  </div>
                </div>
                <div className="p-3 border-t border-slate-200 bg-slate-50 flex justify-end">
                  <button className="px-4 py-1.5 bg-emerald-700 text-white rounded-md font-semibold flex items-center gap-2 hover:bg-emerald-800 shadow-sm">
                    <Printer size={14} /> Print Official Copy
                    <Pin num={3} />
                  </button>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 9. STEP 6: OCR & TLB */}
          <section id="step-ocr" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">9</span>
              Step 6 · OCR document parsing & TLB
            </h2>
            <p className="text-slate-600 text-sm mb-6">
              Use the <strong>OCR &amp; TLB</strong> module to digitize scanned Personal Data Sheets (PDS) or Service Records, and to compute Terminal Leave Benefits (TLB) using the standard CSC constant factor.
            </p>

            <div className="mb-6">
              <Step num="1" title="Upload Scanned Document">
                Navigate to the OCR tab and drag-and-drop a clear, high-resolution JPG, PNG, or PDF of the employee's PDS or Service Record into the dropzone.
              </Step>
              <Step num="2" title="Verify Extracted Data">
                The system will parse the image and populate a preview form. <strong>Always manually verify</strong> the extracted Name, Position, Salary Grade, and Dates before clicking "Save to 201 Repository".
              </Step>
              <Step num="3" title="Compute Terminal Leave Benefit (TLB)">
                Enter the employee's highest monthly salary and total accumulated leave credits. The system applies the CSC formula to generate the monetized value instantly.
              </Step>
            </div>

            <AnnotatedScreen
              title="HRMIS — OCR Scanner & Terminal Leave Benefit Calculator"
              url="https://hrmis-lapaz.vercel.app/ocr"
              callouts={[
                { num: 1, label: 'Document Upload Dropzone', desc: 'Upload JPG, PNG, or scanned service records to extract structured text automatically via AI.' },
                { num: 2, label: 'Extracted Text & Autofill Preview', desc: 'Review parsed employee details and save directly into the 201 repository after verification.' },
                { num: 3, label: 'Terminal Leave Benefit (TLB) Calculator', desc: 'Multiplies Highest Monthly Salary × Total Accumulated Leave Credits × 0.0481927.' },
              ]}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2"><ScanLine size={14} className="text-blue-600"/> OCR Document Upload</span>
                    <Pin num={1} />
                  </div>
                  <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-500 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer">
                    <div className="font-medium text-slate-700 mb-1">Drop scanned PDS / Service Record here</div>
                    <div className="text-[10px]">Supports JPG, PNG, PDF (Max 5MB)</div>
                  </div>
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between text-slate-700 mb-1">
                      <span className="font-semibold">Extracted Text Output</span>
                      <Pin num={2} />
                    </div>
                    <div className="p-2 bg-slate-100 rounded font-mono text-[10px] text-slate-600 leading-tight">
                      Name: JUAN DELA CRUZ<br/>
                      Position: ADMIN OFFICER IV<br/>
                      SG: 11 · Monthly: ₱29,568.00
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
                  <div className="flex items-center justify-between font-bold text-slate-800">
                    <span className="flex items-center gap-2"><FileText size={14} className="text-emerald-600"/> CSC Terminal Leave Benefit</span>
                    <Pin num={3} />
                  </div>
                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 space-y-2">
                    <div className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">Computation Formula</div>
                    <div className="font-mono text-xs text-emerald-900 bg-white p-2 rounded border border-emerald-100">
                      Highest Monthly Salary × Total Accumulated Leave Credits × 0.0481927
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="text-[11px] text-slate-500 mb-1">Computed Monetized Value</div>
                    <div className="text-2xl font-bold text-emerald-700">₱ 0.00</div>
                    <div className="text-[10px] text-slate-400">Requires valid accumulated leave credits</div>
                  </div>
                </div>
              </div>
            </AnnotatedScreen>
          </section>

          {/* 10. AUDIT TRAIL & SECURITY */}
          <section id="audit-security" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">10</span>
              Audit trail & security policies
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <ShieldCheck size={16} className="text-emerald-600" /> System Security Measures
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li><strong>Password Policy:</strong> Minimum 8 characters, 1 uppercase, 1 number, and 1 special character. Forced reset every 90 days.</li>
                  <li><strong>Encrypted Sessions:</strong> Passwords are hashed using bcrypt. User sessions are protected via signed, short-lived JWT tokens.</li>
                  <li><strong>Role-Based Access Control (RBAC):</strong> Strict enforcement ensuring users can only view or edit data scoped to their department or role.</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-2">
                  <FileText size={16} className="text-emerald-600" /> Immutable Audit Logs
                </h3>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-600">
                  <li>Every login, employee record creation, salary modification, leave approval, and DTR adjustment is permanently logged.</li>
                  <li>Logs capture: <strong>Timestamp, Acting User ID, IP Address, Action Type, Old Value, and New Value.</strong></li>
                  <li>Audit logs are read-only and can only be exported by the Super Admin / HRMO Head for COA or CSC compliance audits.</li>
                </ul>
              </div>
            </div>

            <Warning>
              Always click <strong>Logout</strong> in the bottom left sidebar when using shared municipal workstations. Leaving a session active poses a severe data privacy risk under the Data Privacy Act of 2012 (RA 10173).
            </Warning>
          </section>

          {/* 11. TROUBLESHOOTING & FAQ */}
          <section id="troubleshooting" className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm scroll-mt-24">
            <h2 className="text-xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-sm">11</span>
              Troubleshooting & FAQ
            </h2>
            
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-blue-600" /> The first login takes 15–20 seconds after inactivity. Why?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  When hosted on free or scaled cloud tiers, the backend server may "sleep" after prolonged inactivity to save resources. The first request wakes it up. Once awake, all subsequent clicks respond immediately.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-blue-600" /> How do I download a PDF copy of this manual?
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Click the <strong>Print / Save PDF</strong> button at the top right of this page. In the print dialog, choose <strong>Save as PDF</strong> as the destination printer, ensure "Background graphics" is checked, and click Save.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-blue-600" /> My biometric CSV import is failing or showing "Invalid Format".
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Ensure the CSV file is saved with <strong>UTF-8 encoding</strong> and that the column headers exactly match the expected template (e.g., "EmployeeID", "Date", "Time"). Download the sample template from the Import modal to verify.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-blue-600" /> I forgot my password or my account is locked.
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Do not attempt to guess your password multiple times, as this will trigger an automatic account lock for security. Contact the LGU La Paz HRMO System Administrator directly to reset your credentials.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-2">
                  <HelpCircle size={16} className="text-blue-600" /> The print preview of CS Form 48 looks cut off or misaligned.
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  In your browser's print settings, ensure the <strong>Paper Size</strong> is set to "A4", <strong>Margins</strong> are set to "Default" or "None", and the <strong>Scale</strong> is set to 100%.
                </p>
              </div>
            </div>

            <div className="mt-8 p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
              <h4 className="font-bold text-emerald-900 mb-1">Still need help?</h4>
              <p className="text-sm text-emerald-800 mb-3">
                For technical issues, system bugs, or feature requests, please contact the IT Support Desk.
              </p>
              <a href="mailto:it-support@lapaz-agusandelsur.gov.ph" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg font-semibold text-sm hover:bg-emerald-700 transition-colors shadow-sm">
                <span>✉️</span> Email IT Support Desk
              </a>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}