const PORT = process.env.WS_PORT || 3001;

const server = Bun.serve({
  port: PORT,
  fetch(req, server) {
    // Ao usar Nginx, o IP real vem nos headers. Caso contrário, usa o IP da conexão direta.
    const ip = req.headers.get("x-real-ip") || req.headers.get("x-forwarded-for") || server.requestIP(req)?.address || "127.0.0.1";
    // Tenta atualizar a requisição HTTP para WebSocket
    if (server.upgrade(req, { data: { ip } })) {
      return; // upgrade bem-sucedido, não retorna uma resposta HTTP
    }
    // Caso não seja requisição de WebSocket, retorna status 200 genérico
    return new Response("WebSocket server is running. Connect using ws:// or wss://", { status: 200 });
  },
  websocket: {
    open(ws) {
      // Quando um novo cliente conecta
      ws.subscribe("secinfo-clients");
      
      // Conta o número de inscritos (clientes ativos)
      const count = server.subscriberCount("secinfo-clients");
      
      // Manda o IP para o cliente que acabou de se conectar junto com o count
      ws.send(JSON.stringify({ count, ip: ws.data.ip }));
      
      // Publica apenas o count para os outros clientes
      server.publish("secinfo-clients", JSON.stringify({ count }));
    },
    close(ws) {
      // Quando o cliente desconecta
      ws.unsubscribe("secinfo-clients");
      
      const count = server.subscriberCount("secinfo-clients");
      server.publish("secinfo-clients", JSON.stringify({ count }));
    },
    message(ws, message) {
      // Não precisamos tratar mensagens recebidas do cliente neste caso específico
    },
  },
});

console.log(`[SYS] WebSocket server running on port ${server.port}`);
