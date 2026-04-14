import React from 'react';
import clsx from 'clsx';
import './Card.css'; // Optional: Can just rely on index.css or add specific module styles

export function Card({ children, className, style, ...props }) {
  return (
    <div 
      className={clsx('glass-panel', className)} 
      style={{ padding: '1.5rem', ...style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, className, action }) {
  return (
    <div style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} className={className}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{title}</h3>
        {subtitle && <p style={{ margin: 0, fontSize: '0.875rem', marginTop: '0.25rem' }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
