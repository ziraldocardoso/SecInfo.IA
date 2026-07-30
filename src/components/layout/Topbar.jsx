import React, { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

export default function Topbar({ onLog }) {
  const [latency, setLatency] = useState(12);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(Math.floor(Math.random() * 205) + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="h-14 bg-black border-b border-[hsl(var(--primary)/0.3)] flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="text-[hsl(var(--primary))] font-bold text-xl uppercase tracking-wider crt-flicker" style={{ textShadow: '0 0 8px hsl(var(--primary)/0.8)' }}>
            SECINFO.IA
          </div>
          <div className="h-6 w-px bg-[hsl(var(--primary)/0.3)] hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest text-white/70">
            <span className="text-[hsl(var(--primary))] uppercase text-[10px] tracking-widest">Region / Cloud Tenant:</span>
            <span className="font-mono bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 border border-[hsl(var(--primary)/0.2)]">Neo-Alagoas</span>
            <span className="ml-2 bg-[hsl(var(--danger))] text-black px-2 py-0.5 font-bold animate-pulse">Avaliação NÃO iniciada!</span>
            <span className="ml-2 font-mono bg-[hsl(var(--primary)/0.1)] px-2 py-0.5 border border-[hsl(var(--primary)/0.2)]">IA Aplicada à Segurança da Informação</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-[hsl(var(--success))] tracking-wider">SYS.NET</span>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--success))] opacity-100 shadow-[0_0_10px_hsl(var(--success))]"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[hsl(var(--success))] shadow-[0_0_8px_hsl(var(--success))]"></span>
            </span>
            <span className="text-white/80">LAT: {latency}ms</span>
          </div>
          <button 
            onClick={() => {
              setShowLogin(true);
              if (onLog) onLog('[SEC] Authentication portal requested via Admin panel.');
            }}
            className="hidden sm:block px-3 py-1 bg-black border border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] uppercase hover:bg-[hsl(var(--primary))] hover:text-black transition-colors duration-0 cursor-pointer"
          >
            Admin
          </button>
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => {
        setShowLogin(false);
        if (onLog) onLog('[SYS] Authentication portal closed by user.');
      }} />}
    </>
  );
}
