import React, { useState, useEffect, useRef } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Workspace from './components/dashboard/Workspace';
import Terminal from './components/dashboard/Terminal';
import AttackModal, { HACKER_IPS } from './components/dashboard/AttackModal';

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
  const [activeTabId, setActiveTabId] = useState(() => {
    const saved = localStorage.getItem('secinfo_activeTabId');
    return saved ? parseInt(saved, 10) : 1;
  });
  const [emergencyPhase, setEmergencyPhase] = useState(() => {
    return localStorage.getItem('secinfo_emergencyPhase') || 'NONE';
  });
  const [aiMode, setAiMode] = useState(() => {
    return localStorage.getItem('secinfo_aiMode') === 'true';
  });
  const [showAttackModal, setShowAttackModal] = useState(false);
  
  const [logs, setLogs] = useState(() => {
    const saved = localStorage.getItem('secinfo_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return [
      "[SYS] Initializing core modules...",
      "[OK]  Module 'Neurolink' loaded.",
      "[SYS] System ready. Awaiting commands..."
    ];
  });

  useEffect(() => {
    localStorage.setItem('secinfo_activeTabId', activeTabId);
  }, [activeTabId]);

  useEffect(() => {
    localStorage.setItem('secinfo_emergencyPhase', emergencyPhase);
  }, [emergencyPhase]);

  useEffect(() => {
    localStorage.setItem('secinfo_aiMode', aiMode);
  }, [aiMode]);

  useEffect(() => {
    localStorage.setItem('secinfo_logs', JSON.stringify(logs));
  }, [logs]);
  
  const isInitialMount = useRef(true);

  const activeService = SERVICES.find(s => s.id === activeTabId);

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
      // The system now remains permanently locked in STOPPED state until manual intervention (if any)
      
    } else if (emergencyPhase === 'NONE' && !isInitialMount.current) {
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
      const nextUfoTime = Math.floor(Math.random() * 300000);
      
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
      const nextHackerTime = Math.floor(Math.random() * 300000);
      
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

  useEffect(() => {
    if (!aiMode) return;
    
    let timeoutId;
    const scheduleAILog = () => {
      const randomIp = HACKER_IPS[Math.floor(Math.random() * HACKER_IPS.length)];
      
      const attempts = [
        `[CRITICAL] SQL Injection payload detected from host ${randomIp}.`,
        `[WARN] Privilege escalation attempt (PID 9942) origin: ${randomIp}.`,
        `[ALERT] Brute force attack incoming from ${randomIp} on Port 22 - SSH.`,
        `[CRITICAL] Unauthorized lateral movement originated by host ${randomIp}.`,
        `[WARN] Malware signature matched from remote IP ${randomIp}.`
      ];
      const countermeasures = [
        `[AI-DEFENSE] Payload from ${randomIp} intercepted by NeuralNet WAF. Threat neutralized.`,
        `[AI-DEFENSE] Host ${randomIp} sandboxed and connection terminated via heuristic analysis.`,
        `[AI-DEFENSE] Source IP ${randomIp} dynamically banned. Traffic routed to honeypot.`,
        `[AI-DEFENSE] Threat from ${randomIp} contained. Subnet isolated successfully.`,
        `[AI-DEFENSE] Packets from ${randomIp} quarantined automatically. Vector neutralized.`
      ];
      
      const nextTime = Math.floor(Math.random() * 8000) + 4000;
      
      timeoutId = setTimeout(() => {
        const randIndex = Math.floor(Math.random() * attempts.length);
        setLogs(prev => [...prev, attempts[randIndex]]);
        
        setTimeout(() => {
          setLogs(prev => [...prev, countermeasures[randIndex]]);
          scheduleAILog();
        }, 1500);
      }, nextTime);
    };
    
    scheduleAILog();
    return () => clearTimeout(timeoutId);
  }, [aiMode]);

  const addLog = (msg) => {
    setLogs(prev => [...prev, msg]);
  };

  return (
    <div className={`h-screen w-screen overflow-hidden bg-black flex flex-col font-sans selection:bg-[hsl(var(--primary)/0.3)] text-white ${isFailing ? 'tv-fail-effect' : ''} ${aiMode ? 'ai-theme' : ''}`}>
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
      <Topbar onLog={addLog} aiMode={aiMode} />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar 
          services={SERVICES} 
          activeTabId={activeTabId} 
          setActiveTabId={setActiveTabId} 
          onEmergencyHalt={handleEmergencyHalt}
          onRedundantHalt={() => addLog('[WARN] Ignored redundant EMERGENCY HALT command. Protocol already active.')}
          emergencyPhase={emergencyPhase}
          aiMode={aiMode}
          onOpenAttackModal={() => setShowAttackModal(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Workspace 
            activeService={activeService} 
            emergencyPhase={emergencyPhase} 
            onLog={addLog} 
            onEmergencyLifted={() => setEmergencyPhase('NONE')}
            onAiModeActivate={() => setAiMode(true)}
            onAiModeDeactivate={() => {
              setAiMode(false);
              setEmergencyPhase('NONE');
              setActiveTabId(1);
              setLogs([
                "[SYS] Initializing core modules...",
                "[OK]  Module 'Neurolink' loaded.",
                "[SYS] System ready. Awaiting commands..."
              ]);
              localStorage.removeItem('secinfo_aiMode');
              localStorage.removeItem('secinfo_emergencyPhase');
              localStorage.removeItem('secinfo_activeTabId');
              localStorage.removeItem('secinfo_logs');
              localStorage.removeItem('secinfo_mlActivated');
              localStorage.removeItem('secinfo_threatNeutralized');
            }}
            aiMode={aiMode}
          />
          <Terminal logs={logs} onLog={addLog} />
        </div>
      </div>

      {showAttackModal && (
        <AttackModal 
          onClose={() => setShowAttackModal(false)}
          onLog={addLog}
        />
      )}
    </div>
  );
}

export default App;
