import React from 'react';

const mockInstances = [
  { id: 'i-04f8b9', type: 't3.micro', state: 'Running', ip: '192.168.1.10', cpu: '12%' },
  { id: 'i-09a1c2', type: 'c5.large', state: 'Running', ip: '192.168.1.14', cpu: '45%' },
  { id: 'i-11b3e4', type: 't3.micro', state: 'Stopped', ip: '-', cpu: '-' },
  { id: 'i-99f01a', type: 'm5.xlarge', state: 'Warning', ip: '192.168.1.22', cpu: '98%' },
];

export default function Workspace() {
  return (
    <main className="flex-1 p-6 overflow-y-auto bg-black relative">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff0a_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff0a_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto space-y-6">
        <header className="flex justify-between items-end border-b border-[hsl(var(--primary)/0.3)] pb-4">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-widest text-white/90">Neon-Compute Nodes</h1>
            <p className="text-[hsl(var(--primary))] font-mono text-xs mt-1">{"// Gestão de Instâncias de Computação"}</p>
          </div>
          <button className="neon-border bg-black text-[hsl(var(--primary))] px-4 py-2 text-sm uppercase hover:bg-[hsl(var(--primary))] hover:text-black transition-colors duration-0 cursor-pointer">
            Launch Node
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Status Cards */}
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--primary)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Total Nodes</h3>
            <div className="text-3xl font-mono text-[hsl(var(--primary))]">4,096</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--success)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Network Health</h3>
            <div className="text-3xl font-mono text-[hsl(var(--success))]">OPTIMAL</div>
          </div>
          <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--danger)/0.3)] p-4">
            <h3 className="text-xs uppercase text-white/60 mb-2">Active Threats</h3>
            <div className="text-3xl font-mono text-[hsl(var(--danger))] crt-flicker">02 DETECTED</div>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-black/50 backdrop-blur-sm border border-[hsl(var(--primary)/0.3)] overflow-hidden">
          <table className="w-full text-left font-mono text-sm">
            <thead className="bg-[hsl(var(--primary)/0.1)] border-b border-[hsl(var(--primary)/0.3)]">
              <tr>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Instance ID</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Type</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">State</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">IPv4 Address</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">CPU Util</th>
                <th className="px-4 py-3 font-normal text-[hsl(var(--primary))]">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInstances.map((inst, idx) => (
                <tr key={idx} className="border-b border-[hsl(var(--primary)/0.1)] hover:bg-[hsl(var(--primary)/0.05)] transition-colors">
                  <td className="px-4 py-3 text-white/90">{inst.id}</td>
                  <td className="px-4 py-3 text-white/60">{inst.type}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 text-xs border ${
                      inst.state === 'Running' ? 'text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.1)]' :
                      inst.state === 'Warning' ? 'text-[hsl(var(--danger))] border-[hsl(var(--danger)/0.3)] bg-[hsl(var(--danger)/0.1)] crt-flicker' :
                      'text-white/40 border-white/20 bg-white/5'
                    }`}>
                      {inst.state}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/60">{inst.ip}</td>
                  <td className="px-4 py-3 text-white/60">{inst.cpu}</td>
                  <td className="px-4 py-3">
                    <button className="text-[hsl(var(--primary))] hover:text-white hover:underline cursor-pointer">Manage</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
