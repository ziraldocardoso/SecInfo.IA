import React from 'react';

export default function Topbar() {
  return (
    <header className="h-14 bg-black border-b border-[hsl(var(--primary)/0.3)] flex items-center justify-between px-4 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="text-[hsl(var(--primary))] font-bold text-xl uppercase tracking-wider crt-flicker" style={{ textShadow: '0 0 8px hsl(var(--primary)/0.8)' }}>
          SECINFO.IA
        </div>
        <div className="h-6 w-px bg-[hsl(var(--primary)/0.3)] hidden sm:block"></div>
        <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-white/70">
          <span className="text-[hsl(var(--primary))]">Region:</span>
          <span className="font-mono bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 border border-[hsl(var(--primary)/0.2)]">Sector-01 / Neo-Alagoas</span>
        </div>
      </div>
      
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[hsl(var(--success))] tracking-wider">SYS.NET</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--success))]"></span>
          </span>
          <span className="text-white/80">LAT: 12ms</span>
        </div>
        <button className="hidden sm:block px-3 py-1 bg-black border border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] uppercase hover:bg-[hsl(var(--primary))] hover:text-black transition-colors duration-0 cursor-pointer">
          Admin
        </button>
      </div>
    </header>
  );
}
