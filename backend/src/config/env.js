const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const candidateEnvPaths = [
  path.join(__dirname, '..', '..', '.env'),
  path.join(__dirname, '..', '..', '..', '.env'),
  path.join(process.cwd(), '.env'),
  path.join(process.cwd(), '..', '.env')
];

const envPath = candidateEnvPaths.find((candidate) => fs.existsSync(candidate));

dotenv.config(envPath ? { path: envPath } : undefined);

const requiredVariables = [
  'DB_HOST',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_PORT',
  'JWT_SECRET',
  'BASE_URL'
];

const missingVariables = requiredVariables.filter((variable) => !process.env[variable]);

if (missingVariables.length > 0) {
  throw new Error(`Missing required environment variables: ${missingVariables.join(', ')}`);
}

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  dbConfig: {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT)
  },
  jwtSecret: process.env.JWT_SECRET,
  baseUrl: process.env.BASE_URL,
  uploadsDir: path.join(__dirname, '..', '..', 'uploads'),
  maxUploadBytes: 20 * 1024 * 1024,
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || process.env.BASE_URL
};
