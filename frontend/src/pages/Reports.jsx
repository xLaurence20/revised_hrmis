import { useState, useEffect } from 'react';
import api from '../api';
import { Printer, X, FileText } from 'lucide-react';

export default function Reports() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [printTarget, setPrintTarget] = useState(null);

  useEffect(() => {
    api.get('/employees').then(res => setEmployees(res.data)).catch(console.error);
  }, []);

  const handleGenerate = async (id) => {
    try {
      const { data } = await api.get(`/reports/coe/${id}`);
      setPrintTarget(data);
    } catch (err) {
      alert('Failed to generate COE');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6 no-print">
        <h1 className="text-2xl font-bold text-gray-800">HR Reports</h1>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-x-auto no-print">
        <table className="w-full text-left border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-50 text-gray-600 text-sm border-b">
              <th className="p-4 font-medium">Employee No.</th>
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Position</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map(emp => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="p-4 text-sm font-medium">{emp.employee_no}</td>
                <td className="p-4 text-sm">{emp.last_name}, {emp.first_name}</td>
                <td className="p-4 text-sm text-gray-600">{emp.position_title || 'N/A'}</td>
                <td className="p-4 text-sm text-right">
                  <button onClick={() => handleGenerate(emp.id)} className="text-blue-600 hover:underline flex items-center gap-1 ml-auto">
                    <FileText size={16} /> Generate COE
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* COE MODAL */}
      {printTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print">
          <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">COE Preview</h2>
              <div className="flex gap-2">
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"><Printer size={18} /> Print</button>
                <button onClick={() => setPrintTarget(null)} className="text-gray-500 hover:text-gray-700 p-2"><X size={24} /></button>
              </div>
            </div>

            {/* COE LAYOUT */}
            <div className="print-area bg-white text-black p-12 border">
              <div className="text-center mb-10">
                <h1 className="font-bold text-2xl tracking-widest uppercase">Republic of the Philippines</h1>
                <h2 className="font-bold text-xl uppercase mt-1">Department of Information and Communications Technology</h2>
                <p className="text-sm mt-1">Office of the Human Resources</p>
              </div>

              <h1 className="font-bold text-3xl text-center mb-8 tracking-widest">CERTIFICATE OF EMPLOYMENT</h1>

              <p className="mb-4 text-lg">To Whom It May Concern:</p>
              
              <p className="mb-4 text-lg text-justify leading-relaxed indent-10">
                This is to certify that <strong className="font-bold">{printTarget.first_name} {printTarget.last_name}</strong>, 
                is currently employed with the Department of Information and Communications Technology as a 
                <strong className="font-bold"> {printTarget.position_title}</strong> under the 
                <strong className="font-bold"> {printTarget.department_name}</strong>.
              </p>

              <p className="mb-8 text-lg text-justify leading-relaxed indent-10">
                This certification is issued upon the request of the above-named employee for whatever legal purpose it may serve them best.
              </p>

              <p className="mb-16 text-lg">Issued this {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })} at Quezon City, Philippines.</p>

              <div className="flex justify-end">
                <div className="text-center w-72">
                  <p className="font-bold text-lg border-b border-black pb-1">HR MANAGER NAME</p>
                  <p className="text-sm">Human Resources Management Officer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}