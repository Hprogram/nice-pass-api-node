// src/config.ts
import axios from 'axios';

export interface NiceConfig {
    CLIENT_ID: string;
    SECRET_KEY: string;
    API_URL: string;
    PRODUCT_ID: string;
    RETURN_URL: string;
    ACCESS_TOKEN: string;
}
  
let config: NiceConfig;
  
export function setNiceConfig(userConfig: NiceConfig) {
    config = userConfig;
}
  
export function getNiceConfig(): NiceConfig {
    if (!config) throw new Error('Nice API config has not been set.');
    return config;
}


export async function getNiceAccessToken(clientId: string, secretKey: string): Promise<string> {
    const { API_URL } = getNiceConfig();
    const base64_Auth = Buffer.from(`${clientId}:${secretKey}`).toString('base64');
  
    const result = await axios.post(`${API_URL}/digital/niceid/oauth/oauth/token`, {
      grant_type: 'client_credentials',
      scope: 'default',
    }, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${base64_Auth}`
      }
    });
  
    return result.data.dataBody.access_token;
  }