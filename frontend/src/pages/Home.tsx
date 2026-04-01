import { useState } from 'react';
import UploadStation from '../components/UploadStation';
import ResultsViewer from '../components/ResultsViewer';
import FAQ from '../components/FAQ';
import GlobalStats from '../components/GlobalStats';
import { X } from 'lucide-react';

const Home = () => {
  const [resultData, setResultData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1.5rem 0' }}>

      <GlobalStats />

      <div className="dashboard-grid">

        {/* Core Workspace - Ultra Clean Upload Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <UploadStation onResult={(data) => setResultData(data)} isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>

        {/* Compressed Side FAQ Panel */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <FAQ />
        </div>

      </div>

      {/* Modal Dialog for Results - Responsive Design */}
      {resultData && (
        <div
          style={{
            position: 'fixed', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999,
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)'
          }}
          className="animate-slide-up"
          onClick={() => setResultData(null)}
        >
          <div
            className="glass-panel"
            style={{
              position: 'relative', width: '90%', maxWidth: '800px', maxHeight: '90vh',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
              background: 'rgba(19, 27, 47, 0.98)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              padding: 0,
              borderRadius: '20px'
            }}
            onClick={(e) => e.stopPropagation()}
          >

            {/* Compact Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Neuro<span className="gradient-text">Analysis</span> Report</span>
              <button
                onClick={() => setResultData(null)}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', borderRadius: '50%', color: 'white', cursor: 'pointer', display: 'flex', padding: '6px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Scrollable Area */}
            <div style={{ overflowY: 'auto', flex: 1, padding: '0' }}>
              <ResultsViewer data={resultData} />
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
