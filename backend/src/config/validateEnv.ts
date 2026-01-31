import { cleanEnv, str, port } from 'envalid';
import crypto from 'crypto';

export const validateEnv = () => {
  // Generate a JWT secret if not provided (for deployment convenience)
  if (!process.env.JWT_SECRET) {
    const generatedSecret = crypto.randomBytes(64).toString('hex');
    process.env.JWT_SECRET = generatedSecret;
    console.log('⚠️  JWT_SECRET not found, generated a random one for this session');
    console.log('⚠️  For production, please set a permanent JWT_SECRET environment variable');
  }

  cleanEnv(process.env, {
    NODE_ENV: str({ choices: ['development', 'test', 'production', 'provision'] }),
    PORT: port({ default: 5000 }),
    DATABASE_URL: str(),
    JWT_SECRET: str(),
    JWT_EXPIRES_IN: str({ default: '1d' }),
    FRONTEND_URL: str({ default: 'http://localhost:3000' }),
  });
};
