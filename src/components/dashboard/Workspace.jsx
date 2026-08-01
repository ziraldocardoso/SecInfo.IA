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

export default function Workspace({ activeService, emergencyPhase, onLog }) {
  const [instances, setInstances] = useState(INITIAL_INSTANCES);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [mlActivated, setMlActivated] = useState(false);

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
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white/90">
              {activeService?.name || 'Service'}
            </h1>
            <p className="text-[hsl(var(--primary))] font-mono text-xs mt-1">
              {activeService?.id === 1 ? '// Gestão de Instâncias de Computação' : '// Serviço Inativo - Infraestrutura Desligada'}
            </p>
          </div>
          <button 
            data-status={mlActivated ? "ATIVADO" : "DESATIVADO"}
            onClick={(e) => {
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
              data-[status=ATIVADO]:text-[hsl(var(--primary))] data-[status=ATIVADO]:drop-shadow-[0_0_8px_rgba(0,240,255,0.8)] 
              data-[status=ATIVADO]:animate-pulse
              ${!mlActivated && activeService?.id === 1 ? 'text-[hsl(var(--primary))]' : (!mlActivated ? 'text-white/40 border-white/20' : '')}
            `}
          >
            {mlActivated ? 'Modelo de Machine Learning' : 'Launch Node'}
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
              {activeService?.id === 1 ? 'DETECTED' : '00 DETECTED'}
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
                  <td className={`px-4 py-3 ${inst.id === 'instance-20260731-0358' ? 'text-[#ff9999] drop-shadow-[0_0_5px_rgba(255,0,0,0.8)]' : 'text-white/90'}`}>
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
                  <div className="space-y-4">
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Firmware</span> <span className="text-white/90 font-bold">{details.firmware}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Operating system</span> <span className="text-white/90 font-bold">{details.os}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Version</span> <span className="text-white/90 font-bold">{details.version}</span></div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Launched</span> <span className="text-white/90 font-bold">{details.launched}</span></div>
                    <div className="bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.4)] p-2 -ml-2 rounded-sm relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))] animate-pulse"></div>
                      <span className="block text-white/60 text-[10px] uppercase tracking-widest mb-1 pl-2">Login User (Username)</span> 
                      <span className="text-[hsl(var(--primary))] font-bold text-lg pl-2 drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]">{details.loginUser}</span>
                    </div>
                    <div><span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Boot volume type</span> <span className="text-white/90 font-bold">{details.bootVolume}</span></div>
                    
                    {selectedInstance.id === 'instance-20260729-0233' && (
                      <div className="mt-4 p-2 bg-[hsl(var(--danger)/0.05)] border border-[hsl(var(--danger)/0.3)]">
                        <span className="block text-[hsl(var(--danger))] text-[10px] uppercase tracking-widest mb-1 font-bold animate-pulse">// Security Warning</span>
                        <span className="block text-white/40 text-[10px] uppercase tracking-widest mb-1">Opened Port</span> 
                        <span className="text-white/90 font-bold">22 - SSH</span>
                      </div>
                    )}
                    
                    {selectedInstance.id === 'instance-20260731-0358' && (
                      <div className="pt-4 border-t border-[hsl(var(--danger)/0.3)] mt-4">
                        <span className="block text-[hsl(var(--danger))] text-[10px] uppercase tracking-widest mb-2 font-bold animate-pulse">
                          // Threat Artifact Detected
                        </span>
                        <a 
                          href={selectedInstance.state === 'STOPPED' ? undefined : "/audit_dump.log"}
                          download={selectedInstance.state === 'STOPPED' ? undefined : "audit_dump.log"}
                          onClick={(e) => {
                            if (selectedInstance.state === 'STOPPED') {
                              e.preventDefault();
                              if (onLog) onLog(`[ERR] Operation failed: Target instance is currently OFFLINE.`);
                              return;
                            }
                            if (onLog) onLog(`[SEC-CRITICAL] Malicious payload downloaded from target: ${selectedInstance.id}`);
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-colors ${
                            selectedInstance.state === 'STOPPED'
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
                  <div className="space-y-4">
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
