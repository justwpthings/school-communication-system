const app = require('./src/app');
const { port, env } = require('./src/config/env');
const db = require('./src/config/database');

const startServer = async () => {
  try {
    await db.raw('SELECT 1');

    app.listen(port, () => {
      console.log(`Backend running on port ${port} in ${env} mode`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
