import React, { useState } from 'react';

export default function LoginModal({ onClose }) {
  const [tenant, setTenant] = useState('');
  const [username, setUsername] = useState('operador_ia');
  const [password, setPassword] = useState('**********');
  const [step, setStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <>
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm font-sans" style={{ color: '#161514' }}>
        <div className="bg-white w-[500px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden flex flex-col relative">
          <div className="bg-[#161514] p-4 flex items-center justify-between border-b-4 border-[#C74634]">
            <div className="flex items-center gap-2">
              <svg width="160" height="24" viewBox="0 0 160 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C15.31 6 18 8.69 18 12C18 15.31 15.31 18 12 18Z" fill="#C74634"/>
                <text x="28" y="18" fill="white" fontSize="18" fontFamily="Arial, sans-serif" fontWeight="bold" letterSpacing="-0.5">ORACLE</text>
                <text x="104" y="17" fill="#ccc" fontSize="15" fontFamily="Arial, sans-serif" fontWeight="normal">Cloud</text>
              </svg>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white cursor-pointer text-2xl leading-none">&times;</button>
          </div>

          <div className="p-8 bg-white text-[#161514]">
            <h2 className="text-3xl font-light mb-6 text-[#161514]">Sign In</h2>
            
            {step === 1 ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#4f4f4f]">Cloud Tenant</label>
                  <input 
                    type="text" 
                    value={tenant}
                    onChange={(e) => setTenant(e.target.value)}
                    className="w-full border border-[#8a8a8c] p-3 focus:outline-none focus:border-[#C74634] focus:ring-1 focus:ring-[#C74634] transition-colors"
                    placeholder="Enter your Cloud Tenant"
                  />
                </div>
                <button 
                  onClick={() => {
                    if (tenant.trim().toLowerCase() === 'neo-alagoas') {
                      setErrorMessage('');
                      setStep(2);
                    } else {
                      setErrorMessage('Tenant not found. Please verify the Cloud Tenant name and try again.');
                    }
                  }}
                  className="w-full bg-[#161514] text-white p-3 font-semibold hover:bg-[#333] transition-colors mt-4 text-center cursor-pointer"
                >
                  Next
                </button>
                
                <div className="pt-6 mt-6 border-t border-[#d5d5d5] text-sm text-center">
                  <a href="#" onClick={(e) => { e.preventDefault(); setErrorMessage('Nothing to do'); }} className="text-[#0572ce] hover:underline">Forgot your Cloud Tenant?</a>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="text-sm text-[#4f4f4f] bg-[#f9f9f9] p-3 border border-[#d5d5d5] rounded-sm mb-6 flex justify-between items-center">
                  <span>Sign in to tenant: <span className="font-bold text-[#161514]">{tenant || 'neo-alagoas'}</span></span>
                  <button onClick={() => setStep(1)} className="text-[#0572ce] hover:underline text-xs">Change</button>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#4f4f4f]">Username</label>
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full border border-[#8a8a8c] p-3 focus:outline-none focus:border-[#C74634] focus:ring-1 focus:ring-[#C74634] transition-colors"
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-[#4f4f4f]">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-[#8a8a8c] p-3 focus:outline-none focus:border-[#C74634] focus:ring-1 focus:ring-[#C74634] transition-colors"
                    placeholder="Enter password"
                  />
                </div>
                <button 
                  onClick={() => {
                    setErrorMessage('ACESSO NEGADO: Sua conexão foi interceptada e encerrada pelo nosso motor Inteligente IDS/IPS devido a padrões comportamentais anômalos. Um relatório de segurança foi gerado.');
                  }}
                  className="w-full bg-[#C74634] text-white p-3 font-semibold hover:bg-[#a6392a] transition-colors mt-6 text-center cursor-pointer"
                >
                  Sign In
                </button>
              </div>
            )}
            
            <div className="mt-8 text-xs text-[#4f4f4f] flex justify-between pt-6 border-t border-[#d5d5d5]">
              <a href="#" onClick={(e) => { e.preventDefault(); setErrorMessage('Nothing to do'); }} className="text-[#0572ce] hover:underline">Help</a>
              <a href="#" onClick={(e) => { e.preventDefault(); setErrorMessage('Nothing to do'); }} className="text-[#0572ce] hover:underline">Terms of Use</a>
            </div>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white border-t-4 border-[#C74634] w-[400px] shadow-2xl flex flex-col rounded-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-[#161514]">
              <div className="flex items-start gap-4 mb-6">
                <div className="mt-1 text-[#e22f22] shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <div className="text-sm font-medium leading-relaxed">
                  {errorMessage}
                </div>
              </div>
              <div className="flex justify-end pt-4 border-t border-[#f0f0f0]">
                <button 
                  onClick={() => {
                    if (errorMessage.startsWith('ACESSO NEGADO')) {
                      const a = document.createElement('a');
                      a.href = "/IDS-IPS.log";
                      a.download = "IDS-IPS.log";
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                    }
                    setErrorMessage('');
                  }}
                  className="bg-[#161514] text-white px-6 py-2 text-sm font-semibold hover:bg-[#333] transition-colors cursor-pointer"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
