import { createClient, RedisClientType } from 'redis';
import { config } from '../config/config';
import { logger } from '../utils/logger';

let redisClient: RedisClientType;

export async function connectRedis(): Promise<void> {
  try {
    redisClient = createClient({
      url: config.redisUrl,
    });

    redisClient.on('error', (err) => {
      logger.warn('Redis Client Error (continuing without Redis):', err);
    });

    redisClient.on('connect', () => {
      logger.info('Redis client connected');
    });

    redisClient.on('ready', () => {
      logger.info('Redis client ready');
    });

    redisClient.on('end', () => {
      logger.info('Redis client disconnected');
    });

    await redisClient.connect();
  } catch (error) {
    logger.warn('Failed to connect to Redis (continuing without Redis):', error);
    // Don't throw error, continue without Redis
  }
}

export function getRedisClient(): RedisClientType {
  if (!redisClient) {
    logger.warn('Redis client not available, some features may be limited');
    return null as any;
  }
  return redisClient;
}

export async function disconnectRedis(): Promise<void> {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Successfully disconnected from Redis');
    }
  } catch (error) {
    logger.error('Failed to disconnect from Redis:', error);
    throw error;
  }
}

// Cache utilities
export class CacheService {
  private client: RedisClientType;

  constructor() {
    this.client = getRedisClient();
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setEx(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Cache delete error:', error);
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      logger.error('Cache exists error:', error);
      return false;
    }
  }

  async flushAll(): Promise<void> {
    try {
      await this.client.flushAll();
    } catch (error) {
      logger.error('Cache flush error:', error);
    }
  }

  // Session management
  async setSession(sessionId: string, data: any, ttlSeconds: number = 86400): Promise<void> {
    const key = `session:${sessionId}`;
    await this.set(key, JSON.stringify(data), ttlSeconds);
  }

  async getSession(sessionId: string): Promise<any | null> {
    const key = `session:${sessionId}`;
    const data = await this.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = `session:${sessionId}`;
    await this.del(key);
  }

  // Rate limiting
  async incrementRateLimit(key: string, windowSeconds: number): Promise<number> {
    try {
      const multi = this.client.multi();
      multi.incr(key);
      multi.expire(key, windowSeconds);
      const results = await multi.exec();
      return results ? (results[0] as number) : 0;
    } catch (error) {
      logger.error('Rate limit increment error:', error);
      return 0;
    }
  }
}

export const cacheService = new CacheService();

// Graceful shutdown
process.on('beforeExit', async () => {
  await disconnectRedis();
});

process.on('SIGINT', async () => {
  await disconnectRedis();
});

process.on('SIGTERM', async () => {
  await disconnectRedis();
});