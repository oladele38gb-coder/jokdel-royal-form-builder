import React from 'react';
import logoImg from '../../assets/jokdel_royal_logo.jpg';

interface LogoProps {
  variant?: 'full' | 'inline' | 'compact';
  className?: string;
  height?: number;
}

export const Logo: React.FC<LogoProps> = ({ variant = 'inline', className = '', height = 80 }) => {
  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${className}`}>
        <img
          src={logoImg}
          alt="Jokdel Royal"
          style={{ height: '72px' }}
          className="w-auto object-contain"
        />
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <img
          src={logoImg}
          alt="Jokdel Royal"
          style={{ height: `${height * 3}px` }}
          className="w-auto object-contain"
        />
      </div>
    );
  }

  // Inline header layout (default)
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={logoImg}
        alt="Jokdel Royal"
        style={{ height: `${height}px` }}
        className="w-auto object-contain"
      />
    </div>
  );
};
