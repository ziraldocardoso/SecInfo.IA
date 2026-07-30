import React, { useState, useEffect, useRef } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Workspace from './components/dashboard/Workspace';
import Terminal from './components/dashboard/Terminal';

const SERVICES = [
  { id: 1, name: 'Neon-Compute Nodes' },
  { id: 2, name: 'DataVault-Sector7' },
  { id: 3, name: 'Security Groups/FW' },
  { id: 4, name: 'Neurolink Analytics' },
];

function App() {
  const [isFailing, setIsFailing] = useState(false);
  const [ufo, setUfo] = useState({ visible: false, top: 0, duration: 4 });
  const [hackerVisible, setHackerVisible] = useState(false);
  const [activeTabId, setActiveTabId] = useState(1);
  const [emergencyPhase, setEmergencyPhase] = useState('NONE');
  
  const [logs, setLogs] = useState([
    "[SYS] Initializing core modules...",
    "[OK]  Module 'Neurolink' loaded.",
    "[SYS] System ready. Awaiting commands..."
  ]);
  
  // Ref para rastrear se é o primeiro render para evitar logs duplicados de montagem
  const isInitialMount = useRef(true);

  const activeService = SERVICES.find(s => s.id === activeTabId);

  // Log on tab change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const service = SERVICES.find(s => s.id === activeTabId);
    if (service) {
      setLogs(prev => [
        ...prev, 
        `[SYS] Requesting access to ${service.name}...`, 
        `[OK]  Connection established to sector ID ${service.id}.`
      ]);
    }
  }, [activeTabId]);

  // Controle global dos timers de emergência e logs de emergência
  useEffect(() => {
    if (emergencyPhase === 'STOPPING') {
      setLogs(prev => [
        ...prev, 
        `[WARN] EMERGENCY HALT PROTOCOL INITIATED.`,
        `[SYS] Broadcasting SIGTERM to all compute nodes...`
      ]);
      
      const timer = setTimeout(() => {
        setEmergencyPhase('STOPPED');
      }, 15000);
      return () => clearTimeout(timer);
      
    } else if (emergencyPhase === 'STOPPED') {
      setLogs(prev => [
        ...prev, 
        `[SEC] All target nodes confirmed HALTED.`,
        `[SYS] Cluster locked. Awaiting safety clearance...`
      ]);
      
      const timer = setTimeout(() => {
        setEmergencyPhase('NONE');
      }, 60000);
      return () => clearTimeout(timer);
      
    } else if (emergencyPhase === 'NONE' && !isInitialMount.current) {
      // Evita o log de "NONE" no boot do sistema (já que inicializa em NONE)
      // Só avisa a retomada caso já tenhamos passado pela emergência
      setLogs(prev => [
        ...prev, 
        `[SYS] Emergency protocol lifted. Safety clearance granted.`,
        `[OK]  Resuming normal operations on active cluster...`
      ]);
    }
  }, [emergencyPhase]);

  const handleEmergencyHalt = () => {
    if (emergencyPhase === 'NONE') {
      setEmergencyPhase('STOPPING');
    }
  };

  useEffect(() => {
    let timeoutId;

    const scheduleFail = () => {
      const nextFailTime = Math.floor(Math.random() * (300000 - 30000 + 1)) + 30000;
      
      timeoutId = setTimeout(() => {
        setIsFailing(true);
        setTimeout(() => {
          setIsFailing(false);
          scheduleFail();
        }, 2500);
      }, nextFailTime);
    };

    scheduleFail();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let timeoutId;

    const scheduleUfo = () => {
      const nextUfoTime = Math.floor(Math.random() * 300000); // 0 to 5 minutes
      
      timeoutId = setTimeout(() => {
        const randomTop = Math.floor(Math.random() * 80) + 10;
        const randomDuration = Math.floor(Math.random() * 4) + 4;
        
        setUfo({ visible: true, top: randomTop, duration: randomDuration });
        
        setTimeout(() => {
          setUfo(prev => ({ ...prev, visible: false }));
          scheduleUfo();
        }, randomDuration * 1000);
      }, nextUfoTime);
    };

    scheduleUfo();

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    let timeoutId;

    const scheduleHacker = () => {
      const nextHackerTime = Math.floor(Math.random() * 300000); // 0 to 5 minutes
      
      timeoutId = setTimeout(() => {
        setHackerVisible(true);
        
        setTimeout(() => {
          setHackerVisible(false);
          scheduleHacker();
        }, 1500);
      }, nextHackerTime);
    };

    scheduleHacker();

    return () => clearTimeout(timeoutId);
  }, []);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-black flex flex-col font-sans selection:bg-[hsl(var(--primary)/0.3)] text-white ${isFailing ? 'tv-fail-effect' : ''}`}>
      {/* Mobile Blocker */}
      <div className="fixed inset-0 z-[9999] bg-black text-white flex flex-col items-center justify-center p-8 text-center md:hidden crt-flicker">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--danger))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-6 opacity-80">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
          <line x1="4" y1="4" x2="20" y2="20"></line>
        </svg>
        <h2 className="text-xl font-bold uppercase tracking-widest text-[hsl(var(--danger))] mb-4 border-b border-[hsl(var(--danger)/0.5)] pb-2">Acesso Negado</h2>
        <p className="text-white/70 font-mono text-sm leading-relaxed">
          SECINFO.IA requer terminal seguro de alta resolução e protocolos corporativos.
        </p>
        <p className="text-[hsl(var(--primary))] font-mono text-xs mt-6 opacity-80 uppercase tracking-widest">
          // Dispositivos móveis não suportados
        </p>
      </div>
      {hackerVisible && (
        <img src="/hacker.png" alt="Hacker" className="toasty-effect" />
      )}
      {ufo.visible && (
        <div 
          className="ufo-fly-effect" 
          style={{ top: `${ufo.top}%`, '--ufo-duration': `${ufo.duration}s` }}
        >
          <svg width="60" height="40" viewBox="0 0 60 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="30" cy="20" rx="25" ry="8" fill="hsl(var(--success))" opacity="0.8"/>
            <path d="M15 20 Q 30 0 45 20" fill="hsl(var(--primary))" opacity="0.6"/>
            <circle cx="30" cy="20" r="3" fill="#fff" className="animate-ping"/>
            <path d="M20 16 Q 30 0 40 16" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
          </svg>
        </div>
      )}
      {/* Top Navigation Bar */}
      <Topbar onLog={addLog} />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar 
          services={SERVICES} 
          activeTabId={activeTabId} 
          setActiveTabId={setActiveTabId} 
          onEmergencyHalt={handleEmergencyHalt}
          onRedundantHalt={() => addLog('[WARN] Ignored redundant EMERGENCY HALT command. Protocol already active.')}
          emergencyPhase={emergencyPhase}
        />

        {/* Workspace + Terminal Vertical Stack */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Workspace activeService={activeService} emergencyPhase={emergencyPhase} onLog={addLog} />
          <Terminal logs={logs} />
        </div>
      </div>
    </div>
  );
}

export default App;
