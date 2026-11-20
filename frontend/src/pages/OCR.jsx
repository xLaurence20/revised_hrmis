import { useState } from 'react';
import api from '../api';
import { Upload, Calculator, UserPlus, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

// ... (keep your state and parsePDS function exactly the same) ...

  const runOCR = async (e) => {
    // 1. Get the actual file from the input
    const file = e.target.files[0]; 
    if (!file) return;
    
    // Update preview
    setImage(URL.createObjectURL(file));
    setLoading(true);
    setProgress(50); // Fake progress for API call
    
    try {
      // 2. Prepare FormData for OCR.space API
      const formData = new FormData();
      formData.append('file', file);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');
      formData.append('isTable', 'true'); // MAGIC BULLET: Tells API this is a table
      formData.append('OCREngine', '2');  // Engine 2 is much better for handwriting and tables

      // 3. Send to OCR.space (Replace 'helloworld' with your actual free API key)
      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          'apikey': 'K8419139331553688957', // PUT YOUR FREE API KEY HERE
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.IsErroredOnProcessing) {
        throw new Error(response.data.ErrorMessage[0]);
      }

      const extractedText = response.data.ParsedResults[0].ParsedText;
      setText(extractedText);
      
      // 4. Run parser
      const parsedData = parsePDS(extractedText);
      setFormData(prev => ({ ...prev, ...parsedData }));
      setStep(2); 
    } catch (err) {
      console.error(err);
      alert('OCR Failed: ' + err.message);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };