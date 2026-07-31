import React, { useEffect, useState, useRef } from 'react';

export default function Terminal({ logs = [], onLog }) {
  const bottomRef = useRef(null);
  const ipRef = useRef(null);
  const intervalRef = useRef(null);
  const [height, setHeight] = useState(192);
  const [connections, setConnections] = useState(0);

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const wsUrl = import.meta.env.VITE_WS_URL || `${protocol}//${host}:3001`;
    
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.count === 'number') {
          setConnections(data.count);
        }
        if (data.ip && !ipRef.current) {
          ipRef.current = data.ip;
          if (onLog) {
            const msg = `[NET] Active connection from IP: ${data.ip}`;
            onLog(msg); // Log imediato na conexão
            intervalRef.current = setInterval(() => {
              onLog(msg);
            }, 60000); // Repete a cada 60 segundos
          }
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message", e);
      }
    };

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ws.close();
    };
  }, []);

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = height;

    const handleMouseMove = (moveEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(startHeight + deltaY, window.innerHeight - 100));
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  return (
    <div 
      className="border-t border-[hsl(var(--primary)/0.5)] bg-black flex flex-col scanline"
      style={{ height: `${height}px` }}
    >
      <div 
        className="px-4 py-1 border-b border-[hsl(var(--primary)/0.2)] bg-[hsl(var(--primary)/0.05)] flex justify-between items-center cursor-row-resize select-none"
        onMouseDown={handleMouseDown}
      >
        <span className="text-[hsl(var(--primary))] font-mono text-xs tracking-widest uppercase">Console Output //</span>
        <div className="flex gap-4 items-center">
          <span className="text-[hsl(var(--primary))] font-mono text-xs tracking-widest uppercase opacity-80">
            Browsers conectados agora: <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 border border-[hsl(var(--primary)/0.4)] bg-[hsl(var(--primary)/0.1)] rounded-sm font-bold opacity-100">{connections}</span>
          </span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-white/20"></div>
            <div className="w-2 h-2 bg-white/40"></div>
            <div className="w-2 h-2 bg-[hsl(var(--primary))]"></div>
          </div>
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto font-mono text-sm">
        {logs.map((log, i) => {
          let colorClass = 'text-[hsl(var(--success))]';
          if (log.includes('[WARN]')) colorClass = 'text-[hsl(var(--danger))]';
          else if (log.includes('[NET]')) colorClass = 'text-amber-500';

          return (
            <div key={i} className={`mb-1 ${colorClass}`}>
              <span className="opacity-50 mr-2">{`>`}</span>
              {log}
            </div>
          );
        })}
        <div className="text-[hsl(var(--success))] crt-flicker mt-2">
          <span className="opacity-50 mr-2">{`>`}</span>
          <span className="inline-block w-2 h-4 bg-[hsl(var(--success))] align-middle ml-1"></span>
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
