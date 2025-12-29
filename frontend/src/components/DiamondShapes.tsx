import React from 'react';

interface DiamondProps {
  className?: string;
  style?: React.CSSProperties;
}

export const RoundDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="50" cy="50" r="45" />
    <polygon points="50,20 76,35 76,65 50,80 24,65 24,35" strokeWidth="1" />
    <polygon points="50,35 65,42.5 65,57.5 50,65 35,57.5 35,42.5" strokeWidth="0.5" />
  </svg>
);

export const PrincessDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="15" y="15" width="70" height="70" rx="2" />
    <rect x="30" y="30" width="40" height="40" strokeWidth="1" />
    <line x1="15" y1="15" x2="30" y2="30" strokeWidth="1" />
    <line x1="85" y1="15" x2="70" y2="30" strokeWidth="1" />
    <line x1="85" y1="85" x2="70" y2="70" strokeWidth="1" />
    <line x1="15" y1="85" x2="30" y2="70" strokeWidth="1" />
  </svg>
);

export const EmeraldDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="20,10 80,10 90,20 90,80 80,90 20,90 10,80 10,20" />
    <rect x="25" y="25" width="50" height="50" strokeWidth="1" />
    <line x1="10" y1="20" x2="25" y2="25" strokeWidth="1" />
    <line x1="90" y1="20" x2="75" y2="25" strokeWidth="1" />
    <line x1="90" y1="80" x2="75" y2="75" strokeWidth="1" />
    <line x1="10" y1="80" x2="25" y2="75" strokeWidth="1" />
  </svg>
);

export const PearDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M50,5 C50,5 90,60 90,75 C90,95 70,95 50,95 C30,95 10,95 10,75 C10,60 50,5 50,5 Z" />
    <path d="M50,25 C50,25 75,65 75,75 C75,85 65,85 50,85 C35,85 25,85 25,75 C25,65 50,25 50,25 Z" strokeWidth="1" />
  </svg>
);

export const OvalDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="50" cy="50" rx="30" ry="45" />
    <ellipse cx="50" cy="50" rx="18" ry="27" strokeWidth="1" />
  </svg>
);

export const HeartDiamond: React.FC<DiamondProps> = ({ className, style }) => (
  <svg viewBox="0 0 100 100" className={className} style={style} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M50,90 L15,55 A20,20 0 0,1 45,25 A10,10 0 0,1 50,35 A10,10 0 0,1 55,25 A20,20 0 0,1 85,55 Z" />
    <path d="M50,75 L30,55 A10,10 0 0,1 45,40 A5,5 0 0,1 50,45 A5,5 0 0,1 55,40 A10,10 0 0,1 70,55 Z" strokeWidth="1" />
  </svg>
);
