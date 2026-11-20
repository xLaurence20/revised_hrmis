import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { Upload, Calculator, UserPlus, Save, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function OCR() {
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', email: '', birth_date: '', date_hired: new Date().toISOString().split('T')[0]
  });

  // TLB States
  const [empId, setEmpId] = useState('');
  const [separationDate, setSeparationDate] = useState('');
  const [separationType, setSeparationType] = useState('Retirement');
  const [deductions, setDeductions] = useState(0);
  const [tlbResult, setTlbResult] = useState(null);

  // Employee list for the TLB dropdown
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get('/employees')
      .then(res => setEmployees(res.data))
      .catch(err => {
        console.error('Failed to load employees:', err);
        toast.error('Failed to load employees');
      });
  }, []);

  // --- REGEX PARSER ---
  const parsePDS = (rawText) => {
    let parsed = { ...formData };
    const lines = rawText.split('\n').map(l => l.trim().toUpperCase()).filter(l => l.length > 1);
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('SURNAME') && !line.includes('SPOUSE') && !line.includes('FATHER') && !line.includes('MOTHER')) {
        let val = line.replace(/SURNAME|:|2\./g, '').trim();
        if (!val && i + 1 < lines.length) val = lines[i + 1];
        parsed.last_name = val.replace(/[^A-Z\s]/g, '').trim();
      }
      
      if (line.includes('FIRST NAME') && !line.includes('SPOUSE') && !line.includes('FATHER') && !line.includes('MOTHER')) {
        let val = line.replace(/FIRST NAME|:|/g, '').trim();
        if (!val && i + 1 < lines.length) val = lines[i + 1];
        parsed.first_name = val.replace(/[^A-Z\s]/g, '').trim();
      }

      if (line.includes('MIDDLE NAME') && !line.includes('SPOUSE') && !line.includes('FATHER') && !line.includes('MOTHER')) {
        let val = line.replace(/MIDDLE NAME|:|/g, '').trim();
        if (!val && i + 1 < lines.length) val = lines[i + 1];
        parsed.middle_name = val.replace(/[^A-Z\s]/g, '').trim();
      }

      const emailMatch = line.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/);
      if (emailMatch) parsed.email = emailMatch[0].toLowerCase();

      if (line.includes('DATE OF BIRTH')) {
        const combinedLine = line + " " + (lines[i+1] || "");
        const dateMatch = combinedLine.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
        if (dateMatch) {
          parsed.birth_date = `${dateMatch[3]}-${dateMatch[1].padStart(2, '0')}-${dateMatch[2].padStart(2, '0')}`;
        }
      }
    }
    return parsed;
  };

  const handleImageUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImage(URL.createObjectURL(selectedFile));
      setText('');
      setStep(1);
    }
  };

  const runOCR = async () => {
    if (!file) return;
    setLoading(true);
    
    try {
      const apiFormData = new FormData();
      apiFormData.append('file', file);
      apiFormData.append('language', 'eng');
      apiFormData.append('isOverlayRequired', 'false');
      apiFormData.append('isTable', 'true');
      apiFormData.append('OCREngine', '2');

      const response = await axios.post('https://api.ocr.space/parse/image', apiFormData, {
        headers: {
          'apikey': 'K8419139331553688957', // REPLACE WITH YOUR API KEY
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.IsErroredOnProcessing) {
        throw new Error(response.data.ErrorMessage[0]);
      }

      const extractedText = response.data.ParsedResults[0].ParsedText;
      setText(extractedText);
      
      const extractedData = parsePDS(extractedText);
      setFormData(prev => ({ ...prev, ...extractedData }));
      setStep(2);
    } catch (err) {
      console.error(err);
      toast.error('OCR Failed: ' + (err.response?.data?.ErrorMessage?.[0] || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmployee = async () => {
    const loadingToast = toast.loading('Registering employee...');
    try {
      await api.post('/employees', formData);
      toast.success('Employee Registered Successfully!', { id: loadingToast });
      navigate('/employees');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error registering employee', { id: loadingToast });
    }
  };

  const handleTLB = async (e) => {
    e.preventDefault();

    if (!empId || !separationDate) {
      return toast.error('Please fill all required fields');
    }

    const loadingToast = toast.loading('Computing TLB...');

    try {
      const { data } = await api.post('/tlb/compute', {
        employeeId: empId,
        separationDate,
        separationType,
        deductions: Number(deductions) || 0
      });

      setTlbResult(data);
      toast.success('Computation complete', { id: loadingToast });
    } catch (err) {
      toast.error(
        err.response?.data?.error || 'Error computing TLB',
        { id: loadingToast }
      );
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* TLB CALCULATOR FORM */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-900">
          <Calculator className="text-blue-600" /> Terminal Leave Benefits Computation
        </h2>
        
        <form onSubmit={handleTLB} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-slate-700 block mb-1">Select Employee</label>
            <select required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700" value={empId} onChange={e => setEmpId(e.target.value)}>
              <option value="">-- Choose an employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.last_name}, {emp.first_name} ({emp.employee_no})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Separation Date</label>
            <input type="date" required className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={separationDate} onChange={e => setSeparationDate(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Separation Type</label>
            <select className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700" value={separationType} onChange={e => setSeparationType(e.target.value)}>
              <option value="Retirement">Retirement</option>
              <option value="Resignation">Resignation</option>
              <option value="Transfer">Transfer</option>
              <option value="Termination">Termination</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1">Authorized Deductions (₱)</label>
            <input type="number" step="0.01" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={deductions} onChange={e => setDeductions(e.target.value)} />
          </div>

          <button type="submit" className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm md:col-span-4 lg:col-span-1">
            Compute TLB
          </button>
        </form>
      </div>

      {/* TLB PRINTABLE RESULT */}
      {tlbResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center no-print">
            <h3 className="font-bold text-slate-800">TLB Computation Preview</h3>
            <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors text-sm font-medium">
              <Printer size={16} /> Print Computation
            </button>
          </div>

          {/* PRINTABLE AREA */}
          <div className="print-area bg-white p-12 text-black font-sans">
            <div className="text-center mb-8 border-b-2 border-black pb-4">
              <h1 className="font-bold text-2xl tracking-widest uppercase">Republic of the Philippines</h1>
              <h2 className="font-bold text-xl uppercase mt-1">Municipality of La Paz, Agusan del Sur</h2>
              <h3 className="font-semibold text-lg mt-2 uppercase">Terminal Leave Benefits Computation</h3>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="font-bold text-lg">{tlbResult.employee.name}</p>
                <p className="text-sm">Employee No: {tlbResult.employee.employee_no}</p>
              </div>
              <div className="text-right">
                <p>Separation Date: <strong>{new Date(tlbResult.separation.date).toLocaleDateString()}</strong></p>
                <p>Separation Type: <strong>{tlbResult.separation.type}</strong></p>
              </div>
            </div>

            <table className="w-full border-collapse border border-gray-400 text-sm mb-8">
              <tbody>
                <tr className="bg-gray-100">
                  <td colSpan="2" className="border border-gray-400 p-2 font-bold uppercase">Salary Reference (Highest Received)</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 w-1/2">Highest Monthly Salary</td>
                  <td className="border border-gray-400 p-2 font-bold text-right">₱ {tlbResult.salaryReference.amount}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Position Title</td>
                  <td className="border border-gray-400 p-2 text-right">{tlbResult.salaryReference.position}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Effective Date of Salary</td>
                  <td className="border border-gray-400 p-2 text-right">{new Date(tlbResult.salaryReference.date).toLocaleDateString()}</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-gray-400 text-sm mb-8">
              <tbody>
                <tr className="bg-gray-100">
                  <td colSpan="2" className="border border-gray-400 p-2 font-bold uppercase">Leave Credits Breakdown</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 w-1/2">Unused Vacation Leave (VL)</td>
                  <td className="border border-gray-400 p-2 text-right">{tlbResult.leaveCredits.vl} days</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2">Unused Sick Leave (SL)</td>
                  <td className="border border-gray-400 p-2 text-right">{tlbResult.leaveCredits.sl} days</td>
                </tr>
                <tr className="font-bold">
                  <td className="border border-gray-400 p-2 bg-gray-50">Total Leave Credits</td>
                  <td className="border border-gray-400 p-2 text-right bg-gray-50">{tlbResult.leaveCredits.total} days</td>
                </tr>
              </tbody>
            </table>

            <table className="w-full border-collapse border border-gray-400 text-sm mb-8">
              <tbody>
                <tr className="bg-gray-100">
                  <td colSpan="2" className="border border-gray-400 p-2 font-bold uppercase">Computation Details</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 w-1/2">Constant Factor</td>
                  <td className="border border-gray-400 p-2 text-right">{tlbResult.computation.constantFactor}</td>
                </tr>
                <tr className="font-bold">
                  <td className="border border-gray-400 p-2 bg-gray-50">Gross TLB Amount (Tax-Exempt)</td>
                  <td className="border border-gray-400 p-2 text-right bg-gray-50">₱ {tlbResult.computation.grossTLB}</td>
                </tr>
                <tr>
                  <td className="border border-gray-400 p-2 text-red-600">Less: Authorized Deductions</td>
                  <td className="border border-gray-400 p-2 text-right text-red-600">( ₱ {tlbResult.computation.deductions} )</td>
                </tr>
                <tr className="font-bold text-lg bg-blue-50">
                  <td className="border border-gray-400 p-2">NET TLB PAYABLE</td>
                  <td className="border border-gray-400 p-2 text-right">₱ {tlbResult.computation.netTLB}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-16 flex justify-between px-8">
              <div className="text-center w-64">
                <p className="border-b border-black pb-1 font-bold uppercase">{tlbResult.employee.name}</p>
                <p className="text-xs mt-1">Employee Signature</p>
              </div>
              <div className="text-center w-64">
                <p className="border-b border-black pb-1 font-bold uppercase">HR MANAGER</p>
                <p className="text-xs mt-1">Approving Authority</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OCR PARSING */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900">
            <UserPlus className="text-emerald-600" /> PDS Document Parsing
          </h2>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="text-sm font-medium text-blue-600 hover:underline">Upload New Document</button>
          )}
        </div>
        
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="max-w-xl mx-auto">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-slate-600 font-medium">Click to upload scanned PDS (Image)</span>
              <span className="text-slate-400 text-xs mt-1">PNG, JPG up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="mt-6 text-center">
                <img src={image} alt="Upload Preview" className="max-h-64 rounded-lg border border-slate-200 mx-auto mb-4 object-contain" />
                <button onClick={runOCR} disabled={loading} className="w-full bg-emerald-600 text-white font-medium px-4 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50">
                  {loading ? 'Extracting Data...' : 'Extract & Map Fields'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SIDE-BY-SIDE REVIEW */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Scanned Document */}
            <div className="border border-slate-200 rounded-xl p-2 bg-slate-50 h-[600px] overflow-auto flex items-start justify-center">
              <img src={image} alt="Scanned PDS" className="max-w-full object-contain" />
            </div>

            {/* Right: Extracted Form */}
            <div className="border border-slate-200 rounded-xl p-6 bg-white h-[600px] overflow-auto shadow-sm">
              <h3 className="font-bold text-lg mb-2 text-slate-900">Interactive Field Mapping</h3>
              <p className="text-sm text-slate-500 mb-6">Verify and correct the extracted fields before saving.</p>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">First Name</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Last Name</label>
                    <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Middle Name</label>
                  <input type="text" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.middle_name} onChange={e => setFormData({...formData, middle_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Email</label>
                  <input type="email" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Date of Birth</label>
                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 block mb-1">Date Hired</label>
                    <input type="date" className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={formData.date_hired} onChange={e => setFormData({...formData, date_hired: e.target.value})} />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 mt-6">
                  <button onClick={handleRegisterEmployee} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors font-bold shadow-sm">
                    <Save size={20} /> Register as New Employee
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <details className="text-sm text-slate-500">
                  <summary className="cursor-pointer font-medium hover:text-slate-700">View Raw Extracted Text</summary>
                  <textarea className="w-full h-32 border border-slate-200 p-3 mt-2 font-mono text-xs rounded-lg bg-slate-50" value={text} readOnly />
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}