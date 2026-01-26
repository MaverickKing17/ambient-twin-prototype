
import React, { ReactNode, useState } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'premium' | 'danger';
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
    default: 'border-white/10 hover:border-white/20',
    premium: 'border-orange-500/30 hover:border-orange-500/50 bg-orange-500/[0.02]',
    danger: 'border-red-500/30 hover:border-red-500/50 bg-red-500/[0.02]',
  };

  return (
    <div 
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative overflow-hidden rounded-xl
        bg-[#0f172a]/40 backdrop-blur-2xl 
        border transition-all duration-500 ease-out
        shadow-[0_8px_32px_0_rgba(0,0,0,0.8)]
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {/* Interactive Spotlight Effect */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, rgba(249, 115, 22, 0.1), transparent 40%)`
        }}
      />
      
      {/* Structural accent line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {(title || icon) && (
        <div className="flex items-center justify-between p-5 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-3">
            {icon && <span className="text-orange-500 filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]">{icon}</span>}
            {title && <h3 className="text-sm font-bold text-white uppercase tracking-[0.15em]">{title}</h3>}
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
        </div>
      )}
      
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};
