"use client";

import type { FormData, ThemeStyles } from "./types";

interface FormHeaderProps {
  form: FormData;
  currentIndex: number;
  totalFields: number;
  styles: ThemeStyles;
}

export function FormHeader({
  form,
  currentIndex,
  totalFields,
  styles,
}: FormHeaderProps) {
  return (
    <header
      className="h-14 px-6 flex items-center justify-between shrink-0 relative"
      style={{ color: styles.textColor }}
    >
      {/* Enhanced Japanese Theme Visual Elements (Global Background) */}
      {form.theme === 'japanese' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-[-1] fixed">
          {/* Celestial Element: Elegant Moon */}
          <div className="absolute top-[8%] right-[10%] w-24 h-24 bg-[#FFFDE7] rounded-full opacity-40 blur-md animate-moonPulse" />
          <div className="absolute top-[9%] right-[11%] w-20 h-24 bg-[#F9F4F0] rounded-full translate-x-4" /> {/* Crescent effect */}

          {/* Decorative Torii Gate Silhouette - Bottom Right */}
          <div className="absolute bottom-[5%] right-[2%] w-72 h-56 opacity-[0.04] text-[#BC243C]">
            <svg viewBox="0 0 100 80" fill="currentColor" className="w-full h-full">
              <path d="M5,15 L95,15 L95,20 L5,20 Z M15,10 L85,10 L85,15 L15,15 Z M20,20 L20,80 L25,80 L25,20 Z M75,20 L75,80 L80,80 L80,20 Z M15,35 L85,35 L85,40 L15,40 Z" />
            </svg>
          </div>

          {/* Pagoda Silhouette - Far Left */}
          <div className="absolute bottom-[10%] left-[-2%] w-48 h-80 opacity-[0.03] text-[#2C1810]">
            <svg viewBox="0 0 50 100" fill="currentColor" className="w-full h-full">
              <path d="M10,90 L40,90 L40,95 L10,95 Z M5,75 L45,75 L45,80 L5,80 Z M10,70 L40,70 L40,75 L10,75 Z M15,55 L35,55 L35,60 L15,60 Z M10,50 L40,50 L40,55 L10,55 Z M15,35 L35,35 L35,40 L15,40 Z M20,30 L30,30 L30,35 L20,35 Z M22,10 L28,10 L28,30 L22,30 Z" />
              <path d="M24,2 L26,2 L26,10 L24,10 Z" />
            </svg>
          </div>

          {/* Floating Lanterns - Gentle Sway */}
          {[...Array(3)].map((_, i) => (
            <div 
              key={`lantern-${i}`}
              className="absolute opacity-20"
              style={{
                top: `${20 + i * 15}%`,
                left: `${15 + i * 25}%`,
                animation: `lanternSway ${4 + i}s ease-in-out infinite alternate`,
              }}
            >
              <div className="w-8 h-12 bg-[#BC243C] rounded-lg relative shadow-[0_0_15px_rgba(188,36,60,0.5)]">
                <div className="absolute top-0 left-1 right-1 h-1 bg-[#2C1810] rounded-t-sm" />
                <div className="absolute bottom-0 left-1 right-1 h-1 bg-[#2C1810] rounded-b-sm" />
                <div className="absolute inset-0 flex flex-col justify-around py-1 px-2 opacity-30">
                   {[...Array(3)].map((_, j) => <div key={j} className="h-[1px] bg-[#000]" />)}
                </div>
              </div>
              <div className="w-[1px] h-20 bg-neutral-400 absolute bottom-full left-1/2" />
            </div>
          ))}

          {/* Traditional Kumo (Clouds) */}
          <div className="absolute top-[20%] left-[10%] w-64 h-24 opacity-[0.03] text-[#BC243C] animate-cloudDrift" style={{ animationDuration: '40s' }}>
            <svg viewBox="0 0 200 100" fill="currentColor" className="w-full h-full">
              <path d="M50,80 Q20,80 20,50 Q20,30 40,30 Q50,10 70,20 Q80,5 100,10 Q120,5 130,20 Q150,10 170,30 Q190,40 180,60 Q190,80 150,80 Z" />
              <path d="M60,70 Q40,70 40,55 Q40,45 50,45 Q55,35 65,40 Q75,30 90,35 Q100,25 110,35 Q125,30 135,45 Q150,50 140,65 Q150,70 120,70 Z" fill="#FFF" opacity="0.3" />
            </svg>
          </div>
          <div className="absolute top-[40%] right-[5%] w-80 h-32 opacity-[0.02] text-[#2C1810] animate-cloudDrift" style={{ animationDuration: '60s', animationDirection: 'reverse' }}>
            <svg viewBox="0 0 200 100" fill="currentColor" className="w-full h-full">
              <path d="M50,80 Q20,80 20,50 Q20,30 40,30 Q50,10 70,20 Q80,5 100,10 Q120,5 130,20 Q150,10 170,30 Q190,40 180,60 Q190,80 150,80 Z" />
            </svg>
          </div>

          {/* Koi Fish - Swimming in background */}
          <div className="absolute top-[60%] right-[20%] w-24 h-12 opacity-[0.03] text-[#BC243C] animate-koiSwim">
            <svg viewBox="0 0 100 50" fill="currentColor" className="w-full h-full">
              <path d="M10,25 Q30,10 60,25 Q30,40 10,25 Z M60,25 Q80,20 90,10 L85,25 L90,40 Q80,30 60,25 Z" />
              <path d="M25,15 Q30,5 40,15 Z" />
              <path d="M25,35 Q30,45 40,35 Z" />
            </svg>
          </div>

          {/* Falling Sakura Petals with varied paths */}
          {[...Array(25)].map((_, i) => (
            <div 
              key={`sakura-global-${i}`}
              className="absolute text-[#F8BBD0] opacity-0"
              style={{
                top: `-20px`,
                left: `${(i * 4) % 100}%`,
                fontSize: `${Math.random() * 8 + 12}px`,
                animation: `sakuraFall3D ${Math.random() * 12 + 10}s linear infinite`,
                animationDelay: `${i * 0.7}s`,
                filter: 'drop-shadow(0 0 3px rgba(248,187,208,0.2))'
              }}
            >
              🌸
            </div>
          ))}

          {/* Bamboo Silhouette Accents - Far Right */}
          <div className="absolute bottom-0 right-[-2%] w-32 h-96 opacity-[0.03] text-[#2D3436] rotate-[-5deg]">
            <svg viewBox="0 0 40 100" fill="currentColor" className="w-full h-full">
              <path d="M18,100 L22,100 L22,80 C25,78 25,75 22,73 L22,50 C25,48 25,45 22,43 L22,10 L18,10 L18,43 C15,45 15,48 18,50 L18,73 C15,75 15,78 18,80 Z" />
              <path d="M22,60 Q35,55 38,40 Q30,45 22,55 Z" />
              <path d="M18,40 Q5,35 2,20 Q10,25 18,35 Z" />
            </svg>
          </div>

          <style>{`
            @keyframes sakuraFall3D {
              0% { transform: translateY(-30px) translateX(0) rotateX(0deg) rotateY(0deg) rotateZ(0deg); opacity: 0; }
              10% { opacity: 0.6; }
              90% { opacity: 0.6; }
              100% { transform: translateY(110vh) translateX(150px) rotateX(720deg) rotateY(360deg) rotateZ(180deg); opacity: 0; }
            }
            @keyframes moonPulse {
              0%, 100% { opacity: 0.2; transform: scale(1) translate(0, 0); filter: blur(10px); }
              50% { opacity: 0.5; transform: scale(1.08) translate(-3px, -3px); filter: blur(14px); }
            }
            @keyframes lanternSway {
              0% { transform: rotate(-4deg); }
              100% { transform: rotate(4deg); }
            }
            @keyframes cloudDrift {
              0% { transform: translateX(-5%); opacity: 0; }
              10% { opacity: 0.03; }
              90% { opacity: 0.03; }
              100% { transform: translateX(5%); opacity: 0; }
            }
            @keyframes koiSwim {
              0% { transform: translateX(0) translateY(0) rotate(0deg); opacity: 0; }
              10% { opacity: 0.03; }
              50% { transform: translateX(-100px) translateY(-20px) rotate(-10deg); }
              90% { opacity: 0.03; }
              100% { transform: translateX(-200px) translateY(0) rotate(0deg); opacity: 0; }
            }
          `}</style>
        </div>
      )}
      <span className="text-xs font-bold uppercase tracking-widest opacity-60 truncate max-w-[60%] relative z-10">
        {form.title}
      </span>

      {currentIndex >= 0 && totalFields > 0 && (
        <span className="text-[10px] font-mono font-bold opacity-50 shrink-0">
          {currentIndex + 1} / {totalFields}
        </span>
      )}
    </header>
  );
}
