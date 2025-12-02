import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] border border-slate-100 ${className}`}
    >
      {children}
    </div>
  );
};