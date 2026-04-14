import React from 'react';
import { Button } from '../components/UI/Button';
import { ArrowRight, Terminal, Shield, BarChart3, Users } from 'lucide-react';
import logo from '../assets/logo.png';

export function Authentication({ onLogin }) {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      background: 'var(--bg-primary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      color: 'white'
    }}>
      {/* Bioluminescent Background Orbs */}
      <div className="glow-orb" style={{ position: 'absolute', top: '10%', left: '20%', width: '500px', height: '500px', background: 'var(--accent-primary)', opacity: 0.08, borderRadius: '50%' }} />
      <div className="glow-orb" style={{ position: 'absolute', bottom: '15%', right: '15%', width: '400px', height: '400px', background: 'var(--accent-secondary)', opacity: 0.08, borderRadius: '50%', animationDelay: '-2s' }} />
      
      {/* Decorative Grid Mesh */}
      <div style={{ 
        position: 'absolute', inset: 0, 
        backgroundImage: 'radial-gradient(var(--border-light) 1px, transparent 1px)', 
        backgroundSize: '40px 40px', 
        opacity: 0.1, 
        maskImage: 'radial-gradient(circle at center, black, transparent 80%)' 
      }} />

      <div style={{ textAlign: 'center', zIndex: 1, padding: '2rem' }} className="animate-fade-in">
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          width: '100px', 
          height: '100px', 
          marginBottom: '2.5rem',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          borderRadius: '28px',
          padding: '12px',
          boxShadow: '0 0 40px rgba(6, 182, 212, 0.2)',
          border: '1px solid var(--border-color)'
        }}>
          <img src={logo} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{ 
            background: 'var(--success-bg)', 
            color: 'var(--status-success)', 
            padding: '0.4rem 1rem', 
            borderRadius: '100px', 
            fontSize: '0.75rem', 
            fontWeight: 700, 
            letterSpacing: '0.1em', 
            textTransform: 'uppercase',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            V3.0 Executive Edition
          </div>
        </div>

        <h1 style={{ 
          fontSize: '5rem', 
          lineHeight: 1,
          marginBottom: '1.5rem',
          background: 'linear-gradient(to bottom, #fff 40%, rgba(255,255,255,0.4))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Smart Statistical <br /> 
          <span style={{ color: 'var(--accent-primary)' }}>Grading System</span>
        </h1>
        
        <p style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-secondary)', 
          maxWidth: '650px', 
          margin: '0 auto 3.5rem auto',
          lineHeight: 1.6,
          fontWeight: 400
        }}>
          Unified assessment architecture featuring high-precision normalization, 
          iterative validation gated technology, and team-based analytics.
        </p>

        <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <FeatureBadge icon={BarChart3} label="Z-Score Analysis" />
          <FeatureBadge icon={Users} label="Team Integration" />
          <FeatureBadge icon={Shield} label="Data Guard" />
        </div>

        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => onLogin({ name: 'User' })}
          icon={ArrowRight}
          style={{ 
            padding: '1.5rem 5rem', 
            fontSize: '1.1rem', 
            borderRadius: '18px',
            boxShadow: '0 20px 50px rgba(6, 182, 212, 0.3)',
            fontWeight: 600
          }}
        >
          Initialize Workspace
        </Button>
      </div>

      <div style={{ 
        position: 'relative', 
        marginTop: '3rem',
        marginBottom: '2rem',
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        letterSpacing: '0.15em',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        zIndex: 1
      }}>
        DESIGNED & CREATED BY <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>TEAM DEBUGGERS</span> | SECURED SYSTEM
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: 0.6 }}>
      <Icon size={16} color="var(--accent-primary)" />
      <span style={{ fontSize: '0.8125rem', fontWeight: 500, letterSpacing: '0.02em' }}>{label}</span>
    </div>
  );
}
