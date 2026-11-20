import { useState, useEffect } from 'react';
import api from '../api';
import { Upload, Calendar, FileText } from 'lucide-react';

export default function Attendance() {
  const [logs, setLogs] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);

  // Fetch logs
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

  // Handle CSV Upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target.result;
      const rows = csvData.split('\n').filter(row => row.trim() !== '');
      
      // Skip header (index 0), map rest
      // Format expected: employee_id, log_date (YYYY-MM-DD), time_in_am, time_out_am, time_in_pm, time_out_pm
      const parsedLogs = rows.slice(1).map(row => {
        const [employee_id, log_date, time_in_am, time_out_am, time_in_pm, time_out_pm] = row.split(',');
        return { 
          employee_id: parseInt(employee_id), 
          log_date, 
          time_in_am: time_in_am?.trim() || null, 
          time_out_am: time_out_am?.trim() || null, 
          time_in_pm: time_in_pm?.trim() || null, 
          time_out_pm: time_out_pm?.trim() || null 
        };
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
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

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto">
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
                  <button className="text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                    <FileText size={16} /> Print CS Form 48
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && !loading && (
              <tr><td colSpan="7" className="p-8 text-center text-gray-500">No DTR logs found for this month. Upload a CSV to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}