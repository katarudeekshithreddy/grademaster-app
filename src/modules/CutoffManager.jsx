import React from 'react';
import { Card } from '../components/UI/Card';
import { Input } from '../components/UI/Input';
import { AlertCircle, Sliders } from 'lucide-react';

export function CutoffManager({ stats, cutoffs, setCutoffs }) {
  const handleCutoffChange = (index, value) => {
    const updated = [...cutoffs];
    updated[index].cutoff = Number(value);
    setCutoffs(updated);
  };

  let overlapError = null;
  for (let i = 0; i < cutoffs.length - 1; i++) {
    if (cutoffs[i].cutoff <= cutoffs[i + 1].cutoff) {
      overlapError = `Cutoff for ${cutoffs[i].grade} must be strictly greater than ${cutoffs[i + 1].grade}`;
      break;
    }
  }

  const getGradeColor = (grade) => {
      if (grade.startsWith('A')) return 'var(--status-success)';
      if (grade.startsWith('B')) return 'var(--status-info)';
      if (grade.startsWith('C')) return 'var(--status-warning)';
      return 'var(--status-error)';
  };

  return (
    <Card className="glass-panel premium-card animate-fade-in" style={{ position: 'relative', overflow: 'hidden', border: overlapError ? '1px solid var(--status-error)' : undefined }}>
      <div style={{ position: 'absolute', bottom: '-40px', right: '10%', width: '150px', height: '150px', background: 'var(--accent-primary)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, opacity: 0.15 }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Sliders size={20} color="var(--accent-primary)" />
          <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>Adaptive Cutoff Control</h3>
        </div>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          System statistically optimized cutoffs based on µ={stats.mean} and σ={stats.stdDev}
        </p>

        {overlapError && (
          <div style={{ padding: '0.75rem', background: 'var(--error-bg)', color: 'var(--status-error)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{overlapError}</span>
          </div>
        )}

        {stats.stdDev === 0 && (
          <div style={{ padding: '0.75rem', background: 'var(--warning-bg)', color: 'var(--status-warning)', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
            Standard Deviation is 0. Cutoffs disabled. Everyone will receive the same grade.
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem' }}>
          {cutoffs.map((c, idx) => {
            const color = getGradeColor(c.grade);
            return (
              <div key={c.grade} style={{ 
                  background: 'var(--bg-secondary)', 
                  border: `1px solid rgba(255,255,255,0.05)`, 
                  borderTop: `3px solid ${color}`, 
                  padding: '1rem', 
                  borderRadius: '12px',
                  boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)'
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>GRADE</span>
                  <span style={{ color: color, fontWeight: 700 }}>{c.grade}</span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number"
                    value={c.cutoff}
                    disabled={c.grade === 'F'}
                    onChange={(e) => handleCutoffChange(idx, e.target.value)}
                    style={{
                       width: '100%',
                       background: 'transparent',
                       border: 'none',
                       borderBottom: `2px solid ${c.grade === 'F' ? 'transparent' : 'var(--border-light)'}`,
                       color: 'var(--text-primary)',
                       fontWeight: '700',
                       fontSize: '1.25rem',
                       padding: '0.25rem 0',
                       outline: 'none',
                       transition: 'all 0.2s',
                       pointerEvents: c.grade === 'F' ? 'none' : 'auto'
                    }}
                    onFocus={(e) => e.target.style.borderBottomColor = color}
                    onBlur={(e) => e.target.style.borderBottomColor = 'var(--border-light)'}
                  />
                  <span style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>&gt;=</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
