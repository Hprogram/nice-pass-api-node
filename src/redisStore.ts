import { createClient } from 'redis';
import { TokenSessionData } from './types';

const NICE_SESSION_PREFIX = 'nice:session:';

export async function saveSession(redisClient: ReturnType<typeof createClient>, req_no: string, data: TokenSessionData) {
  const key = NICE_SESSION_PREFIX + req_no;
  await redisClient.set(key, JSON.stringify(data), { EX: 300 }); // TTL: 5분
}

export async function getSession(redisClient: ReturnType<typeof createClient>, req_no: string): Promise<TokenSessionData | null> {
  const key = NICE_SESSION_PREFIX + req_no;
  const raw = await redisClient.get(key);
  return raw ? JSON.parse(raw) : null;
}