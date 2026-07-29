import React from 'react';

const services = [
  { id: 1, name: 'Neon-Compute Nodes', active: true },
  { id: 2, name: 'DataVault-Sector7', active: false },
  { id: 3, name: 'Security Groups/FW', active: false },
  { id: 4, name: 'Neurolink Analytics', active: false },
  { id: 5, name: 'Access Logs', active: false },
];

export default function Sidebar() {
  return (
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
                className={`w-full text-left px-4 py-2 text-sm uppercase font-sans tracking-wider border-l-2 transition-colors duration-0 cursor-pointer ${
                  service.active
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
        <div className="danger-border bg-[hsl(var(--danger)/0.1)] p-3 text-center cursor-pointer hover:bg-[hsl(var(--danger))] hover:text-black transition-colors duration-0">
          <span className="uppercase text-xs font-bold tracking-widest text-[hsl(var(--danger))] group-hover:text-black">
            Emergency Halt
          </span>
        </div>
      </div>
    </aside>
  );
}
