import { useState } from 'react';
import Tesseract from 'tesseract.js';
import api from '../api';
import { Upload, CheckCircle, Calculator, UserPlus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function OCR() {
  const navigate = useNavigate();
  
  // OCR State
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1 = Upload, 2 = Review

  // Form State
  const [formData, setFormData] = useState({
    first_name: '', last_name: '', email: '', birth_date: '', date_hired: new Date().toISOString().split('T')[0]
  });

  // TLB State (Kept from previous phase)
  const [empId, setEmpId] = useState('');
  const [tlbResult, setTlbResult] = useState(null);

  // Simple Heuristic Parser for PDS
  const parsePDS = (rawText) => {
    const lines = rawText.split('\n').map(l => l.trim()).filter(l => l);
    let parsed = { ...formData };

    lines.forEach((line, index) => {
      const upper = line.toUpperCase();
      
      // Look for SURNAME
      if (upper.includes('SURNAME') && index + 1 < lines.length) {
        parsed.last_name = lines[index + 1].replace(/[^a-zA-Z ]/g, '');
      }
      // Look for FIRST NAME
      if (upper.includes('FIRST NAME') && index + 1 < lines.length) {
        parsed.first_name = lines[index + 1].replace(/[^a-zA-Z ]/g, '');
      }
      // Look for DATE OF BIRTH
      if (upper.includes('DATE OF BIRTH') && index + 1 < lines.length) {
        // Attempt to find a date format DD/MM/YYYY or similar
        const dateMatch = lines[index + 1].match(/(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
        if (dateMatch) parsed.birth_date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
      }
      // Look for EMAIL
      if (upper.includes('E-MAIL') && index + 1 < lines.length) {
        const emailMatch = lines[index + 1].match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) parsed.email = emailMatch[0];
      }
    });

    return parsed;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText('');
      setProgress(0);
      setStep(1);
    }
  };

  const runOCR = async () => {
    if (!image) return;
    setLoading(true);
    
    try {
      const result = await Tesseract.recognize(
        image,
        'eng',
        { logger: m => { if (m.status === 'recognizing text') setProgress(Math.round(m.progress * 100)); } }
      );
      setText(result.data.text);
      
      // Parse text into form fields
      const extractedData = parsePDS(result.data.text);
      setFormData(prev => ({ ...prev, ...extractedData }));
      setStep(2); // Move to review step
    } catch (err) {
      console.error(err);
      alert('OCR Failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterEmployee = async () => {
    try {
      await api.post('/employees', formData);
      alert('Employee Registered Successfully!');
      navigate('/employees'); // Redirect to directory
    } catch (err) {
      alert(err.response?.data?.error || 'Error registering employee');
    }
  };

  const handleTLB = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.get(`/tlb/calculate/${empId}`);
      setTlbResult(data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error computing TLB');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      
      {/* TLB CALCULATOR */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <Calculator className="text-blue-600" /> Terminal Leave Benefits Calculator
        </h2>
        <form onSubmit={handleTLB} className="flex gap-4 items-end">
          <div>
            <label className="text-sm text-gray-500 block mb-1">Employee ID</label>
            <input type="number" required className="border p-2 rounded w-48" value={empId} onChange={e => setEmpId(e.target.value)} placeholder="e.g. 1" />
          </div>
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Calculate TLB</button>
        </form>

        {tlbResult && (
          <div className="mt-4 p-4 bg-blue-50 rounded border border-blue-100">
            <p className="font-bold text-lg text-blue-900">{tlbResult.employee}</p>
            <p className="text-sm text-blue-800">Total Leave Credits: {tlbResult.totalCredits} days</p>
            <p className="text-sm text-blue-800">Daily Rate: ₱{tlbResult.dailyRate}</p>
            <p className="text-xl font-bold text-blue-600 mt-2">Estimated TLB: ₱{tlbResult.tlbAmount}</p>
          </div>
        )}
      </div>

      {/* OCR PARSING */}
      <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="text-green-600" /> PDS Document Parsing
          </h2>
          {step === 2 && (
            <button onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">Upload New Document</button>
          )}
        </div>
        
        {/* STEP 1: UPLOAD */}
        {step === 1 && (
          <div className="max-w-xl mx-auto">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-10 h-10 text-gray-400 mb-2" />
              <span className="text-gray-500">Upload Scanned PDS (Image)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="mt-4 text-center">
                <img src={image} alt="Upload Preview" className="max-h-64 rounded border mx-auto mb-4" />
                <button onClick={runOCR} disabled={loading} className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                  {loading ? `Extracting Data... ${progress}%` : 'Extract & Map Fields'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* STEP 2: SIDE-BY-SIDE REVIEW */}
        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Scanned Document */}
            <div className="border rounded-lg p-2 bg-gray-50 h-[600px] overflow-auto">
              <img src={image} alt="Scanned PDS" className="w-full object-contain" />
            </div>

            {/* Right: Extracted Form */}
            <div className="border rounded-lg p-6 bg-white h-[600px] overflow-auto">
              <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Interactive Field Mapping</h3>
              <p className="text-xs text-gray-500 mb-4">Verify and correct the extracted fields before saving.</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 block mb-1">First Name</label>
                  <input type="text" className="w-full border p-2 rounded" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Last Name</label>
                  <input type="text" className="w-full border p-2 rounded" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Email</label>
                  <input type="email" className="w-full border p-2 rounded" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Date of Birth</label>
                  <input type="date" className="w-full border p-2 rounded" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm text-gray-500 block mb-1">Date Hired</label>
                  <input type="date" className="w-full border p-2 rounded" value={formData.date_hired} onChange={e => setFormData({...formData, date_hired: e.target.value})} />
                </div>

                <div className="pt-4 border-t">
                  <button onClick={handleRegisterEmployee} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded hover:bg-blue-700 font-bold">
                    <Save size={20} /> Register as New Employee
                  </button>
                </div>
              </div>

              <div className="mt-8">
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer font-bold mb-2">View Raw Extracted Text</summary>
                  <textarea className="w-full h-32 border p-2 mt-2 font-mono" value={text} readOnly />
                </details>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}