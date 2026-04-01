import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Loader2, Image as ImageIcon } from 'lucide-react';
import { API_BASE_URL } from '../config';

interface UploadStationProps {
  onResult: (data: any) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

const UploadStation: React.FC<UploadStationProps> = ({ onResult, isLoading, setIsLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile: File) => {
    setError(null);
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleScan = async () => {
    if (!file) return;
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.error) {
        setError(res.data.error);
      } else {
        onResult(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'An error occurred during scan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ width: '100%' }}>
      <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <ImageIcon size={20} className="gradient-text"/> Scan MRI Image
      </h3>
      
      {!preview ? (
        <form 
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          style={{
            border: `2px dashed ${dragActive ? 'var(--accent-bl)' : 'var(--border-light)'}`,
            borderRadius: '12px',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: dragActive ? 'rgba(59, 130, 246, 0.05)' : 'rgba(255, 255, 255, 0.01)',
            transition: 'all 0.2s',
            minHeight: '180px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept="image/*" onChange={handleChange} style={{ display: 'none' }} />
          <UploadCloud size={48} color={dragActive ? 'var(--accent-bl)' : 'var(--text-secondary)'} style={{ marginBottom: '1rem' }}/>
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Drag & drop your MRI scan here</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>or click to browse files</p>
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '1rem', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
            <img src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '180px', display: 'block' }} />
            {isLoading && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(10, 15, 26, 0.7)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backdropFilter: 'blur(4px)' }}>
                <Loader2 className="animate-spin" size={32} color="var(--accent-pu)" />
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button className="btn-secondary" onClick={() => { setFile(null); setPreview(null); setError(null); }} disabled={isLoading} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              Select Different
            </button>
            <button className={`btn-primary ${isLoading ? 'btn-disabled' : ''}`} onClick={handleScan} disabled={isLoading} style={{ padding: '0.6rem 1.2rem', fontSize: '0.9rem' }}>
              Run Diagnostics
            </button>
          </div>
        </div>
      )}
      
      {error && (
        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
          {error}
        </div>
      )}
    </div>
  );
};

export default UploadStation;
