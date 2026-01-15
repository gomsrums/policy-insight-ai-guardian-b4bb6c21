import React from 'react';

const FancyBackground = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated mesh gradient background */}
      <div className="absolute inset-0 bg-background">
        {/* Primary gradient orb */}
        <div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-3xl floating"
          style={{
            background: 'radial-gradient(circle, hsl(221 83% 53% / 0.4) 0%, transparent 70%)',
            top: '-200px',
            left: '-200px',
          }}
        />
        
        {/* Secondary gradient orb */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-3xl floating"
          style={{
            background: 'radial-gradient(circle, hsl(262 83% 58% / 0.4) 0%, transparent 70%)',
            top: '40%',
            right: '-150px',
            animationDelay: '2s',
          }}
        />
        
        {/* Accent gradient orb */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-3xl floating"
          style={{
            background: 'radial-gradient(circle, hsl(172 66% 40% / 0.4) 0%, transparent 70%)',
            bottom: '-100px',
            left: '20%',
            animationDelay: '4s',
          }}
        />
      </div>
      
      {/* Floating geometric shapes with glassmorphism */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Glowing circles */}
        <div 
          className="absolute top-20 left-[10%] w-24 h-24 rounded-full floating pulse-glow"
          style={{
            background: 'linear-gradient(135deg, hsl(221 83% 53% / 0.15), hsl(262 83% 58% / 0.15))',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsl(221 83% 53% / 0.2)',
          }}
        />
        
        <div 
          className="absolute top-[30%] right-[15%] w-16 h-16 rounded-full floating"
          style={{
            background: 'linear-gradient(135deg, hsl(172 66% 40% / 0.2), hsl(142 76% 36% / 0.2))',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsl(172 66% 40% / 0.3)',
            animationDelay: '1s',
          }}
        />
        
        {/* Rotating squares */}
        <div 
          className="absolute top-[60%] left-[5%] w-20 h-20 rounded-xl floating"
          style={{
            background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.1), hsl(221 83% 53% / 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsl(262 83% 58% / 0.2)',
            transform: 'rotate(45deg)',
            animationDelay: '3s',
          }}
        />
        
        <div 
          className="absolute bottom-[20%] right-[10%] w-28 h-28 rounded-2xl floating pulse-glow"
          style={{
            background: 'linear-gradient(135deg, hsl(221 83% 53% / 0.1), hsl(172 66% 40% / 0.1))',
            backdropFilter: 'blur(10px)',
            border: '1px solid hsl(221 83% 53% / 0.15)',
            transform: 'rotate(-12deg)',
            animationDelay: '2.5s',
          }}
        />
        
        {/* Small accent dots */}
        <div 
          className="absolute top-[45%] left-[30%] w-4 h-4 rounded-full bg-primary/30 floating"
          style={{ animationDelay: '0.5s' }}
        />
        <div 
          className="absolute top-[25%] right-[35%] w-3 h-3 rounded-full bg-accent/40 floating"
          style={{ animationDelay: '1.5s' }}
        />
        <div 
          className="absolute bottom-[35%] left-[45%] w-5 h-5 rounded-full bg-insurance-purple/25 floating"
          style={{ animationDelay: '2s' }}
        />
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(hsl(221 83% 53%) 1px, transparent 1px),
              linear-gradient(90deg, hsl(221 83% 53%) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default FancyBackground;
