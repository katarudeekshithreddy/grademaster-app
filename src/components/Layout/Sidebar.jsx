import React from 'react';
import { Settings, LayoutDashboard, CheckCircle, Upload, ShieldCheck } from 'lucide-react';
import './Layout.css';
import logo from '../../assets/logo.png';

export function Sidebar({ currentStep, setCurrentStep, hasData }) {
  const steps = [
    { id: 'template', label: 'Architecture Setup', icon: Settings, disabled: false },
    { id: 'upload', label: 'Data Ingestion', icon: Upload, disabled: false },
    { id: 'validate', label: 'Diagnostic Review', icon: ShieldCheck, disabled: !hasData },
    { id: 'preview', label: 'Executive Dashboard', icon: LayoutDashboard, disabled: !hasData }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '36px', 
          height: '36px', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '10px',
          border: '1px solid var(--border-light)'
        }}>
          <img src={logo} alt="Logo" style={{ width: '22px', height: '22px' }} />
        </div>
        <h2 style={{ 
          fontSize: '1.2rem', 
          fontWeight: 800, 
          margin: 0, 
          background: 'linear-gradient(to right, #fff, var(--accent-primary))', 
          WebkitBackgroundClip: 'text', 
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.03em'
        }}>
          GradeMaster
        </h2>
      </div>

      <nav className="sidebar-nav">
        <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '1.5rem', paddingLeft: '1.25rem' }}>
          Assessment Pipeline
        </div>
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          return (
            <button
              key={step.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => !step.disabled && setCurrentStep(step.id)}
              disabled={step.disabled}
              style={{ opacity: step.disabled ? 0.3 : 1 }}
            >
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon size={20} color={isActive ? 'var(--accent-primary)' : 'currentColor'} />
                {isActive && (
                  <div style={{ position: 'absolute', inset: -4, background: 'var(--accent-primary)', opacity: 0.2, filter: 'blur(8px)', borderRadius: '50%' }} />
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: isActive ? 600 : 400 }}>{step.label}</span>
                <span style={{ fontSize: '0.6rem', color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)', opacity: 0.7 }}>Phase 0{idx + 1}</span>
              </div>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textAlign: 'center', marginBottom: '0.5rem' }}>
          V3.0.4 EXECUTIVE EDITION
        </div>
        <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', letterSpacing: '0.05em', textAlign: 'center' }}>
          Developed by <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>Team_Debuggers</span> © 2026
        </div>
      </div>
    </aside>
  );
}
