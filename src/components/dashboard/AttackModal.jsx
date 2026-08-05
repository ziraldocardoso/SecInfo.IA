import React, { useState } from 'react';
import AttackExecutionModal from './AttackExecutionModal';

export const HACKER_IPS = [
  '185.15.22.40',
  '91.132.14.77',
  '203.44.18.99',
  '45.33.22.11',
  '89.144.33.200',
  '104.22.19.85',
  '177.55.20.10'
];

export const validateTargetIp = (ipStr, isBlur = false) => {
  const clean = ipStr.trim();
  if (!clean) {
    return { isValid: false, message: isBlur ? 'IP inválido, tente novamente.' : '' };
  }

  const parts = clean.split('.');

  // Verifica octetos inválidos (não numéricos, < 0 ou > 255)
  const hasInvalidOctet = parts.some(p => p !== '' && (isNaN(p) || Number(p) < 0 || Number(p) > 255));
  if (hasInvalidOctet) {
    return { isValid: false, message: 'IP inválido, tente novamente.' };
  }

  // Se tiver mais de 4 octetos
  if (parts.length > 4) {
    return { isValid: false, message: 'IP inválido, tente novamente.' };
  }

  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  // Se completou a digitação (4 octetos informados)
  if (parts.length === 4 && parts[3] !== '') {
    if (!ipv4Regex.test(clean)) {
      return { isValid: false, message: 'IP inválido, tente novamente.' };
    }
    if (!HACKER_IPS.includes(clean)) {
      return { isValid: false, message: 'IP inválido, tente novamente.' };
    }
    return { isValid: true, message: '' };
  }

  // Ao perder o foco (blur) e estar incompleto (< 4 octetos)
  if (isBlur) {
    return { isValid: false, message: 'IP inválido, tente novamente.' };
  }

  return { isValid: false, message: '' };
};

export const VECTOR_DEFAULT_PORTS = {
  'DDoS SYN Flood': '80, 443, 8080',
  'Reverse Shell Exploit': '22, 4444',
  'BGP Route Poisoning': '179',
  'Buffer Overflow Payload': '445'
};

export default function AttackModal({ onClose, onLog }) {
  const [targetIp, setTargetIp] = useState('');
  const [attackVector, setAttackVector] = useState('');
  const [targetPort, setTargetPort] = useState('');
  const [payloadIntensity, setPayloadIntensity] = useState('');
  const [ipError, setIpError] = useState('');
  const [isValidIp, setIsValidIp] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);

  const isFormValid = 
    isValidIp &&
    Boolean(attackVector) &&
    Boolean(targetPort.trim()) &&
    Boolean(payloadIntensity);

  const checkIpValidation = (value, isBlur = false) => {
    const res = validateTargetIp(value, isBlur);
    setIpError(res.message);
    setIsValidIp(res.isValid);
    return res;
  };

  const handleIpChange = (e) => {
    const val = e.target.value;
    setTargetIp(val);
    checkIpValidation(val, false);
  };

  const handleIpBlur = () => {
    checkIpValidation(targetIp, true);
  };

  const handleVectorChange = (e) => {
    const selectedVector = e.target.value;
    setAttackVector(selectedVector);
    setTargetPort(VECTOR_DEFAULT_PORTS[selectedVector] || '');
  };

  const handleLaunch = () => {
    const valResult = checkIpValidation(targetIp, true);
    if (!valResult.isValid || !isFormValid) {
      return;
    }
    setShowExecutionModal(true);
  };

  if (showExecutionModal) {
    return (
      <AttackExecutionModal 
        targetIp={targetIp.trim()}
        attackVector={attackVector}
        targetPort={targetPort.trim()}
        payloadIntensity={payloadIntensity}
        onLog={onLog}
        onClose={() => {
          setShowExecutionModal(false);
        }}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="bg-black border border-[hsl(var(--danger))] p-8 max-w-xl w-full relative crt-flicker shadow-[0_0_50px_rgba(255,0,0,0.3)] font-mono">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.04)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none"></div>

        <div className="flex justify-between items-center mb-6 border-b border-[hsl(var(--danger)/0.4)] pb-4 relative z-10">
          <h3 className="text-[hsl(var(--danger))] text-lg font-bold uppercase tracking-widest flex items-center gap-2 drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
            <span className="animate-pulse">⚔️</span> // AI CYBER COUNTER-ATTACK CONSOLE
          </h3>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5 relative z-10 mb-6">
          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-1">
              Target Host IP (Endereço Hostil Operador):
            </label>
            <div className="relative">
              <input 
                type="text"
                value={targetIp}
                onChange={handleIpChange}
                onBlur={handleIpBlur}
                placeholder="0.0.0.0"
                className={`w-full bg-black border text-sm font-bold p-2 outline-none transition-colors ${
                  ipError 
                    ? 'border-red-500 text-red-400 shadow-[0_0_10px_rgba(255,0,0,0.5)]' 
                    : isValidIp 
                      ? 'border-green-500 text-green-400 shadow-[0_0_10px_rgba(0,255,0,0.3)]' 
                      : 'border-[hsl(var(--danger)/0.5)] text-[hsl(var(--danger))] focus:border-[hsl(var(--danger))]'
                }`}
              />
            </div>

            {ipError && (
              <div className="mt-2 p-2 border border-red-500/50 bg-red-950/40 text-red-400 text-xs font-bold flex items-center gap-2 animate-pulse">
                <span>⚠️</span> {ipError}
              </div>
            )}

            <span className="text-[10px] text-white/40 mt-1 block">
              *Use IPs hostis ativos detectados nos logs (contra-ataque os hackers)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-1">
                Vetor de Ataque (Payload):
              </label>
              <select
                value={attackVector}
                onChange={handleVectorChange}
                className="w-full bg-black border border-[hsl(var(--danger)/0.5)] text-white/90 p-2 outline-none text-sm cursor-pointer"
              >
                <option value="">-- Selecione o Vetor --</option>
                <option value="DDoS SYN Flood">DDoS SYN Flood</option>
                <option value="Reverse Shell Exploit">Reverse Shell Exploit</option>
                <option value="BGP Route Poisoning">BGP Route Poisoning</option>
                <option value="Buffer Overflow Payload">Buffer Overflow Payload</option>
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-white/60 mb-1">
                Porta Alvo:
              </label>
              <input 
                type="text"
                value={targetPort}
                onChange={(e) => setTargetPort(e.target.value)}
                placeholder="Ex: 80, 443 ou 1-1024"
                className="w-full bg-black border border-[hsl(var(--danger)/0.5)] text-white/90 p-2 outline-none text-sm font-mono placeholder-white/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-widest text-white/60 mb-1">
              Intensidade da Carga:
            </label>
            <select
              value={payloadIntensity}
              onChange={(e) => setPayloadIntensity(e.target.value)}
              className="w-full bg-black border border-[hsl(var(--danger)/0.5)] text-white/90 p-2 outline-none text-sm cursor-pointer"
            >
              <option value="">-- Selecione a Intensidade --</option>
              <option value="BALANCED">MODERADO (Stealth)</option>
              <option value="HIGH">ALTO IMPACTO</option>
              <option value="OVERDRIVE">OVERDRIVE (Destrutivo)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-[hsl(var(--danger)/0.3)] pt-4 relative z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-white/20 text-white/60 hover:text-white hover:bg-white/10 text-xs uppercase cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleLaunch}
            disabled={!isFormValid}
            className={`px-6 py-2 border font-bold text-xs uppercase transition-colors tracking-wider ${
              isFormValid
                ? 'bg-[hsl(var(--danger)/0.2)] border-[hsl(var(--danger))] text-[hsl(var(--danger))] hover:bg-[hsl(var(--danger))] hover:text-black cursor-pointer shadow-[0_0_15px_rgba(255,0,0,0.4)]'
                : 'bg-white/5 border-white/10 text-white/30 cursor-not-allowed opacity-50'
            }`}
          >
            Lançar Retaliação
          </button>
        </div>
      </div>
    </div>
  );
}

