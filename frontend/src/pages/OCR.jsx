import { useState } from 'react';
import Tesseract from 'tesseract.js';
import api from '../api';
import { Upload, FileText, CheckCircle, Calculator } from 'lucide-react';

export default function OCR() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState('');
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // TLB State
  const [empId, setEmpId] = useState('');
  const [tlbResult, setTlbResult] = useState(null);

  // Handle Image Upload & OCR
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setText('');
      setProgress(0);
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
    } catch (err) {
      console.error(err);
      alert('OCR Failed');
    } finally {
      setLoading(false);
    }
  };

  // Handle TLB Calculation
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
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <FileText className="text-green-600" /> Offline OCR Document Parsing
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Image Upload */}
          <div>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">Upload Scanned Document (Appointment/Service Record)</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
            {image && (
              <div className="mt-4">
                <img src={image} alt="Upload Preview" className="max-h-64 rounded border mx-auto" />
                <button onClick={runOCR} disabled={loading} className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
                  {loading ? `Parsing... ${progress}%` : 'Extract Text'}
                </button>
              </div>
            )}
          </div>

          {/* Right: Extracted Text */}
          <div>
            <label className="text-sm text-gray-500 block mb-1">Extracted Text (Editable)</label>
            <textarea 
              className="w-full border p-3 rounded h-80 font-mono text-sm" 
              placeholder="Extracted text will appear here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            {text && (
              <button className="mt-4 w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                <CheckCircle size={18}/> Map to Employee Record
              </button>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}