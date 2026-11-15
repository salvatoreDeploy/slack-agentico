// Processo do serviço e2e: encaminha as portas da máquina para os serviços do Compose, para o
// navegador do teste usar os mesmos endereços que o da máquina e o cookie de sessão, só de host
// em localhost, valer também na API do chat (AGENTS.md da raiz, "Testes de ponta a ponta").
import net from 'node:net';

const FORWARDS = [
  { port: 3000, host: 'web', targetPort: 3000 },
  { port: 3001, host: 'chat-api', targetPort: 3000 },
];

// `localhost` pode resolver para o IPv4 ou para o IPv6, então cada porta escuta nos dois.
const LOOPBACK_ADDRESSES = ['127.0.0.1', '::1'];

for (const { port, host, targetPort } of FORWARDS) {
  for (const address of LOOPBACK_ADDRESSES) {
    net
      .createServer((client) => {
        const upstream = net.connect(targetPort, host);
        client.pipe(upstream).pipe(client);
        client.on('error', () => upstream.destroy());
        upstream.on('error', () => client.destroy());
      })
      .on('error', (error) => {
        console.error(`Falha ao encaminhar ${address}:${port} -> ${host}:${targetPort}: ${error.message}`);
        process.exit(1);
      })
      .listen(port, address, () => {
        console.log(`${address}:${port} -> ${host}:${targetPort}`);
      });
  }
}
