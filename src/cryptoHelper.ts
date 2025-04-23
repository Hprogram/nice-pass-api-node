import crypto from 'crypto';

export function encrypt(data: string, key: string, iv: string): string {
  const cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return encrypted;
}

export function decrypt(data: string, key: string, iv: string): string {
  const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
  let decrypted = decipher.update(data, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

export function createHmacHash(data: string, key: string): string {
  return crypto.createHmac('sha256', key).update(data).digest('base64');
}

export function createSha256Base64(data: string): string {
  return crypto.createHash('sha256').update(data).digest('base64');
}