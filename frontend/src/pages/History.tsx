import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader2, ServerCrash, Clock, Activity, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../config';

const History = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/history`);
      if (res.data.error) {
        setError(res.data.error);
      } else {
        setHistory(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm('Are you strictly sure you want to permanently delete all scan records?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/history`);
        setHistory([]);
        setCurrentPage(1);
      } catch (err) {
        console.error("Failed to delete records", err);
      }
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader2 className="animate-spin" size={48} color="var(--accent-bl)" />
        <h3 style={{ color: 'var(--text-secondary)' }}>Loading Database...</h3>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ServerCrash size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2>Database Connection Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>{error}</p>
      </div>
    );
  }

  // Calculate slices
  const totalPages = Math.ceil(history.length / ITEMS_PER_PAGE);
  const currentItems = history.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={{ padding: '2.5rem 0 4rem 0' }}>
      
      {/* No header - Grid starts immediately below Navbar */}

      {history.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Activity size={48} color="var(--text-secondary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h2 style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>No Scans Cached</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>Run a diagnostic pipeline on the dashboard to populate SQLite memory.</p>
        </div>
      ) : (
        <>
          {/* Top-Right Controls */}
          <div className="animate-slide-up" style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '2rem', marginBottom: '1.5rem' }}>
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary"
                    style={{ padding: '6px', borderRadius: '50%', opacity: currentPage === 1 ? 0.3 : 1, display: 'flex' }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary"
                    style={{ padding: '6px', borderRadius: '50%', opacity: currentPage === totalPages ? 0.3 : 1, display: 'flex' }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Clear Button */}
            <button 
              onClick={handleClearHistory} 
              style={{ color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7, background: 'none', cursor: 'pointer', transition: 'all 0.2s', padding: '0.4rem 0.8rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.background = 'none'; }}
            >
              <Trash2 size={14} /> Clear Records
            </button>
          </div>

          <div className="grid animate-slide-up" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
            {currentItems.map((scan) => (
              <div key={scan._id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem', background: 'var(--bg-primary)' }}>
                  <img src={scan.annotated_image} alt={scan.filename} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {new Date(scan.timestamp * 1000).toLocaleString()}
                  </span>
                </div>
                
                <div style={{ marginTop: 'auto' }}>
                  {scan.predictions && scan.predictions.length > 0 ? (
                    scan.predictions.map((p: any, i: number) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem' }}>
                        <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{p.class_name}</span>
                        <span style={{ color: p.confidence > 0.8 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{(p.confidence * 100).toFixed(1)}%</span>
                      </div>
                    ))
                  ) : (
                    <div style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '0.5rem', borderTop: '1px solid var(--border-light)', fontSize: '0.9rem', fontWeight: 600 }}>
                      Healthy Scan
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </>
      )}
    </div>
  );
};

export default History;
