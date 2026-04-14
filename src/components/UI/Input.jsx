import React from 'react';
import clsx from 'clsx';

export function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  className,
  wrapperClassName,
  ...props
}) {
  return (
    <div className={clsx('input-wrapper', wrapperClassName)} style={{ marginBottom: '1rem' }}>
      {label && (
        <label 
          htmlFor={id} 
          style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={clsx(className, error && 'input-error')}
        style={{
          borderColor: error ? 'var(--status-error)' : undefined
        }}
        {...props}
      />
      {error && (
        <p style={{ color: 'var(--status-error)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          {error}
        </p>
      )}
    </div>
  );
}
