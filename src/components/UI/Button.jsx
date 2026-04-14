import React from 'react';
import clsx from 'clsx';
import './Button.css'; // Assuming we'll make a small button.css for specific state styles

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className, 
  onClick, 
  disabled,
  type = 'button',
  fullWidth = false,
  icon: Icon
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'btn',
        `btn-${variant}`,
        `btn-size-${size}`,
        fullWidth && 'btn-full-width',
        className
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 16 : 20} className="btn-icon" />}
      {children}
    </button>
  );
}
