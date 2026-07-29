import React, { useState, useEffect } from 'react';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import Workspace from './components/dashboard/Workspace';
import Terminal from './components/dashboard/Terminal';

function App() {
  const [isFailing, setIsFailing] = useState(false);
  const [ufo, setUfo] = useState({ visible: false, top: 0, duration: 4 });
  const [hackerVisible, setHackerVisible] = useState(false);

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

  return (
    <div className={`h-screen w-screen overflow-hidden bg-black flex flex-col font-sans selection:bg-[hsl(var(--primary)/0.3)] text-white ${isFailing ? 'tv-fail-effect' : ''}`}>
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
