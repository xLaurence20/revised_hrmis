import { useState, useEffect } from 'react';
import api from '../api';
import {
  Printer,
  X,
  FileText,
  Search,
  Calendar,
  ClipboardList,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [reportType, setReportType] = useState('coe'); // 'coe' | 'dtr'
  const [dtrMonth, setDtrMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [dtrLogs, setDtrLogs] = useState([]);
  const [coeData, setCoeData] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    api
      .get('/employees')
      .then((res) => setEmployees(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error('Failed to load employees'))
      .finally(() => setLoading(false));
  }, []);

  const openReportModal = async (emp, type = reportType) => {
    setSelectedEmp(emp);
    setReportType(type);
    setGenerating(true);
    const loadingToast = toast.loading(
      type === 'coe' ? 'Generating Certificate of Employment...' : 'Loading CS Form No. 48 (DTR)...'
    );

    try {
      if (type === 'coe') {
        const { data } = await api.get(`/reports/coe/${emp.id}`);
        setCoeData(data);
        setIsPreviewOpen(true);
        toast.success('COE ready for preview', { id: loadingToast });
      } else {
        const { data } = await api.get(`/attendance`, {
          params: { employee_id: emp.id, month: dtrMonth },
        });
        setDtrLogs(Array.isArray(data) ? data : []);
        setIsPreviewOpen(true);
        toast.success('CS Form No. 48 (DTR) ready for preview', { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate report', { id: loadingToast });
    } finally {
      setGenerating(false);
    }
  };

  const handleSwitchReportType = async (nextType) => {
    setReportType(nextType);
    if (!selectedEmp) return;
    await openReportModal(selectedEmp, nextType);
  };

  const handlePrintOfficialCopy = () => {
    window.print();
  };

  const filteredEmployees = employees.filter((emp) => {
    const fullName = `${emp.first_name || ''} ${emp.last_name || ''} ${emp.employee_no || ''} ${
      emp.position_title || ''
    }`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  // Build day-by-day rows for CS Form No. 48 (DTR)
  const buildDtrDays = () => {
    const [yearStr, monthStr] = dtrMonth.split('-');
    const year = parseInt(yearStr, 10) || new Date().getFullYear();
    const month = (parseInt(monthStr, 10) || 1) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const logsByDay = {};
    dtrLogs.forEach((log) => {
      const d = new Date(log.log_date || log.date || log.created_at);
      if (!isNaN(d.getTime())) {
        const dayNum = d.getDate();
        logsByDay[dayNum] = log;
      }
    });

    return Array.from({ length: daysInMonth }, (_, idx) => {
      const day = idx + 1;
      const entry = logsByDay[day] || {};
      return {
        day,
        amArrival: entry.am_arrival || entry.time_in || '',
        amDeparture: entry.am_departure || '',
        pmArrival: entry.pm_arrival || '',
        pmDeparture: entry.pm_departure || entry.time_out || '',
        undertimeHours: entry.undertime_hours || '',
        undertimeMinutes: entry.undertime_minutes || '',
      };
    });
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Reports &amp; Official Forms</h1>
          <p className="text-slate-500 text-sm">
            Generate and print CS Form No. 48 (Daily Time Record) and Certificate of Employment
            (COE).
          </p>
        </div>

        {/* Report Switcher & Print Official Copy Bar matching Manual Screenshot */}
        <div className="bg-white border border-slate-200 rounded-xl p-2 shadow-xs flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleSwitchReportType('dtr')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              reportType === 'dtr'
                ? 'bg-slate-100 border-slate-900 text-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <ClipboardList size={16} />
            <span>CS Form No. 48 (DTR)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSwitchReportType('coe')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              reportType === 'coe'
                ? 'bg-slate-100 border-slate-900 text-slate-900'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Award size={16} />
            <span>Certificate of Employment</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (selectedEmp) {
                handlePrintOfficialCopy();
              } else if (filteredEmployees.length > 0) {
                openReportModal(filteredEmployees[0], reportType);
              } else {
                toast.error('Select an employee first');
              }
            }}
            className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <Printer size={16} />
            <span>Print Official Copy</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search employee no., name, or position..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-500" />
          <label htmlFor="dtr-month" className="text-xs font-semibold text-slate-600 uppercase">
            DTR Period:
          </label>
          <input
            id="dtr-month"
            type="month"
            value={dtrMonth}
            onChange={(e) => setDtrMonth(e.target.value)}
            className="border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Employee Reports Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto no-print">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-semibold">Employee No.</th>
              <th className="p-4 font-semibold">Employee Name</th>
              <th className="p-4 font-semibold">Position Title</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  Loading employee records...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-8 text-center text-slate-500">
                  No matching employees found.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 text-sm font-semibold text-slate-900">{emp.employee_no}</td>
                  <td className="p-4 text-sm font-medium text-slate-800">
                    {emp.last_name}, {emp.first_name}
                  </td>
                  <td className="p-4 text-sm text-slate-600">{emp.position_title || 'N/A'}</td>
                  <td className="p-4 text-sm text-right">
                    <div className="inline-flex items-center justify-end gap-2">
                      <button
                        type="button"
                        disabled={generating}
                        onClick={() => openReportModal(emp, 'dtr')}
                        className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <ClipboardList size={14} /> DTR (Form 48)
                      </button>
                      <button
                        type="button"
                        disabled={generating}
                        onClick={() => openReportModal(emp, 'coe')}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                      >
                        <FileText size={14} /> Generate COE
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* REPORT PREVIEW MODAL */}
      {isPreviewOpen && selectedEmp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 no-print">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchReportType('dtr')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    reportType === 'dtr'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  CS Form No. 48 (DTR)
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchReportType('coe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                    reportType === 'coe'
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  Certificate of Employment
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintOfficialCopy}
                  className="inline-flex items-center gap-2 bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-800 transition-colors"
                >
                  <Printer size={16} /> Print Official Copy
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* PRINTABLE DOCUMENT AREA */}
            {reportType === 'coe' && coeData ? (
              <div className="print-area bg-white text-black p-12 border border-slate-300">
                <div className="text-center mb-10">
                  <h1 className="font-bold text-xl tracking-widest uppercase">
                    Republic of the Philippines
                  </h1>
                  <h2 className="font-bold text-lg uppercase mt-1">
                    Local Government Unit of La Paz
                  </h2>
                  <p className="text-sm mt-1">Province of Agusan del Sur • Human Resource Management Office</p>
                </div>

                <h1 className="font-bold text-2xl text-center mb-8 tracking-widest">
                  CERTIFICATE OF EMPLOYMENT
                </h1>

                <p className="mb-4 text-base">To Whom It May Concern:</p>

                <p className="mb-4 text-base text-justify leading-relaxed indent-10">
                  This is to certify that{' '}
                  <strong className="font-bold">
                    {coeData.first_name} {coeData.last_name}
                  </strong>
                  , with Employee No.{' '}
                  <strong className="font-bold">{coeData.employee_no || selectedEmp.employee_no}</strong>,
                  is currently employed with the Local Government Unit of La Paz as a{' '}
                  <strong className="font-bold">
                    {coeData.position_title || selectedEmp.position_title || 'Personnel'}
                  </strong>{' '}
                  under the{' '}
                  <strong className="font-bold">
                    {coeData.department_name || selectedEmp.department_name || 'Municipal Office'}
                  </strong>
                  .
                </p>

                <p className="mb-8 text-base text-justify leading-relaxed indent-10">
                  This certification is issued upon the request of the above-named employee for
                  whatever legal purpose it may serve them best.
                </p>

                <p className="mb-16 text-base">
                  Issued this{' '}
                  {new Date().toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}{' '}
                  at La Paz, Agusan del Sur, Philippines.
                </p>

                <div className="flex justify-end">
                  <div className="text-center w-72">
                    <p className="font-bold text-base border-b border-black pb-1 uppercase">
                      Municipal HR Management Officer
                    </p>
                    <p className="text-xs mt-1">Human Resource Management Office</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="print-area bg-white text-black p-8 border border-slate-300 text-xs">
                <p className="font-semibold">Civil Service Form No. 48</p>
                <h1 className="font-bold text-lg text-center tracking-wider mt-1 mb-4">
                  DAILY TIME RECORD
                </h1>

                <div className="border-b border-black pb-2 mb-3 flex justify-between">
                  <div>
                    <span className="font-semibold">Name:</span>{' '}
                    <span className="underline">
                      {selectedEmp.last_name}, {selectedEmp.first_name}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">For the month of:</span>{' '}
                    <span className="underline">{dtrMonth}</span>
                  </div>
                </div>

                <table className="w-full border-collapse border border-black text-center">
                  <thead>
                    <tr className="bg-slate-100">
                      <th className="border border-black p-1.5" rowSpan="2">
                        Day
                      </th>
                      <th className="border border-black p-1.5" colSpan="2">
                        A.M.
                      </th>
                      <th className="border border-black p-1.5" colSpan="2">
                        P.M.
                      </th>
                      <th className="border border-black p-1.5" colSpan="2">
                        Undertime
                      </th>
                    </tr>
                    <tr className="bg-slate-50">
                      <th className="border border-black p-1">Arrival</th>
                      <th className="border border-black p-1">Departure</th>
                      <th className="border border-black p-1">Arrival</th>
                      <th className="border border-black p-1">Departure</th>
                      <th className="border border-black p-1">Hours</th>
                      <th className="border border-black p-1">Minutes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {buildDtrDays().map((row) => (
                      <tr key={row.day}>
                        <td className="border border-black p-1 font-semibold">{row.day}</td>
                        <td className="border border-black p-1">{row.amArrival}</td>
                        <td className="border border-black p-1">{row.amDeparture}</td>
                        <td className="border border-black p-1">{row.pmArrival}</td>
                        <td className="border border-black p-1">{row.pmDeparture}</td>
                        <td className="border border-black p-1">{row.undertimeHours}</td>
                        <td className="border border-black p-1">{row.undertimeMinutes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <p className="mt-4 italic text-[11px] leading-snug">
                  I certify on my honor that the above is a true and correct report of the hours of
                  work performed, record of which was made daily at the time of arrival and
                  departure from office.
                </p>

                <div className="mt-8 flex justify-between items-end">
                  <div className="text-center w-56">
                    <div className="border-b border-black pb-1 font-semibold">
                      {selectedEmp.first_name} {selectedEmp.last_name}
                    </div>
                    <p className="text-[11px] mt-0.5">Employee Signature</p>
                  </div>
                  <div className="text-center w-56">
                    <div className="border-b border-black pb-1 font-semibold">
                      Verified as to the prescribed office hours
                    </div>
                    <p className="text-[11px] mt-0.5">In Charge</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}