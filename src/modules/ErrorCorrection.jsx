import React, { useState } from 'react';
import { Card, CardHeader } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { Input } from '../components/UI/Input';
import { AlertCircle, CheckCircle, ArrowRight, ArrowLeft, ShieldAlert, FileWarning, Zap } from 'lucide-react';

export function ErrorCorrection({ errors, onBack }) {
  if (errors.length === 0) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Card className="glass-panel premium-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: '2.5rem' }}>
            <div style={{ position: 'absolute', inset: -20, background: 'var(--status-success)', opacity: 0.15, filter: 'blur(30px)', borderRadius: '50%' }} />
            <CheckCircle size={80} color="var(--status-success)" style={{ position: 'relative' }} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Integrity Check Passed</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '3rem', fontSize: '1.1rem' }}>The validation pipeline confirms all data points are within protocol parameters. You are ready for executive analysis.</p>
          <Button 
            variant="primary" 
            size="lg" 
            onClick={() => window.dispatchEvent(new CustomEvent('nav-step', { detail: 'preview' }))} 
            icon={ArrowRight}
            style={{ padding: '1.25rem 4rem', fontSize: '1.1rem', borderRadius: '16px' }}
          >
            Launch Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Diagnostic Conflict Review</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Data integrity guard requires manual intervention for the following records.</p>
      </div>
      
      <div style={{ 
        padding: '2rem', 
        background: 'rgba(239, 68, 68, 0.03)', 
        border: '1px solid rgba(239, 68, 68, 0.2)', 
        borderRadius: '24px', 
        marginBottom: '3rem', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '2rem' 
      }}>
        <div style={{ padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '15px' }}>
          <ShieldAlert size={40} color="var(--status-error)" />
        </div>
        <div>
          <strong style={{ color: 'var(--status-error)', fontSize: '1.25rem', display: 'block' }}>
            Protocol Breach: {errors.length} Critical Deviations
          </strong>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            To prevent statistical corruption, you must correct these values in your master Excel file and perform a secondary ingestion.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1.25rem', marginBottom: '4rem' }}>
        {errors.map(error => (
           <Card key={error.cellId} className="glass-panel" style={{ 
             borderLeft: '4px solid var(--status-error)', 
             background: 'rgba(255, 255, 255, 0.01)', 
             padding: '1.75rem' 
           }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                <div style={{ flex: '1.2' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Reference Identity</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)' }}><Zap size={14} color="var(--accent-primary)" /></div>
                    <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{error.studentId}</strong>
                  </div>
                </div>
                
                <div style={{ flex: '1' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Target Metric</div>
                  <strong style={{ color: 'var(--accent-primary)' }}>{error.column}</strong>
                </div>

                <div style={{ flex: '2' }}>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '0.5rem' }}>Diagnostic Observation</div>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <strong style={{ color: 'var(--status-error)', fontSize: '0.95rem' }}>{error.issue}</strong>
                      <div style={{ padding: '0.25rem 0.6rem', border: '1px solid var(--border-light)', borderRadius: '6px', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        Current Value: {error.currentValue || 'NULL'}
                      </div>
                   </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '120px', paddingLeft: '1.5rem', borderLeft: '1px solid var(--border-light)' }}>
                   <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 800 }}>Limit Profile</div>
                   <strong style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>0 - {error.maxMarks}</strong>
                </div>
              </div>
           </Card>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', paddingBottom: '4rem' }}>
         <Button variant="secondary" size="lg" onClick={onBack} icon={ArrowLeft} style={{ padding: '1.25rem 3rem', borderRadius: '16px' }}>
            Modify Ingestion Package
         </Button>
      </div>
    </div>
  );
}
