import React from 'react';

export const Card = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-xl border border-border-default shadow-surface ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-5 border-b border-border-default ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-base font-bold text-text-main ${className}`}>
    {children}
  </h3>
);

export const CardContent = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);
