import React, { useEffect, useState, useRef } from 'react';

const mockLogs = [
  "[SYS] Initializing core modules...",
  "[OK]  Module 'Neurolink' loaded.",
  "[WARN] High latency detected on Node i-99f01a.",
  "[SYS] Rerouting traffic through proxy-7...",
  "[OK]  Traffic rerouted successfully.",
  "[SEC] Analyzing inbound packet stream...",
  "[OK]  No anomalies detected in the last 60s.",
  "[SYS] Awaiting next command input_",
];

export default function Terminal() {
  const [logs, setLogs] = useState([]);
  const bottomRef = useRef(null);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < mockLogs.length) {
        const currentLog = mockLogs[index];
        setLogs((prev) => [...prev, currentLog]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div className="h-48 border-t border-[hsl(var(--primary)/0.5)] bg-black flex flex-col scanline">
      <div className="px-4 py-1 border-b border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] flex justify-between items-center">
        <span className="text-[hsl(var(--primary))] font-mono text-xs tracking-widest uppercase">Console Output //</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-white/20"></div>
          <div className="w-2 h-2 bg-white/40"></div>
          <div className="w-2 h-2 bg-[hsl(var(--primary))]"></div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 ${log.includes('[WARN]') ? 'text-[hsl(var(--danger))]' : 'text-[hsl(var(--success))]'}`}>
            <span className="opacity-50 mr-2">{`>`}</span>
            {log}
          </div>
        ))}
        {logs.length === mockLogs.length && (
          <div className="text-[hsl(var(--success))] crt-flicker">
            <span className="opacity-50 mr-2">{`>`}</span>
            <span className="inline-block w-2 h-4 bg-[hsl(var(--success))] align-middle ml-1"></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
