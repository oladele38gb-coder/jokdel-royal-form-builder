import React from 'react';
import letterheadLogo from '../../assets/jokdel_royal_letterhead_logo.png';

interface LogoProps {
  variant?: 'inline' | 'stacked';
  height?: number;
  className?: string;
  invert?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  variant = 'inline',
  height = 52,
  className = '',
}) => {
  return (
    <img
      src={letterheadLogo}
      alt="Jokdel Royal Nig. Ltd"
      style={{ height: `${height}px`, objectFit: 'contain' }}
      className={className}
    />
  );
};
