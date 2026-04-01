import React from 'react';
import { AlertCircle, FileStack } from 'lucide-react';

interface Prediction {
  class_name: string;
  confidence: number;
  box: number[];
}

interface ResultsViewerProps {
  data: {
    annotated_image: string;
    predictions: Prediction[];
    filename?: string;
  };
}

const ResultsViewer: React.FC<ResultsViewerProps> = ({ data }) => {
  const { annotated_image, predictions } = data;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '0.85rem' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
        <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid var(--border-light)', display: 'flex', justifyContent: 'center', padding: '0.4rem', minHeight: '250px', background: 'rgba(0,0,0,0.2)' }}>
          <img src={annotated_image} alt="Annotated Scan" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', justifyContent: 'flex-start' }}>
          <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', opacity: 0.7 }}>ANALYSIS LOG</h4>
          {predictions && predictions.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {predictions.map((p, idx) => (
                <div key={idx} style={{ padding: '0.75rem 1rem', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', borderLeft: `3px solid ${p.confidence > 0.8 ? '#10b981' : '#f59e0b'}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize', fontSize: '0.95rem' }}>{p.class_name} Tumor</span>
                    <span style={{ fontWeight: 500, color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{(p.confidence * 100).toFixed(1)}% Match</span>
                  </div>
                  <div style={{ width: '100%', background: 'rgba(255, 255, 255, 0.1)', height: '4px', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p.confidence * 100}%`, background: p.confidence > 0.8 ? '#10b981' : '#f59e0b', borderRadius: '2px', transition: 'width 1s ease-in-out' }}></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <AlertCircle size={32} color="#10b981" />
              <p>No tumors detected in this scan.</p>
            </div>
          )}
          
          <div style={{ marginTop: 'auto', paddingTop: '1.5rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <strong>Disclaimer:</strong> This YOLOv8+SCC model prediction is for research purposes only and should not replace professional medical diagnosis.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsViewer;
