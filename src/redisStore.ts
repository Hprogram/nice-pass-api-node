import { createClient } from 'redis';
import { TokenSessionData } from './types';

export async function saveSession(redisClient: ReturnType<typeof createClient>, req_no: string, data: TokenSessionData) {
  await redisClient.set(req_no, JSON.stringify(data), { EX: 300 }); // TTL: 5분
}

export async function getSession(redisClient: ReturnType<typeof createClient>, req_no: string): Promise<TokenSessionData | null> {
  const raw = await redisClient.get(req_no);
  return raw ? JSON.parse(raw) : null;
}