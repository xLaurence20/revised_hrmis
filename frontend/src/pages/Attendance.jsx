import { useState, useEffect } from 'react';
import api from '../api';
import { Upload, FileText, Printer, X } from 'lucide-react';

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  
  // Print state
  const [printTarget, setPrintTarget] = useState(null); // { employee, logs }

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/logs?month=${month}&year=${year}`);
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [month, year]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rows = event.target.result.split('\n').filter(row => row.trim() !== '');
      const parsedLogs = rows.slice(1).map(row => {
        const [employee_id, log_date, time_in_am, time_out_am, time_in_pm, time_out_pm] = row.split(',');
        return { employee_id: parseInt(employee_id), log_date, time_in_am: time_in_am?.trim() || null, time_out_am: time_out_am?.trim() || null, time_in_pm: time_in_pm?.trim() || null, time_out_pm: time_out_pm?.trim() || null };
      });
      try {
        await api.post('/attendance/ingest', { logs: parsedLogs });
        alert('CSV Ingested successfully!');
        fetchLogs();
      } catch (err) {
        alert('Upload failed: ' + (err.response?.data?.error || err.message));
      }
    };
    reader.readAsText(file);
  };

  const handlePrintClick = (log) => {
    // Get all logs for this specific employee
    const empLogs = logs.filter(l => l.employee_id === log.employee_id);
    setPrintTarget({ employee: log, logs: empLogs });
  };

  const executePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-800">DTR Management</h1>
        <div className="flex items-center gap-4">
          <select className="border p-2 rounded" value={month} onChange={e => setMonth(e.target.value)}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" className="border p-2 rounded w-24" value={year} onChange={e => setYear(e.target.value)} />
          <label className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-green-700">
            <Upload size={18} /> Upload CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto no-print">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Employee</th>
              <th className="p-4 font-medium">AM In</th>
              <th className="p-4 font-medium">AM Out</th>
              <th className="p-4 font-medium">PM In</th>
              <th className="p-4 font-medium">PM Out</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="p-8 text-center">Loading...</td></tr>
            ) : logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm">{new Date(log.log_date).toLocaleDateString()}</td>
                <td className="p-4 text-sm font-medium">{log.last_name}, {log.first_name} ({log.employee_no})</td>
                <td className="p-4 text-sm text-gray-600">{log.time_in_am || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{log.time_out_am || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{log.time_in_pm || '-'}</td>
                <td className="p-4 text-sm text-gray-600">{log.time_out_pm || '-'}</td>
                <td className="p-4 text-sm text-right">
                  <button onClick={() => handlePrintClick(log)} className="text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                    <FileText size={16} /> Print CS Form 48
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No DTR logs found for this month.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PRINT MODAL */}
      {printTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">CS Form 48 Preview</h2>
              <div className="flex gap-2">
                <button onClick={executePrint} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                  <Printer size={18} /> Print
                </button>
                <button onClick={() => setPrintTarget(null)} className="text-gray-500 hover:text-gray-700 p-2"><X size={24} /></button>
              </div>
            </div>

            {/* CS FORM 48 LAYOUT (This gets printed) */}
            <div className="print-area bg-white text-black p-8 border">
              <div className="text-center mb-6">
                <h3 className="font-bold text-lg">CIVIL SERVICE FORM NO. 48</h3>
                <h2 className="font-bold text-2xl tracking-widest">DAILY TIME RECORD</h2>
                <p className="text-sm mt-1">(To be accomplished in ink)</p>
              </div>

              <div className="flex justify-between mb-4 border-b pb-2">
                <div>
                  <p className="font-bold text-lg">{printTarget.employee.last_name.toUpperCase()}, {printTarget.employee.first_name.toUpperCase()}</p>
                  <p className="text-sm border-t border-black text-center mt-1">Name</p>
                </div>
                <div className="text-right">
                  <p className="font-bold">For the month of {new Date(0, month - 1).toLocaleString('default', { month: 'long' })} {year}</p>
                  <p className="text-sm border-t border-black text-center mt-1">Month and Year</p>
                </div>
              </div>

              <p className="text-xs mb-2">Official hours for arrival and departure: <span className="border-b border-black inline-block w-16"></span> Regular Days, <span className="border-b border-black inline-block w-16"></span> Saturdays</p>

              <table className="w-full border-collapse border border-black text-sm text-center">
                <thead>
                  <tr>
                    <th rowSpan="2" className="border border-black p-1 w-12">Day</th>
                    <th colSpan="2" className="border border-black p-1">A.M.</th>
                    <th colSpan="2" className="border border-black p-1">P.M.</th>
                    <th colSpan="2" className="border border-black p-1">Undertime</th>
                  </tr>
                  <tr>
                    <th className="border border-black p-1">Arrival</th>
                    <th className="border border-black p-1">Departure</th>
                    <th className="border border-black p-1">Arrival</th>
                    <th className="border border-black p-1">Departure</th>
                    <th className="border border-black p-1">Hours</th>
                    <th className="border border-black p-1">Minutes</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                    // Find log for this day
                    const log = printTarget.logs.find(l => new Date(l.log_date).getDate() === day);
                    return (
                      <tr key={day}>
                        <td className="border border-black p-1 font-bold">{day}</td>
                        <td className="border border-black p-1">{log?.time_in_am || ''}</td>
                        <td className="border border-black p-1">{log?.time_out_am || ''}</td>
                        <td className="border border-black p-1">{log?.time_in_pm || ''}</td>
                        <td className="border border-black p-1">{log?.time_out_pm || ''}</td>
                        <td className="border border-black p-1"></td>
                        <td className="border border-black p-1"></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="4" className="border border-black p-2 text-right font-bold">Total</td>
                    <td className="border border-black p-2"></td>
                    <td className="border border-black p-2"></td>
                  </tr>
                </tfoot>
              </table>

              <div className="mt-8 text-xs">
                <p>I certify on my honor that the above is a true and correct report of the hours of work performed, record of which was made daily at the time of arrival and departure from office.</p>
                <div className="mt-8 flex justify-end">
                  <div className="text-center w-64">
                    <p className="font-bold border-b border-black pb-1">{printTarget.employee.last_name.toUpperCase()}, {printTarget.employee.first_name.toUpperCase()}</p>
                    <p>Signature of Employee</p>
                  </div>
                </div>
                <div className="mt-6 text-center w-full">
                  <p className="text-xs">VERIFIED as to the prescribed office hours:</p>
                  <div className="mt-8 flex justify-center">
                     <div className="text-center w-64">
                        <p className="font-bold border-b border-black pb-1">Supervisor Name</p>
                        <p>In-Charge</p>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}