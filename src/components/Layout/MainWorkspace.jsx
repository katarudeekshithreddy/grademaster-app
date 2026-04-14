import React from 'react';
import { Activity } from 'lucide-react';

export function MainWorkspace({ children, title }) {
  return (
    <main className="main-workspace animate-fade-in">
      <header className="workspace-header">
        <div>
          <h1 style={{ letterSpacing: '-0.03em' }}>{title}</h1>
          <p style={{ margin: 0, fontSize: '0.8125rem', opacity: 0.6 }}>System Operation Node: 0x2441BC</p>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          background: 'rgba(255,255,255,0.03)',
          padding: '0.6rem 1.25rem',
          borderRadius: '12px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>System Status</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--status-success)' }}>Operational</div>
          </div>
          <Activity size={18} color="var(--status-success)" className="pulse-glow" />
        </div>
      </header>
      <div className="workspace-content custom-scrollbar">
        {children}
      </div>
    </main>
  );
}
