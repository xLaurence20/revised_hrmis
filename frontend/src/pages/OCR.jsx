import { useState, useEffect } from 'react';
import axios from 'axios';
import api from '../api';
import { Upload, Calculator, UserPlus, Save } from 'lucide-react';
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

  // TLB State
  const [empId, setEmpId] = useState('');
  const [tlbResult, setTlbResult] = useState(null);
  
  // NEW: Employee List State for Dropdown
  const [employees, setEmployees] = useState([]);

  // Fetch employees on mount for the dropdown
  useEffect(() => {
    api.get('/employees')
      .then(res => setEmployees(res.data))
      .catch(err => console.error('Failed to load employees:', err));
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
    if (!empId) return toast.error('Please select an employee first');
    
    const loadingToast = toast.loading('Calculating TLB...');
    try {
      const { data } = await api.get(`/tlb/calculate/${empId}`);
      setTlbResult(data);
      toast.success('Calculation complete', { id: loadingToast });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error computing TLB', { id: loadingToast });
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      
      {/* TLB CALCULATOR */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-slate-900">
          <Calculator className="text-blue-600" /> Terminal Leave Benefits Calculator
        </h2>
        <form onSubmit={handleTLB} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="w-full sm:w-96">
            <label className="text-sm font-medium text-slate-700 block mb-1">Select Employee</label>
            <select 
              required 
              className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-slate-700" 
              value={empId} 
              onChange={e => setEmpId(e.target.value)}
            >
              <option value="">-- Choose an employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.last_name}, {emp.first_name} ({emp.employee_no})
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="w-full sm:w-auto bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            Calculate TLB
          </button>
        </form>

        {tlbResult && (
          <div className="mt-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col gap-1">
            <p className="font-bold text-lg text-blue-900">{tlbResult.employee}</p>
            <div className="flex gap-4 mt-2">
               <p className="text-sm text-slate-600">Credits: <span className="font-semibold text-slate-900">{tlbResult.totalCredits} days</span></p>
               <p className="text-sm text-slate-600">Daily Rate: <span className="font-semibold text-slate-900">₱{tlbResult.dailyRate}</span></p>
            </div>
            <p className="text-2xl font-bold text-blue-600 mt-3 border-t border-blue-200 pt-3">Est. TLB: ₱{tlbResult.tlbAmount}</p>
          </div>
        )}
      </div>

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