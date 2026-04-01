import { Globe, Heart, Users, CheckCircle } from 'lucide-react';

const GlobalStats = () => {
  // 2024 Global Projections based on GLOBOCAN 2022 + WHO Growth Models (1.8% CAGR)
  const estimatedIncidence2024 = 333400;
  const estimatedPrevalence2024 = 1243000;

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '900px',
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.75rem',
        marginBottom: '1.25rem',
        animation: 'slideUp 0.8s ease-out'
      }}
    >
      {/* Official Data Source Banner */}
      <div className="stats-card-mini glass-panel" style={{ padding: '0.5rem 1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
        <Globe size={18} color="var(--accent-bl)" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em' }}>DATA SOURCE</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={10} color="#10b981" />
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'white' }}>2024 GLOBAL ESTIMATES</span>
          </div>
        </div>
      </div>

      {/* 2024 Estimated Cases */}
      <div className="stats-card-mini glass-panel" style={{ padding: '0.5rem 1rem' }}>
        <Users size={18} className="glow-ruby" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>EST. NEW CASES (2024)</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }} className="glow-ruby">
            {estimatedIncidence2024.toLocaleString()}
          </span>
        </div>
      </div>

      {/* 2024 Estimated Prevalence */}
      <div className="stats-card-mini glass-panel" style={{ padding: '0.5rem 1rem' }}>
        <Heart size={18} className="glow-emerald" />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>TOTAL LIVING SURVIVORS</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace' }} className="glow-emerald">
            {estimatedPrevalence2024.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Official Data Source Footer */}
      <div style={{ width: '100%', textAlign: 'center', marginTop: '-0.25rem' }}>
        <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', opacity: 0.5, letterSpacing: '0.02em' }}>
          Projections: GLOBOCAN 2022 Baselines + WHO 2024 Global Pathology Growth Projections
        </span>
      </div>
    </div>
  );
};

export default GlobalStats;
