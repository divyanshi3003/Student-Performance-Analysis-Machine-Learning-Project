import React, { forwardRef } from 'react';

export const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && <label className="block text-sm font-medium text-text-main mb-1">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:border-indigo-500 
          ${error ? 'border-status-error-border focus:ring-status-error-border' : 'border-border-default focus:ring-primary-500'}`}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
