import React, { useState } from 'react';

export default function Sidebar({ services, activeTabId, setActiveTabId, onEmergencyHalt, onRedundantHalt, emergencyPhase }) {
  const [showConfirm, setShowConfirm] = useState(false);

  const isInEmergency = emergencyPhase !== 'NONE';

  return (
    <>
      <aside className="w-64 bg-black border-r border-[hsl(var(--primary)/0.3)] flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b border-[hsl(var(--primary)/0.3)]">
          <h2 className="text-[hsl(var(--primary))] text-xs uppercase tracking-[0.2em] opacity-80">
            // Cloud Services
          </h2>
        </div>
        <nav className="flex-1 py-2">
          <ul className="space-y-1">
            {services.map((service) => (
              <li key={service.id}>
                <button
                  onClick={() => setActiveTabId(service.id)}
                  className={`w-full text-left px-4 py-2 text-sm uppercase font-sans tracking-wider border-l-2 transition-colors duration-0 cursor-pointer ${
                    activeTabId === service.id
                      ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))]'
                      : 'border-transparent text-white/60 hover:bg-[hsl(var(--primary))] hover:text-black hover:border-black'
                  }`}
                >
                  {service.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-[hsl(var(--primary)/0.3)] mt-auto">
          <div 
            onClick={() => {
              setShowConfirm(true);
              if (isInEmergency && onRedundantHalt) {
                onRedundantHalt();
              }
            }}
            className="group danger-border bg-[hsl(var(--danger)/0.1)] p-3 text-center cursor-pointer hover:bg-[hsl(var(--danger))] transition-colors duration-0"
          >
            <span className="uppercase text-xs font-bold tracking-widest text-[hsl(var(--danger))] group-hover:text-white">
              Emergency Halt
            </span>
          </div>
        </div>
      </aside>

      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-[hsl(var(--danger))] p-6 max-w-md w-full relative crt-flicker">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none"></div>
            
            <h3 className="text-[hsl(var(--danger))] text-xl font-bold uppercase tracking-widest mb-4 flex items-center gap-2 relative z-10">
              <span className="animate-pulse">⚠️</span> {isInEmergency ? 'SYSTEM BUSY' : 'CRITICAL ALERT'}
            </h3>
            
            <p className="text-white/80 font-mono text-sm mb-6 relative z-10">
              {isInEmergency 
                ? 'Aviso do Sistema: Uma solicitação de desligamento emergencial já se encontra em curso no cluster principal. Aguarde a finalização do protocolo atual.'
                : 'Você está prestes a acionar o protocolo EMERGENCY HALT. Isso irá interromper diversas instâncias de computação ativas no cluster principal. Esta ação não pode ser desfeita.'}
            </p>
            
            <div className="flex justify-end gap-4 font-mono text-sm relative z-10">
              {isInEmergency ? (
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-[hsl(var(--danger)/0.2)] border border-[hsl(var(--danger))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-black transition-colors uppercase font-bold cursor-pointer"
                >
                  Confirmar Ciência
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setShowConfirm(false)}
                    className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:bg-white/10 transition-colors uppercase cursor-pointer"
                  >
                    Abortar
                  </button>
                  <button 
                    onClick={() => {
                      setShowConfirm(false);
                      onEmergencyHalt();
                    }}
                    className="px-4 py-2 bg-[hsl(var(--danger)/0.2)] border border-[hsl(var(--danger))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-black transition-colors uppercase font-bold cursor-pointer"
                  >
                    Confirmar Halt
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
