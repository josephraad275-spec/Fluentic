import React from 'react';

interface FluenticLogoProps {
  variant?: 'full' | 'horizontal' | 'icon' | 'badge';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showTagline?: boolean;
}

export const FluenticLogo: React.FC<FluenticLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  showTagline = true,
}) => {
  // Dimension presets
  const iconDimensions = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-4xl',
  }[size];

  // SVG Emblem of Fluentic (F speech bubble with gold stars & gold swoop)
  const Emblem = ({ customClass = '' }: { customClass?: string }) => (
    <svg
      viewBox="0 0 260 270"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconDimensions} shrink-0 transition-transform duration-300 ${customClass}`}
      aria-label="Fluentic logo emblem"
    >
      <defs>
        <linearGradient id="fl-gold-swoosh" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#C5A059" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#F5D77F" />
        </linearGradient>

        <linearGradient id="fl-star-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#C5A059" />
        </linearGradient>

        <linearGradient id="fl-navy-body" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1B365D" />
          <stop offset="60%" stopColor="#0F2137" />
          <stop offset="100%" stopColor="#0B1B3D" />
        </linearGradient>

        <filter id="fl-subtle-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#D4AF37" floodOpacity="0.3" />
        </filter>
      </defs>

      {/* Top-Left Sparkle Stars */}
      {/* Upper Large 4-point Star */}
      <path
        d="M 44 14 Q 44 32 26 32 Q 44 32 44 50 Q 44 32 62 32 Q 44 32 44 14 Z"
        fill="url(#fl-star-gold)"
        filter="url(#fl-subtle-glow)"
      />
      {/* Lower Small 4-point Star */}
      <path
        d="M 22 48 Q 22 60 10 60 Q 22 60 22 72 Q 22 60 34 60 Q 22 60 22 48 Z"
        fill="url(#fl-star-gold)"
      />

      {/* Main Navy Speech-Bubble F Spine and Upper Arch */}
      <path
        d="M 52 248
           L 52 196
           C 36 180 26 150 26 116
           C 26 50 74 14 146 14
           L 214 14
           C 226 14 236 24 236 36
           C 236 48 226 58 214 58
           L 146 58
           C 112 58 76 76 76 118
           C 76 142 80 170 94 192
           L 52 248 Z"
        fill="url(#fl-navy-body)"
      />

      {/* Two Horizontal Inner Speech Bars (the F rungs) */}
      <rect x="100" y="86" width="76" height="22" rx="11" fill="url(#fl-navy-body)" />
      <rect x="100" y="126" width="56" height="22" rx="11" fill="url(#fl-navy-body)" />

      {/* Flowing Golden Swoosh wrapping the lower-right perimeter */}
      <path
        d="M 84 186
           C 104 206 132 218 164 218
           C 196 218 224 196 236 164
           C 238 156 238 144 238 126
           C 238 118 244 116 247 122
           C 250 134 250 152 244 174
           C 230 220 190 244 148 244
           C 112 244 80 228 58 202
           Z"
        fill="url(#fl-gold-swoosh)"
        filter="url(#fl-subtle-glow)"
      />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <Emblem />
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div className={`inline-flex flex-col items-center justify-center p-4 rounded-3xl bg-white shadow-lg border border-slate-200/90 ${className}`}>
        <Emblem customClass="w-16 h-16 sm:w-20 sm:h-20" />
        <div className="mt-2 text-center">
          <span className="text-xl sm:text-2xl font-black tracking-tight text-[#0B1B3D] flex items-center justify-center">
            Fluent<span className="relative">i<span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#C59239]" /></span>c
          </span>
          {showTagline && (
            <p className="text-[11px] sm:text-xs font-semibold text-slate-600 mt-0.5 tracking-wide">
              <span className="text-[#C59239] font-bold">— </span>
              Fluent in <span className="text-[#C59239] font-bold italic">every </span>word.
              <span className="text-[#C59239] font-bold"> —</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <div className="relative group">
          <Emblem customClass="w-24 h-24 sm:w-32 sm:h-32 transition-transform group-hover:scale-105 duration-300" />
        </div>
        <div className="mt-2 flex items-center justify-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0B1B3D]">
            Fluent<span className="relative inline-block">i<span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gradient-to-tr from-[#9E6F22] to-[#E2B85E] shadow-sm" /></span>c
          </h1>
        </div>
        {showTagline && (
          <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1 tracking-wide">
            <span className="text-[#C59239] font-bold">— </span>
            Fluent in <span className="text-[#C59239] font-bold italic">every </span>word.
            <span className="text-[#C59239] font-bold"> —</span>
          </p>
        )}
      </div>
    );
  }

  // Default: 'horizontal' (ideal for header bars & navbar)
  return (
    <div className={`inline-flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      <Emblem customClass="group-hover:scale-105 transition-transform" />
      <div className="flex flex-col justify-center leading-none text-left">
        <span className={`${textSizes} font-extrabold tracking-tight text-[#0B1B3D] flex items-center`}>
          Fluent<span className="relative">i<span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gradient-to-tr from-[#9E6F22] to-[#E2B85E]" /></span>c
        </span>
        {showTagline && size !== 'sm' && (
          <span className="text-[10px] font-semibold text-slate-500 mt-0.5 tracking-tight hidden sm:inline-block">
            <span className="text-[#C59239] font-bold">— </span>
            Fluent in <span className="text-[#C59239] font-bold italic">every </span>word.
            <span className="text-[#C59239] font-bold"> —</span>
          </span>
        )}
      </div>
    </div>
  );
};
