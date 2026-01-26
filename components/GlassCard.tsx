
import React, { ReactNode, useState } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'premium' | 'danger' | 'mica';
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '', title, icon, variant = 'default' }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const variantStyles = {
    default: 'border-white/5 bg-white/[0.02]',
    premium: 'border-orange-500/20 bg-orange-500/[0.01]',
    danger: 'border-red-500/20 bg-red-500/[0.01]',
    mica: 'border-white/10 bg-white/[0.04] backdrop-blur-3xl shadow-2xl',
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-lg
        border transition-all duration-300 ease-in-out
        ${variantStyles[variant === 'mica' ? 'mica' : variant]}
        ${className}
      `}
    >
      {/* Dynamic Glow Layer */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(255, 255, 255, 0.05), transparent 60%)`
        }}
      />
      
      {/* Header Bar */}
      {(title || icon) && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-3">
            {icon && <span className="text-white/60">{icon}</span>}
            {title && <h3 className="text-[11px] font-bold text-white/80 uppercase tracking-[0.15em]">{title}</h3>}
          </div>
          <div className="flex gap-1">
             <div className="w-1 h-1 rounded-full bg-white/20" />
             <div className="w-1 h-1 rounded-full bg-white/10" />
          </div>
        </div>
      )}
      
      <div className="p-5">
        {children}
      </div>
    </div>
  );
};