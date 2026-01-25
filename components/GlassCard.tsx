import React, { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, icon }) => {
  return (
    <div className={`
      relative overflow-hidden rounded-md 
      bg-white/5 backdrop-blur-xl 
      border border-white/10 
      shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] 
      hover:border-white/20 transition-colors duration-300
      ${className}
    `}>
      {/* Decorative gradient blob inside card - Orange accent */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {(title || icon) && (
        <div className="flex items-center gap-3 p-5 border-b border-white/5">
          {icon && <span className="text-orange-400">{icon}</span>}
          {title && <h3 className="text-lg font-semibold text-white tracking-wide">{title}</h3>}
        </div>
      )}
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};