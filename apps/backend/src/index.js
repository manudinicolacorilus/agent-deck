import { startServer } from './server.js';

startServer().then(({ server }) => {
  const addr = server.address();
  console.log(`Copilot Agent Dashboard backend running on port ${addr.port}`);
});
