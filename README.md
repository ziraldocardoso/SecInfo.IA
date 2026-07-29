# SecInfo.IA - Documentação de Fundamentos

> **Aviso ao meu eu do futuro (Antigravity):** Ao ler este documento para criar novos incrementos de código, **NUNCA** comprometa os princípios listados abaixo. Este projeto roda em um servidor de produção com apenas **1 GB de RAM**. Cada nova linha de código, nova dependência ou componente arquitetural deve ser estritamente avaliado para manter o sistema extremamente leve, veloz e otimizado.

---

## 🏗️ Arquitetura e Tecnologias Base

O projeto foi inicializado utilizando uma stack rigorosamente selecionada para entregar alta performance sem overhead:

- **Runtime:** `Bun` (Substitui o Node.js/npm). Muito mais rápido para instalação de pacotes e execução de scripts, além de consumir menos recursos na gerência de pacotes (`bun install`).
- **Framework Frontend:** `React 19` + `Vite`. O Vite fornece um tempo de inicialização (HMR) instantâneo e um processo de build altamente otimizado (Rollup) que gera bundles minificados e eficientes.
- **Estilização:** `Tailwind CSS v4` através do plugin `@tailwindcss/vite`.
  - *Por que o Tailwind v4?* Ele não necessita de `postcss` ou arquivos complexos de configuração. É injetado diretamente no CSS, possui uma engine nativa extremamente veloz e gera zero CSS não utilizado em produção.
  - A interface possui suporte nativo a dark-mode e utiliza princípios de *glassmorphism* e gradientes suaves para parecer visualmente **premium**, mas sem o peso de bibliotecas de UI pesadas (como Material UI ou Ant Design).

## ⚡ Princípios Fundamentais de Engenharia (Regras de Ouro)

1. **Restrição de Memória (1GB RAM):**
   - O servidor tem capacidade limitada. Evite o uso de bibliotecas pesadas de terceiros (como lodash inteiro, moment.js, ou bibliotecas de animação que incham o bundle como framer-motion, caso não seja estritamente necessário). Prefira utilitários nativos (ES6+) e animações via CSS/Tailwind (`@apply animate-*`).
   
2. **Lean Dependencies:**
   - Antes de adicionar qualquer pacote no `package.json`, questione se é possível implementar a lógica nativamente com JavaScript puro ou hooks customizados do React.
   
3. **Design e Acessibilidade (Cyberpunk Cloud Console):**
   - O design funde o layout de um "Console de Gerenciamento de Nuvem" com estética distópica/cyberpunk. Fundo preto puro (`#000000`), toques de neon Ciano (`#00f0ff`), Verde Ácido (`#39ff14`) e Magenta (`#ff007f`).
   - Fontes: `Roboto Condensed` para navegação e `JetBrains Mono` para terminais e painéis de dados.
   - Micro-interações, efeitos CRT (flicker e scanlines) e glow em bordas ativas são essenciais.
   - Use os tokens de CSS criados no `index.css` (background, foreground, primary, success, danger).

4. **Componentização Direta e Limpa:**
   - Mantenha a estrutura de pastas coesa (ex: separar componentes reutilizáveis na pasta `src/components`, lógicas complexas em `src/hooks`).
   - Evite renders desnecessários no React (faça uso inteligente do estado e memoização apenas quando o custo de processamento for alto).

## 📦 Estrutura de Arquivos Otimizada

- **`vite.config.js`:** Mantido simples, apenas integrando os plugins do React e Tailwind CSS v4. Sem configurações mirabolantes que arrastem o build.
- **`src/index.css`:** Importa o Tailwind e define as variáveis de tema globais (cores HSL compatíveis com o padrão shadcn/ui minimalista).
- **`src/App.jsx`:** Arquivo raiz que serve como prova de conceito visual. Utiliza apenas classes do Tailwind para formar o layout responsivo, dispensando a necessidade de CSS extra (como um antigo `App.css`, que foi deletado).

---

Ao iniciar um novo incremento: **Leia, compreenda o limite de hardware e escreva o código mais direto e minimalista possível.**
