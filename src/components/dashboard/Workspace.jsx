import React, { useState, useEffect, useMemo } from 'react';

const getRandomCpu = (min, max) => `${Math.floor(Math.random() * (max - min + 1)) + min}%`;

const INITIAL_INSTANCES = [
  { id: 'instance-20260731-0358', type: 'BM.Standard.A1', state: 'RUNNING', ip: '141.33.17.188', cpu: getRandomCpu(70, 90) },
  { id: 'instance-20260730-0240', type: 'VM.Standard.A1.Flex', state: 'RUNNING', ip: '142.33.17.99', cpu: getRandomCpu(1, 25) },
  { id: 'instance-20260731-0255', type: 'VM.Standard.A2.Flex', state: 'RUNNING', ip: '143.33.18.88', cpu: getRandomCpu(1, 25) },
  { id: 'instance-20260729-0233', type: 'VM.Standard.E2.1.Micro', state: 'RUNNING', ip: '144.33.15.227', cpu: getRandomCpu(1, 25) },
  { id: 'instance-20260801-0199', type: 'VM.Standard.E4.Flex', state: 'RUNNING', ip: '142.33.11.101', cpu: getRandomCpu(1, 25) },
  { id: 'instance-20260730-0200', type: 'VM.Standard.E6.Ax.Flex', state: 'RUNNING', ip: '146.31.15.169', cpu: getRandomCpu(1, 25) },
  { id: 'instance-20260727-0777', type: 'VM.Optimized3.Flex', state: 'RUNNING', ip: '148.25.19.254', cpu: getRandomCpu(1, 25) },
];

const getStateStyle = (state) => {
  switch(state) {
    case 'RUNNING': return 'text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.1)]';
    case 'STARTING': 
    case 'INITIALIZING':
    case 'PROVISIONING': return 'text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.1)] animate-pulse';
    case 'STOPPING': 
    case 'TERMINATING': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10 animate-pulse';
    case 'STOPPED': 
    case 'TERMINATED': 
    case 'HALTED': return 'text-white/40 border-white/20 bg-white/5';
    default: return 'text-white/40 border-white/20 bg-white/5';
  }
};

const generateInstanceDetails = (inst) => {
  if (inst.id === 'instance-20260729-0233') {
    return {
      firmware: 'UEFI_64',
      os: '?',
      version: '?',
      launched: 'Jul 29, 2026, 05:35:14 UTC',
      loginUser: 'operador_ia',
      bootVolume: 'PARAVIRTUALIZED',
      ocpu: '1',
      network: '0.48',
      memory: '1',
      vcn: 'vcn-20260713-1719',
      localDisk: 'Block storage only',
      dr: 'QuickDR'
    };
  }

  const seed = inst.id.split('-').pop() || '0000';
  const idNum = parseInt(seed, 10) || 0;

  const firmwares = ["UEFI_64", "BIOS_Legacy", "Secured_Boot_v2"];
  const osList = ["Oracle Linux 8", "Ubuntu 22.04 LTS", "CentOS 7.9", "Red Hat Enterprise Linux 8"];
  const ocpuList = ["2", "4", "8", "16", "32"];
  const memList = ["16", "32", "64", "128", "256"];
  const netList = ["2", "4", "10", "25"];

  return {
    firmware: firmwares[idNum % firmwares.length],
    os: osList[idNum % osList.length],
    version: `v${(idNum % 5) + 1}.${idNum % 10}`,
    launched: `2026-07-${(idNum % 28 + 1).toString().padStart(2, '0')}T${(idNum % 24).toString().padStart(2, '0')}:00:00Z`,
    loginUser: (inst.id === 'instance-20260801-0199' || inst.id === 'instance-20260731-0255') ? 'support' : (idNum % 2 === 0 ? 'opc' : 'ubuntu'),
    bootVolume: idNum % 3 === 0 ? 'Paravirtualized' : 'iSCSI',
    ocpu: ocpuList[idNum % ocpuList.length],
    network: netList[idNum % netList.length],
    memory: memList[idNum % memList.length],
    vcn: idNum % 2 === 0 ? 'vcn-sector7-prod' : 'vcn-neon-main',
    localDisk: `${(idNum % 5 + 1) * 50} GB NVMe`,
    dr: idNum % 4 === 0 ? 'Disabled' : 'Enabled (Region: Ashburn)'
  };
};

export default function Workspace({ activeService, emergencyPhase, onLog, onEmergencyLifted, onAiModeActivate, onAiModeDeactivate, aiMode }) {
  const [instances, setInstances] = useState(INITIAL_INSTANCES);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [mlActivated, setMlActivated] = useState(() => {
    return localStorage.getItem('secinfo_mlActivated') === 'true';
  });
  const [secretCode, setSecretCode] = useState('');
  const [showThreatModal, setShowThreatModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [verifyResult, setVerifyResult] = useState('');
  const [processName, setProcessName] = useState('');
  const [threatNeutralized, setThreatNeutralized] = useState(() => {
    return localStorage.getItem('secinfo_threatNeutralized') === 'true';
  });
  const [isClosingModal, setIsClosingModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('secinfo_mlActivated', mlActivated);
  }, [mlActivated]);

  useEffect(() => {
    localStorage.setItem('secinfo_threatNeutralized', threatNeutralized);
  }, [threatNeutralized]);

  useEffect(() => {
    if (emergencyPhase === 'STOPPING') {
      setInstances(prev => prev.map(inst => 
        inst.id === 'instance-20260729-0233' ? inst : { ...inst, state: 'STOPPING' }
      ));
    } else if (emergencyPhase === 'STOPPED') {
      setInstances(prev => prev.map(inst => 
        inst.id === 'instance-20260729-0233' ? inst : { ...inst, state: 'STOPPED' }
      ));
    }
  }, [emergencyPhase]);

  useEffect(() => {
    if (emergencyPhase === 'STOPPED') {
      const allRunning = instances.every(inst => inst.state === 'RUNNING');
      if (allRunning && onEmergencyLifted) {
        onEmergencyLifted();
      }
    }
  }, [instances, emergencyPhase, onEmergencyLifted]);

  useEffect(() => {
    if (!activeService || activeService.id !== 1) return;
    if (emergencyPhase !== 'NONE') return;

    const cpuInterval = setInterval(() => {
      setInstances(prev => prev.map(inst => {
        if (inst.id === 'instance-20260731-0358') {
          return { ...inst, cpu: getRandomCpu(70, 90) };
        }
        return { ...inst, cpu: getRandomCpu(1, 25) };
      }));
    }, 40000);

    return () => {
      clearInterval(cpuInterval);
    };
  }, [activeService, emergencyPhase]);

  const haltedInstances = useMemo(() => {
    if (activeService?.id === 1) return [];
    const prefix = activeService?.name?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'node';
    
    const length = ((activeService?.id || 1) * 3) % 4 + 2;
    
    return Array.from({ length }).map((_, i) => ({
      id: `${prefix}-halted-${i+100}`,
      type: 'UNKNOWN',
      state: 'HALTED',
      ip: 'OFFLINE',
      cpu: '0%'
    }));
  }, [activeService]);

  const displayInstances = activeService?.id === 1 ? instances : haltedInstances;

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-[hsl(var(--primary)/0.3)] pb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white/90 flex items-center gap-4">
              {activeService?.name || 'Service'}
              {aiMode && (
                <span className="text-xs font-bold bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border border-[hsl(var(--primary)/0.5)] px-3 py-1 drop-shadow-[0_0_5px_rgba(255,215,0,0.5)] uppercase tracking-widest animate-pulse">
                  Defesa por IA ativada - resposta automatizada
                </span>
              )}
            </h1>
            <p className="text-[hsl(var(--primary))] font-mono text-xs mt-1">
              {activeService?.id === 1 ? '// Gestão de Instâncias de Computação' : '// Serviço Inativo - Infraestrutura Desligada'}
            </p>
          </div>
          <button 
            data-status={aiMode ? "ATIVADO" : (mlActivated ? "ATIVADO" : "DESATIVADO")}
            onClick={(e) => {
              if (aiMode) {
                setThreatNeutralized(false);
                setProcessName('');
                setSecretCode('');
                setVerifyResult('');
                setVerifyProgress(0);
                setIsVerifying(false);
                setShowThreatModal(false);
                if (onAiModeDeactivate) onAiModeDeactivate();
                if (onLog) onLog(`[SYS] Restaurando operação manual. Inteligência Artificial desativada.`);
                return;
              }
              const currentStatus = e.currentTarget.getAttribute('data-status');
              if (currentStatus === 'ATIVADO') {
                if (!mlActivated) {
                  setMlActivated(true);
                  if (onLog) onLog(`[SYS] Secret module unlocked: Machine Learning Anomaly Detector`);
                } else {
                  const a = document.createElement('a');
                  a.href = "/anomaly_model.json";
                  a.download = "anomaly_model.json";
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  if (onLog) onLog(`[SEC-INFO] ML Anomaly Detector fragment downloaded.`);
                }
              } else {
                if (onLog) onLog(`[ERR] Action blocked. Component requires "ATIVADO" status.`);
              }
            }}
            className={`neon-border bg-black px-4 py-2 text-sm uppercase transition-all duration-300 
              data-[status=DESATIVADO]:opacity-50 data-[status=DESATIVADO]:cursor-not-allowed
              data-[status=ATIVADO]:opacity-100 data-[status=ATIVADO]:cursor-pointer 
              ${!aiMode ? 'data-[status=ATIVADO]:text-[hsl(var(--primary))] data-[status=ATIVADO]:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : ''}
              ${(!mlActivated && !aiMode) && activeService?.id === 1 ? 'text-[hsl(var(--primary))]' : ((!mlActivated && !aiMode) ? 'text-white/40 border-white/20' : '')}
              ${aiMode ? '!text-[#00f0ff] !border-[#00f0ff] !drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] animate-pulse hover:!bg-[#00f0ff]/20' : (mlActivated ? 'animate-pulse' : '')}
            `}
          >
            {aiMode ? 'Retornar para modo anterior' : (mlActivated ? 'Modelo de Machine Learning' : 'Launch Node')}
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--primary)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Total Nodes</h3>
            <div className={`text-3xl font-mono ${activeService?.id === 1 ? 'text-[hsl(var(--primary))]' : 'text-white/40'}`}>
              {displayInstances.length}
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--success)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Network Health</h3>
            <div className={`text-3xl font-mono ${activeService?.id === 1 ? 'text-[hsl(var(--success))]' : 'text-white/40'}`}>
              {activeService?.id === 1 ? (emergencyPhase !== 'NONE' ? 'CRITICAL' : 'OPTIMAL') : 'OFFLINE'}
            </div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--danger)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Active Vulnerables</h3>
            <div className={`text-3xl font-mono ${activeService?.id === 1 ? 'text-[hsl(var(--danger))] crt-flicker' : 'text-white/40'}`}>
              {activeService?.id === 1 ? (aiMode ? 'MONITORIZED' : 'DETECTED') : (aiMode ? '00 MONITORIZED' : '00 DETECTED')}
            </div>
          </div>
        </div>

        <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--primary)/0.3)] overflow-hidden">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-[hsl(var(--primary)/0.1)] border-b border-[hsl(var(--primary)/0.3)]">
              <tr>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Instance ID</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Type</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">State</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Public IPv4 Address</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">CPU Util</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayInstances.map((inst) => (
                <tr key={inst.id} className="border-b border-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                  <td className={`px-4 py-3 flex items-center gap-2 ${(!aiMode && inst.id === 'instance-20260731-0358') ? 'text-[#ff9999] drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-white/90'}`}>
                    <button
                      disabled={inst.state !== 'STOPPED'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setInstances(prev => prev.map(i => i.id === inst.id ? { ...i, state: 'INITIALIZING' } : i));
                        if (onLog) onLog(`[SYS] Initializing instance: ${inst.id}...`);
                        
                        setTimeout(() => {
                          setInstances(currentPrev => currentPrev.map(i => i.id === inst.id ? { ...i, state: 'RUNNING' } : i));
                          if (onLog) onLog(`[OK] Instance ${inst.id} is now RUNNING.`);
                        }, 15000);
                      }}
                      className={`p-1 rounded-full transition-colors ${
                        inst.state === 'STOPPED' 
                          ? 'text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.2)] hover:shadow-[0_0_8px_hsl(var(--success))] cursor-pointer' 
                          : 'text-white/20 cursor-not-allowed'
                      }`}
                      title={inst.state === 'STOPPED' ? "Power On" : ""}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                        <line x1="12" y1="2" x2="12" y2="12"></line>
                      </svg>
                    </button>
                    {inst.id}
                  </td>
                  <td className="px-4 py-3 text-white/60">{inst.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs border ${getStateStyle(inst.state)}`}>
                      {inst.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{inst.ip}</td>
                  <td className="px-4 py-3 text-white/60">{inst.state === 'STOPPED' ? '0%' : inst.cpu}</td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => {
                        setSelectedInstance(inst);
                        if (onLog) onLog(`[SEC] Deep inspection initiated for target: ${inst.id}`);
                      }}
                      className="text-[hsl(var(--primary))] hover:text-white hover:underline cursor-pointer"
                    >
                      View details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showThreatModal && (
        <div className={`fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-md transition-opacity duration-[3000ms] ${isClosingModal ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
          <div className="bg-black border border-[hsl(var(--danger))] p-8 max-w-2xl w-full relative crt-flicker shadow-[0_0_50px_rgba(255,0,0,0.2)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-6 relative z-10 border-b border-[hsl(var(--danger)/0.3)] pb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--danger))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              <h3 className="text-[hsl(var(--danger))] text-2xl font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                // THREAT HUNTING INICIADO
              </h3>
            </div>
            
            <div className="space-y-4 font-mono text-sm relative z-10 mb-8 text-white/80 leading-relaxed">
              <p>
                Atividades de busca ativa (<span className="text-[hsl(var(--danger))] font-bold">Threat Hunting</span>) foram autorizadas e iniciadas no sistema.
              </p>
              <p>
                <span className="text-[hsl(var(--danger))] font-bold uppercase animate-pulse">Atenção:</span> Um possível processo malicioso encontra-se em execução no sistema operacional atual. Este processo tem alto potencial para causar sérios danos aos serviços críticos e aos usuários da infraestrutura.
              </p>
              
              <div className="p-4 bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.3)]">
                <span className="block text-base font-bold uppercase tracking-widest text-[hsl(var(--danger))] mb-3 drop-shadow-[0_0_5px_rgba(255,0,0,0.5)]">Missão Atual: Reportar Processo Malicioso</span>
                
                {threatNeutralized ? (
                  <div className="text-[hsl(var(--success))] font-bold text-lg animate-pulse uppercase tracking-widest border border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.1)] p-3 text-center">
                    [ ALVO REGISTRADO COM SUCESSO ]
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={processName}
                      onChange={(e) => setProcessName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (processName.trim().toLowerCase() === 'killmonger') {
                            setThreatNeutralized(true);
                            if (onLog) onLog(`[SEC-SUCCESS] Threat 'Killmonger' successfully neutralized.`);
                            setTimeout(() => {
                              setIsClosingModal(true);
                              if (onAiModeActivate) onAiModeActivate();
                              if (onLog) onLog(`[SYS] Initializing AI-Driven Incident Response Mode...`);
                            }, 2000);
                            setTimeout(() => {
                              setShowThreatModal(false);
                              setSelectedInstance(null);
                              setIsClosingModal(false);
                            }, 5000);
                          } else {
                            if (onLog) onLog(`[ERR] Process '${processName}' is not the primary threat. Keep hunting.`);
                            setProcessName('');
                          }
                        }
                      }}
                      className="flex-1 bg-black border border-[hsl(var(--danger)/0.5)] text-[hsl(var(--danger))] text-sm p-2 outline-none focus:border-[hsl(var(--danger))] font-mono transition-colors placeholder-[hsl(var(--danger)/0.3)]"
                      placeholder="Nome do processo malicioso..."
                    />
                    <button 
                      onClick={() => {
                        if (processName.trim().toLowerCase() === 'killmonger') {
                          setThreatNeutralized(true);
                          if (onLog) onLog(`[SEC-SUCCESS] Threat 'Killmonger' successfully neutralized.`);
                          setTimeout(() => {
                            setIsClosingModal(true);
                            if (onAiModeActivate) onAiModeActivate();
                            if (onLog) onLog(`[SYS] Initializing AI-Driven Incident Response Mode...`);
                          }, 2000);
                          setTimeout(() => {
                            setShowThreatModal(false);
                            setSelectedInstance(null);
                            setIsClosingModal(false);
                          }, 5000);
                        } else {
                          if (onLog) onLog(`[ERR] Process '${processName}' is not the primary threat. Keep hunting.`);
                          setProcessName('');
                        }
                      }}
                      className="px-6 py-2 bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger)/0.5)] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-black transition-colors uppercase cursor-pointer text-sm font-bold tracking-wider"
                    >
                      Reportar
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.4)] relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))]"></div>
                <span className="block text-[10px] uppercase tracking-widest text-[hsl(var(--primary))] mb-3 font-bold pl-2">// DADOS DO ALVO SUSPEITO</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pl-2">
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">IP de Acesso</span>
                    <span className="text-white/90 font-bold">144.33.15.227</span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Usuário SSH</span>
                    <span className="text-[hsl(var(--primary))] font-bold drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]">operador_ia</span>
                  </div>
                  <div>
                    <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Porta de Conexão</span>
                    <span className="text-white/90 font-bold">22 - SSH</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-[hsl(var(--primary)/0.2)] pl-2">
                  <a 
                    href="/SSH_20260729-0233.ppk"
                    download="SSH_20260729-0233.ppk"
                    onClick={(e) => {
                      if (onLog) onLog(`[SEC-INFO] Operator downloaded PPK key for target 144.33.15.227.`);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-black transition-colors uppercase cursor-pointer text-xs font-bold tracking-wider"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    DOWNLOAD CHAVE PPK
                  </a>
                </div>
              </div>
            </div>
            
            <div className="text-center relative z-10 pt-4 border-t border-[hsl(var(--danger)/0.3)]">
              <span className="text-[hsl(var(--danger)/0.5)] text-[10px] uppercase tracking-widest font-bold">
                // PROTOCOLO DE CONTENÇÃO ATIVADO. SAÍDA BLOQUEADA.
              </span>
            </div>
          </div>
        </div>
      )}

      {selectedInstance && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-black border border-[hsl(var(--primary))] p-8 max-w-3xl w-full relative crt-flicker shadow-[0_0_50px_rgba(0,240,255,0.1)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(0,240,255,0.03)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none"></div>
            
            <div className="flex justify-between items-center mb-6 relative z-10 border-b border-[hsl(var(--primary)/0.3)] pb-4">
              <h3 className="text-[hsl(var(--primary))] text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                // Instance Details: {selectedInstance.id}
              </h3>

            </div>
            
            {(() => {
              const details = generateInstanceDetails(selectedInstance);
              return (
                <div className="grid grid-cols-2 gap-x-8 gap-y-5 font-mono text-sm relative z-10 mb-8">
                  <div className="space-y-4 flex flex-col">
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Firmware</span> <span className="text-white/90 font-bold">{details.firmware}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Operating system</span> <span className="text-white/90 font-bold">{details.os}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Version</span> <span className="text-white/90 font-bold">{details.version}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Launched</span> <span className="text-white/90 font-bold">{details.launched}</span></div>
                    <div className="bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.4)] p-2 -ml-2 rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))] animate-pulse"></div>
                      <span className="block text-white/60 text-[10px] uppercase tracking-widest mb-1 pl-2">Login User (Username)</span> 
                      <span className="text-[hsl(var(--primary))] font-bold text-lg pl-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">{details.loginUser}</span>
                    </div>
                    <div>
                      <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Boot volume type</span> 
                      <span className="text-white/90 font-bold">{details.bootVolume}</span>
                    </div>

                    {selectedInstance.id === 'instance-20260730-0200' && !aiMode && (
                      <div className="mt-2 p-2 border border-[hsl(var(--primary)/0.3)] bg-[hsl(var(--primary)/0.02)] relative overflow-hidden">
                        <div className="flex items-center justify-between mb-1">
                          <span className="block text-white/40 text-[10px] uppercase tracking-widest">Authorization Code</span>
                          {isVerifying && (
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[hsl(var(--primary))]">
                              {verifyResult === 'ACCEPTED' ? (
                                <span className="text-[hsl(var(--success))] drop-shadow-[0_0_5px_rgba(0,255,0,0.8)] animate-pulse">CODE ACCEPTED</span>
                              ) : verifyResult === 'DENIED' ? (
                                <span className="text-[hsl(var(--danger))] drop-shadow-[0_0_5px_rgba(255,0,0,0.8)] animate-pulse">ACCESS DENIED</span>
                              ) : (
                                <span className="animate-pulse">VERIFYING [{'>'.repeat(Math.floor(verifyProgress / 10)).padEnd(10, '·')}] {verifyProgress}%</span>
                              )}
                            </span>
                          )}
                        </div>
                        <input 
                          type="text" 
                          maxLength={17}
                          disabled={isVerifying}
                          value={secretCode}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && secretCode.trim().length > 0 && !isVerifying) {
                              setIsVerifying(true);
                              setVerifyProgress(0);
                              setVerifyResult('');
                              if (onLog) onLog(`[SYS] Initiating authorization sequence...`);
                              
                              let progress = 0;
                              const interval = setInterval(() => {
                                progress += 1;
                                setVerifyProgress(progress);
                                
                                if (progress >= 100) {
                                  clearInterval(interval);
                                  const isAccepted = secretCode.trim().toLowerCase() === 'llm-threathunting';
                                  setVerifyResult(isAccepted ? 'ACCEPTED' : 'DENIED');
                                  
                                  if (isAccepted) {
                                    if (onLog) onLog(`[SEC-CRITICAL] Override code accepted. THREAT HUNTING ENABLED.`);
                                    setTimeout(() => {
                                      setShowThreatModal(true);
                                      setSecretCode('');
                                      setIsVerifying(false);
                                      setVerifyProgress(0);
                                      setVerifyResult('');
                                    }, 2000);
                                  } else {
                                    if (onLog) onLog(`[ERR] Invalid authorization code. Incident logged.`);
                                    setTimeout(() => {
                                      setSecretCode('');
                                      setIsVerifying(false);
                                      setVerifyProgress(0);
                                      setVerifyResult('');
                                    }, 2000);
                                  }
                                }
                              }, 50); // 50ms * 100 = 5 seconds
                            }
                          }}
                          onChange={(e) => {
                            setSecretCode(e.target.value);
                          }}
                          className={`w-full bg-black border border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] text-sm p-1.5 outline-none font-mono transition-colors ${
                            isVerifying ? 'opacity-50 cursor-not-allowed' : 'focus:border-[hsl(var(--primary))]'
                          }`}
                          placeholder="Digite e pressione Enter..."
                        />
                      </div>
                    )}
                    
                    {selectedInstance.id === 'instance-20260729-0233' && !aiMode && (
                      <div className="mt-1.5 p-2 bg-[hsl(var(--danger)/0.05)] border border-[hsl(var(--danger)/0.3)] flex flex-col items-start">
                        <span className="block text-[hsl(var(--danger))] text-[10px] uppercase tracking-widest mb-1 font-bold animate-pulse">// Security Warning</span>
                        <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Opened Port</span> 
                        <span className="text-white/90 font-bold">22 - SSH</span>
                      </div>
                    )}
                    
                    {selectedInstance.id === 'instance-20260731-0358' && !aiMode && (
                      <div className="pt-4 border-t border-[hsl(var(--danger)/0.3)] mt-4">
                        <span className="block text-[hsl(var(--danger))] text-[10px] uppercase tracking-widest mb-2 font-bold animate-pulse">
                          // Threat Artifact Detected
                        </span>
                        <a 
                          href={selectedInstance.state !== 'RUNNING' ? undefined : "/audit_dump.log"}
                          download={selectedInstance.state !== 'RUNNING' ? undefined : "audit_dump.log"}
                          onClick={(e) => {
                            if (selectedInstance.state !== 'RUNNING') {
                              e.preventDefault();
                              if (onLog) onLog(`[ERR] Operation failed: Target instance is not RUNNING.`);
                              return;
                            }
                            if (onLog) onLog(`[SEC-CRITICAL] Malicious payload downloaded from target: ${selectedInstance.id}`);
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                            selectedInstance.state !== 'RUNNING'
                              ? 'bg-[hsl(var(--danger)/0.05)] border border-[hsl(var(--danger)/0.3)] text-[hsl(var(--danger)/0.5)] cursor-not-allowed'
                              : 'bg-[hsl(var(--danger)/0.1)] border border-[hsl(var(--danger))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-black cursor-pointer'
                          }`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                          </svg>
                          DOWNLOAD ARTIFACT
                        </a>
                      </div>
                    )}
                  </div>
                  <div className="space-y-4 flex flex-col">
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">OCPU count</span> <span className="text-white/90 font-bold">{details.ocpu}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Memory (GB)</span> <span className="text-white/90 font-bold">{details.memory}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Network bandwidth (Gbps)</span> <span className="text-white/90 font-bold">{details.network}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Virtual cloud network</span> <span className="text-[hsl(var(--primary))] font-bold">{details.vcn}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Public IPv4 Address</span> <span className="text-[hsl(var(--success))] font-bold">{selectedInstance.ip}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Local disk</span> <span className="text-white/90 font-bold">{details.localDisk}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Full stack DR</span> <span className="text-white/90 font-bold">{details.dr}</span></div>
                  </div>
                </div>
              );
            })()}
            
            <div className="flex justify-end relative z-10 pt-4 border-t border-[hsl(var(--primary)/0.3)]">
              <button 
                onClick={() => {
                  if (onLog && selectedInstance) onLog(`[SYS] Deep inspection session closed for target: ${selectedInstance.id}`);
                  setSelectedInstance(null);
                }}
                className="px-6 py-2 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.5)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-black transition-colors uppercase cursor-pointer text-sm font-bold tracking-wider"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
