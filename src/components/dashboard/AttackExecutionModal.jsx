import React, { useState, useEffect, useRef } from 'react';

// Roteiros simulados detalhados para cada vetor de ataque conduzidos pela LLM Ofensiva
const VECTOR_SCENARIOS = {
  'DDoS SYN Flood': {
    title: 'SYN FLOOD DISTRIBUÍDO & EXAUSTÃO TCP',
    icon: '⚡',
    llmModel: 'CYBER-LLM-SYNFLOOD-ENGINE v4.9',
    steps: [
      { progress: 15, thought: 'Analisando capacidade de resposta TCP handshake em {targetIp}:{targetPort}...', log: '[AGENT-LLM] Inicializando botnet cluster com 12.000 nós zumbis autorizados.' },
      { progress: 35, thought: 'Gerando cabeçalhos IP/TCP forjados com números de sequência aleatórios...', log: '[RAW-SOCKET] Enviando rajadas SYN com Spoofed Source IP. Taxa inicial: 450.000 pps.' },
      { progress: 60, thought: 'Identificando saturação de syn-cookies e fila de conexões pendentes (SYN-RECEIVED)...', log: '[METRIC-SYNC] Largura de banda atingida: 24.8 Gbps. Latência do alvo subiu para 8.400ms.' },
      { progress: 85, thought: 'Estouro da tabela TCB (Transmission Control Block) no kernel do alvo...', log: '[NET-STATS] Saturação de socket 100%. Servidor recusa novas conexões (HTTP 504 / Connection Timed Out).' },
      { progress: 100, thought: 'Alvo completamente paralisado. Manter carga estática por 300s para bloqueio definitivo.', log: '[VICTORY] Retaliação DDoS concluída com sucesso! Hostil desconectado da rede.' }
    ],
    getMetrics: (step) => ({
      gbps: (step * 8.5 + Math.random() * 2).toFixed(1),
      pps: (step * 380000 + Math.floor(Math.random() * 50000)).toLocaleString(),
      latency: step < 4 ? `${step * 2100 + 450}ms` : 'TIMEOUT (INF)',
      status: step < 3 ? 'SYN_SENT' : step === 3 ? 'QUEUE_FULL' : 'SERVICE_UNAVAILABLE'
    })
  },

  'Reverse Shell Exploit': {
    title: 'EXPLORAÇÃO DE CONEXÃO REVERSA (REVERSE SHELL RCE)',
    icon: '🐚',
    llmModel: 'CYBER-LLM-EXPLOIT-GEN v2.4',
    steps: [
      { progress: 15, thought: 'Varrendo assinaturas de serviços vulneráveis em {targetIp}:{targetPort}...', log: '[SCANNER] Vulnerabilidade conhecida encontrada no daemon remoto (CVE-2023-RCE-HIGH).' },
      { progress: 35, thought: 'Sintetizando payload de reverse shell em assembly x86_64 limpo (sem null-bytes)...', log: '[PAYLOAD-GEN] Stager compilado: socket(AF_INET, SOCK_STREAM) -> connect(10.0.4.12:4444) -> dup2 -> execve(/bin/sh).' },
      { progress: 65, thought: 'Disparando exploit contra o vetor de escuta do hostil...', log: '[EXPLOIT] Injetando payload na memória. Aguardando callback do socket reverso...' },
      { progress: 85, thought: 'Conexão TCP reversa recebida! Estabilizando PTY com python pty.spawn()...', log: '[SHELL-ESTABLISHED] Conexão remota iniciada: root@{targetIp}:/# (UID 0 - Privilégio Máximo).' },
      { progress: 100, thought: 'Executando script pós-exploração para neutralizar processos maliciosos e derrubar serviços hostis...', log: '[COMMAND] # pkill -9 -f hacker_daemon && systemctl stop hostile_svc. HOST SUBVERTIDO.' }
    ],
    getMetrics: (step) => ({
      shellPrompt: step >= 3 ? `root@${step >= 4 ? 'NEUTRALIZED-' : ''}hostil:/#` : 'no-active-session',
      uid: step >= 3 ? '0 (root)' : 'N/A',
      stagerSize: '248 bytes',
      sessionStatus: step >= 3 ? 'CONNECTED (ENCRYPTED)' : 'HANDSHAKE_PENDING'
    })
  },

  'BGP Route Poisoning': {
    title: 'ENVENENAMENTO DE ROTA BGP & SEQUESTRO DE AS (AS-PATH HIJACK)',
    icon: '🌐',
    llmModel: 'CYBER-LLM-ROUTING-ENGINE v5.1',
    steps: [
      { progress: 15, thought: 'Mapeando Sistema Autônomo (AS) e prefixos CIDR anunciados pelo hostil em {targetIp}...', log: '[BGP-NEIGHBOR] Estabelecendo sessão TCP com BGP peer na porta 179...' },
      { progress: 35, thought: 'Construindo anúncio BGP UPDATE malicioso com prefixo mais específico (/24)...', log: '[BGP-INJECT] Enviando BGP UPDATE: Announcing prefix {targetIp}/32 via AS65534 (Rogue AS).' },
      { progress: 65, thought: 'Propagando rotas falsas para os roteadores Tier-1 de trânsito global...', log: '[ROUTE-FLAP] Tabela RIB global atualizada. AS-PATH prepending forçado para desviar fluxo.' },
      { progress: 85, thought: 'Redirecionando 100% do tráfego do operador hostil para Sinkhole nulo (/dev/null)...', log: '[TRAFFIC-BLACKHOLE] Pacotes do hostil capturados e descartados pela nossa rota envenenada.' },
      { progress: 100, thought: 'Tabela de roteamento global convergida. O alvo está completamente isolado da Internet.', log: '[ISOLATED] Retaliação de Roteamento BGP concluída. Host sem comunicação.' }
    ],
    getMetrics: (step) => ({
      asPath: step < 2 ? 'AS65000 -> AS13335 -> TARGET' : 'AS65534 (ROGUE) -> BLACKHOLE',
      divertedTraffic: step < 2 ? '0%' : step === 2 ? '42%' : step === 3 ? '89%' : '100%',
      bgpState: step >= 3 ? 'ESTABLISHED (POISONED)' : 'OPENSENT',
      prefixesHijacked: step >= 2 ? '1 (Target CIDR)' : '0'
    })
  },

  'Buffer Overflow Payload': {
    title: 'OVERFLOW DE BUFFER NO BUFFER DE MEMÓRIA & HIJACK DE RIP',
    icon: '💥',
    llmModel: 'CYBER-LLM-EXPLOIT-NATIVE x86_64',
    steps: [
      { progress: 15, thought: 'Calculando offset exato para sobrescrever o registrador de retorno EIP/RIP em {targetIp}:{targetPort}...', log: '[FUZZING] Pattern de 512 bytes enviado. Crash detectado em offset 264 bytes.' },
      { progress: 35, thought: 'Procurando instruções ROP gadgets (pop rdi; ret) em bibliotecas carregadas para bypass de DEP/NX...', log: '[ROP-CHAIN] Gadgets localizados na libc remota: 0x00007ffff7a123d3 (pop rdi; ret).' },
      { progress: 65, thought: 'Montando estrutura de memória: [ NOP SLED ] + [ SHELLCODE ] + [ ROP CHAIN ]...', log: '[PAYLOAD-INJECT] Transmitindo buffer corrompido para o socket de escuta...' },
      { progress: 85, thought: 'Estouro de pilha executado! RIP redirecionado para o endereço do nosso NOP sled na heap...', log: '[REGISTER-HIJACK] RIP sobrescrito com 0x7FFFFFFFDE40 -> Salto para shellcode executado.' },
      { progress: 100, thought: 'Código arbitrário em ring-0/kernel executado. Processo do atacante finalizado na memória.', log: '[MEMORY-CLEAN] Processo invasor derrubado via falha estrutural. Host paralisado.' }
    ],
    getMetrics: (step) => ({
      ripRegister: step < 3 ? '0x000000000040114f' : '0x00007fffffffde40 [HIJACKED]',
      rspRegister: step < 3 ? '0x00007fffffffe120' : '0x00007fffffffe018 [CORRUPTED]',
      nopSled: step >= 2 ? '64 Bytes (0x90)' : '0 Bytes',
      depBypass: step >= 2 ? 'ENABLED (ROP Active)' : 'PENDING'
    })
  }
};

const FAILURE_SCENARIOS = {
  'DDoS SYN Flood': [
    { progress: 20, thought: 'Testando conectividade de porta e largura de banda do hostil...', log: '[AGENT-LLM] Inicializando rajada de pacotes TCP SYN...' },
    { progress: 50, thought: 'Monitoriando firewall e filtros de mitigação de tráfego volumétrico do alvo...', log: '[WARN] WAF detectou anomalia de tráfego. Ativando rate-limiting e scrubbing center...' },
    { progress: 80, thought: 'Filtragem por listas pretas dinâmicas ativada nos provedores de trânsito...', log: '[DROP] Pacotes SYN descartados no IP de borda. Impossível exaurir tabela TCB.' },
    { progress: 100, thought: 'Retaliação frustrada por defesas automatizadas do alvo.', log: '[FAIL] ATAQUE FRACASSADO! O hostil mitigou a retaliação DDoS através de mitigação anti-DDoS ativa.' }
  ],
  'Reverse Shell Exploit': [
    { progress: 25, thought: 'Sintetizando payload exploit e estabelecendo escuta em socket reverso...', log: '[EXPLOIT] Transmitindo buffer payload para porta alvo...' },
    { progress: 60, thought: 'Aguardando callback de conexão TCP reversa...', log: '[NET-WAIT] Tentativa de callback interceptada por regras de Firewall Outbound (Egress Filtering).' },
    { progress: 100, thought: 'Nenhum socket reverso obtido. Conexão bloqueada na saída do alvo.', log: '[FAIL] ATAQUE FRACASSADO! Conexão reversa recusada por políticas de segurança estritas.' }
  ],
  'BGP Route Poisoning': [
    { progress: 30, thought: 'Tentando sincronizar sessão BGP Peer com AS vizinho...', log: '[BGP-NEIGHBOR] Transmitindo BGP OPEN Message...' },
    { progress: 70, thought: 'Validando autenticação MD5 e filtros RPKI no roteador remotos...', log: '[BGP-REJECT] Rota rejeitada por validação RPKI (ROA Invalido). AS-PATH inválido.' },
    { progress: 100, thought: 'Injeção de rota rejeitada pela malha de roteadores Tier-1.', log: '[FAIL] ATAQUE FRACASSADO! Sequestro de rota BGP rejeitado por RPKI/BGPsec.' }
  ],
  'Buffer Overflow Payload': [
    { progress: 30, thought: 'Injetando padrão de fuzzer para forçar estouro de pilha na memória remote...', log: '[PAYLOAD] Enviando carga de estouro para o buffer...' },
    { progress: 65, thought: 'Examinando integridade de registradores EIP/RIP e mitigação da pilha...', log: '[STACK-CANARY] Detectado Stack Smashing Protector (Canary) ou ASLR avançado.' },
    { progress: 100, thought: 'Processo encerrado com SIGSEGV abortado pelo kernel antes da execução do ROP chain.', log: '[FAIL] ATAQUE FRACASSADO! Exploração de estouro de memória mitigada por proteção Stack Canary/ASLR.' }
  ]
};

export const FIXED_RESPONSE_HASH = 'RTV4S016OWFI';

export default function AttackExecutionModal({ targetIp, attackVector, targetPort, payloadIntensity, onClose, onLog }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [logStream, setLogStream] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(true);
  const logEndRef = useRef(null);

  const isMandatorySuccess = 
    attackVector === 'Reverse Shell Exploit' && 
    payloadIntensity.toUpperCase() === 'OVERDRIVE';

  const selectedScenario = useRef(null);

  if (!selectedScenario.current) {
    const successScenario = VECTOR_SCENARIOS[attackVector] || VECTOR_SCENARIOS['DDoS SYN Flood'];
    if (isMandatorySuccess) {
      selectedScenario.current = { ...successScenario, isSuccess: true };
    } else {
      // 40% de chance de falhar para aumentar a veracidade
      const rollFail = Math.random() < 0.40;
      if (rollFail && FAILURE_SCENARIOS[attackVector]) {
        const failSteps = FAILURE_SCENARIOS[attackVector];
        const baseScenario = VECTOR_SCENARIOS[attackVector] || VECTOR_SCENARIOS['DDoS SYN Flood'];
        selectedScenario.current = {
          ...baseScenario,
          steps: failSteps,
          isSuccess: false
        };
      } else {
        selectedScenario.current = { ...successScenario, isSuccess: true };
      }
    }
  }

  const scenario = selectedScenario.current;
  const showHashBox = isMandatorySuccess;

  useEffect(() => {
    // Adiciona log inicial
    const initialLog = `[SYSTEM-INIT] LLM Ofensiva ativada. Alvo: ${targetIp}:${targetPort} | Intensidade: ${payloadIntensity}`;
    setLogStream([initialLog]);

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < scenario.steps.length) {
        const stepData = scenario.steps[stepIdx];
        const formattedThought = stepData.thought.replace('{targetIp}', targetIp).replace('{targetPort}', targetPort);
        const formattedLog = stepData.log.replace('{targetIp}', targetIp).replace('{targetPort}', targetPort);

        setLogStream(prev => [
          ...prev,
          `[LLM-THOUGHT] ${formattedThought}`,
          formattedLog
        ]);

        setCurrentStep(stepIdx);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsCompleted(true);
        setIsSuccess(scenario.isSuccess);
        if (onLog) {
          if (scenario.isSuccess) {
            onLog(`[AI-COUNTER-ATTACK SUCCESS] Retaliação via ${attackVector} (${payloadIntensity}) concluída contra ${targetIp}:${targetPort}! Hostil desativado.`);
          } else {
            onLog(`[AI-COUNTER-ATTACK FAILED] Retaliação via ${attackVector} (${payloadIntensity}) contra ${targetIp}:${targetPort} foi contida pelas defesas do alvo.`);
          }
        }
      }
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logStream]);

  const activeStepObj = scenario.steps[Math.min(currentStep, scenario.steps.length - 1)];
  const progressPercent = activeStepObj.progress;
  const metrics = scenario.getMetrics ? scenario.getMetrics(currentStep) : {};

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 font-mono">
      <div className="bg-black border-2 border-[hsl(var(--danger))] max-w-4xl w-full h-[85vh] flex flex-col shadow-[0_0_80px_rgba(255,0,0,0.5)] relative overflow-hidden crt-flicker">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,0,0,0.03)_50%,transparent_50%)] bg-[size:100%_4px] pointer-events-none z-10"></div>

        {/* CABEÇALHO DO AGENTE LLM */}
        <div className="bg-[hsl(var(--danger)/0.15)] border-b border-[hsl(var(--danger)/0.5)] p-4 flex flex-wrap justify-between items-center z-20">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse">{scenario.icon}</span>
            <div>
              <h2 className="text-[hsl(var(--danger))] text-sm md:text-base font-bold uppercase tracking-widest flex items-center gap-2">
                // LLM CYBER RETALIATION ENGINE: {scenario.title}
              </h2>
              <p className="text-xs text-white/70">
                MODEL: <span className="text-[hsl(var(--primary))] font-bold">{scenario.llmModel}</span> | TARGET: <span className="text-red-400 font-bold">{targetIp}:{targetPort}</span> | INTENSITY: <span className="text-amber-400 font-bold">{payloadIntensity}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${
              isCompleted 
                ? (isSuccess ? 'bg-green-500 animate-ping' : 'bg-red-500 animate-ping') 
                : 'bg-amber-500 animate-pulse'
            }`}></span>
            <span className="text-xs font-bold text-white/90 uppercase">
              {isCompleted 
                ? (isSuccess ? 'ATAQUE CONCLUÍDO' : 'RETALIAÇÃO BLOQUEADA') 
                : 'EXPLOIT EM ANDAMENTO...'}
            </span>
          </div>
        </div>

        {/* METRICAS TÁTICAS ESPECÍFICAS EM TEMPO REAL */}
        <div className="bg-black/80 border-b border-[hsl(var(--danger)/0.3)] p-3 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs z-20">
          {attackVector === 'DDoS SYN Flood' && (
            <>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">LARGURA BANDA:</span>
                <span className="text-red-400 font-bold text-sm">{metrics.gbps} Gbps</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">PACOTES / SEC:</span>
                <span className="text-red-400 font-bold text-sm">{metrics.pps} pps</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">LATÊNCIA DO ALVO:</span>
                <span className="text-amber-400 font-bold text-sm">{metrics.latency}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">SOCKET STATUS:</span>
                <span className="text-red-500 font-bold text-xs">{metrics.status}</span>
              </div>
            </>
          )}

          {attackVector === 'Reverse Shell Exploit' && (
            <>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">PROMPT REMOTO:</span>
                <span className="text-green-400 font-bold text-xs">{metrics.shellPrompt}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">NÍVEL DE ACESSO:</span>
                <span className="text-red-400 font-bold text-xs">{metrics.uid}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">TAMANHO STAGER:</span>
                <span className="text-amber-400 font-bold text-xs">{metrics.stagerSize}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">SESSÃO DE SHELL:</span>
                <span className="text-cyan-400 font-bold text-xs">{metrics.sessionStatus}</span>
              </div>
            </>
          )}

          {attackVector === 'BGP Route Poisoning' && (
            <>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">ROTA ATUAL BGP:</span>
                <span className="text-cyan-400 font-bold text-[10px]">{metrics.asPath}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">TRÁFEGO DESVIADO:</span>
                <span className="text-red-400 font-bold text-sm">{metrics.divertedTraffic}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">ESTADO BGP PEER:</span>
                <span className="text-amber-400 font-bold text-xs">{metrics.bgpState}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">PREFIXOS HIJACKED:</span>
                <span className="text-green-400 font-bold text-xs">{metrics.prefixesHijacked}</span>
              </div>
            </>
          )}

          {attackVector === 'Buffer Overflow Payload' && (
            <>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">REGISTRADOR RIP:</span>
                <span className="text-red-400 font-bold text-[10px]">{metrics.ripRegister}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">REGISTRADOR RSP:</span>
                <span className="text-amber-400 font-bold text-[10px]">{metrics.rspRegister}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">TAMANHO NOP SLED:</span>
                <span className="text-cyan-400 font-bold text-xs">{metrics.nopSled}</span>
              </div>
              <div className="border border-red-500/30 p-2 bg-red-950/20">
                <span className="text-white/50 block text-[10px]">BYPASS DEP / ROP:</span>
                <span className="text-green-400 font-bold text-xs">{metrics.depBypass}</span>
              </div>
            </>
          )}
        </div>

        {/* TERMINAL DE EXECUÇÃO STREAMING DA LLM */}
        <div className="flex-1 bg-black p-4 overflow-y-auto space-y-2 text-xs font-mono z-20">
          {logStream.map((line, idx) => {
            const isThought = line.startsWith('[LLM-THOUGHT]');
            const isInit = line.startsWith('[SYSTEM-INIT]');
            const isVictory = line.includes('[VICTORY]') || line.includes('[ISOLATED]') || line.includes('[COMMAND]') || line.includes('[MEMORY-CLEAN]');
            const isCommandOutput = line.includes('[COMMAND]');

            return (
              <React.Fragment key={idx}>
                <div 
                  className={`leading-relaxed ${
                    isInit
                      ? 'text-cyan-400 font-bold border-b border-cyan-900/40 pb-1'
                      : isThought 
                        ? 'text-purple-400 bg-purple-950/20 p-1.5 border-l-2 border-purple-500 italic my-1' 
                        : isVictory 
                          ? 'text-green-400 font-bold bg-green-950/30 p-2 border border-green-500/50 my-2'
                          : 'text-white/80'
                  }`}
                >
                  {line}
                </div>

                {isCommandOutput && showHashBox && (
                  <div className="my-3 p-3 bg-cyan-950/60 border border-cyan-400 text-cyan-300 font-mono text-xs shadow-[0_0_20px_rgba(0,240,255,0.4)]">
                    <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold mb-1">
                      // RESPOSTA DO SISTEMA ALVO (CHAVE DE VALIDAÇÃO OVERDRIVE)
                    </div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Hash Resposta:</span>
                      <span className="bg-black text-cyan-400 px-3 py-1 border border-cyan-400 font-mono text-base tracking-wider select-all">
                        {FIXED_RESPONSE_HASH}
                      </span>
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <div ref={logEndRef} />
        </div>

        {/* BARRA DE PROGRESSO & BOTAO FECHAR */}
        <div className="bg-black border-t border-[hsl(var(--danger)/0.4)] p-4 space-y-3 z-20">
          <div className="flex justify-between items-center text-xs">
            <span className="text-[hsl(var(--danger))] font-bold uppercase tracking-widest">
              PROGRESSO DO EXPLOIT AUTÔNOMO: {progressPercent}%
            </span>
            <span className="text-white/50">ETAPA {Math.min(currentStep + 1, scenario.steps.length)} DE {scenario.steps.length}</span>
          </div>

          <div className="w-full h-3 bg-white/10 border border-[hsl(var(--danger)/0.4)] p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-red-600 via-amber-500 to-green-500 transition-all duration-700 shadow-[0_0_15px_rgba(255,0,0,0.8)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {isCompleted && (
            <div className="flex justify-between items-center pt-2">
              {isSuccess ? (
                <span className="text-green-400 text-xs font-bold animate-pulse flex items-center gap-2">
                  <span>🛡️</span> RETALIAÇÃO FINALIZADA. ALVO HOSTIL IMPACTADO!...
                </span>
              ) : (
                <span className="text-red-400 text-xs font-bold animate-pulse flex items-center gap-2">
                  <span>🛑</span> RETALIAÇÃO FRUSTRADA! O ALVO BLOQUEOU A RETALIAÇÃO. TENTE OUTRO VETOR OU PARÂMETROS.
                </span>
              )}
              <button
                onClick={onClose}
                className={`px-6 py-2 border font-bold text-xs uppercase transition-colors cursor-pointer tracking-wider ${
                  isSuccess 
                    ? 'bg-green-950 border-green-500 text-green-400 hover:bg-green-500 hover:text-black shadow-[0_0_15px_rgba(0,255,0,0.4)]'
                    : 'bg-red-950 border-red-500 text-red-400 hover:bg-red-500 hover:text-black shadow-[0_0_15px_rgba(255,0,0,0.4)]'
                }`}
              >
                Concluir Operação & Fechar Console
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
