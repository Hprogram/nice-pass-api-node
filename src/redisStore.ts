import { createClient } from 'redis';
import { TokenSessionData } from './types';

const NICE_SESSION_PREFIX = 'nice:session:';
const SESSION_TTL = 300;

export async function saveSession(redisClient: ReturnType<typeof createClient>, token_version_id: string, data: TokenSessionData) {
  const key = NICE_SESSION_PREFIX + token_version_id;
  await redisClient.set(key, JSON.stringify(data), { EX: SESSION_TTL });
}

export async function getSession(redisClient: ReturnType<typeof createClient>, token_version_id: string): Promise<TokenSessionData | null> {
  const key = NICE_SESSION_PREFIX + token_version_id;
  const raw = await redisClient.get(key);
  return raw ? JSON.parse(raw) : null;
}