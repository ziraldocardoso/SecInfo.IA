import React from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Workspace from './components/dashboard/Workspace';
import Terminal from './components/dashboard/Terminal';

function App() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-black flex flex-col font-sans selection:bg-[hsl(var(--primary)/0.3)] text-white">
      {/* Top Navigation Bar */}
      <Topbar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Workspace + Terminal Vertical Stack */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Workspace />
          <Terminal />
        </div>
      </div>
    </div>
  );
}

export default App;
