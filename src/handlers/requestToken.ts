import axios from 'axios';
import { encrypt, createHmacHash, createSha256Base64 } from '../cryptoHelper';
import { saveSession } from '../redisStore';
import { TokenRequestResult } from '../types';
import { getNiceConfig } from '../config';

export async function requestToken(redisClient: any, receivedata: string): Promise<TokenRequestResult> {
  const { CLIENT_ID, API_URL, PRODUCT_ID, RETURN_URL, ACCESS_TOKEN } = getNiceConfig();

  const req_dtim = new Date().toISOString().substring(0, 19).replace(/[\D]/g, '');
  const req_no = 'REQ' + req_dtim + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  const timestamp = Math.floor(Date.now() / 1000);
  const base64_Auth = Buffer.from(`${ACCESS_TOKEN}:${timestamp}:${CLIENT_ID}`).toString('base64');

  const tokenRes = await axios.post(`${API_URL}`, {
    dataHeader: { CNTY_CD: 'ko' },
    dataBody: {
      req_dtim,
      req_no,
      enc_mode: '1',
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${base64_Auth}`,
      productID: PRODUCT_ID
    }
  });

  if (!tokenRes.data?.dataBody) {
    throw new Error('NICE API 응답 데이터가 올바르지 않습니다.');
  }

  const { token_version_id, token_val, site_code } = tokenRes.data.dataBody;

  if (!token_version_id || !token_val || !site_code) {
    throw new Error('필수 토큰 데이터가 누락되었습니다.');
  }

  const result = req_dtim + req_no + token_val;
  const resultVal = createSha256Base64(result);
  const key = resultVal.substring(0, 16);
  const iv = resultVal.substring(resultVal.length - 16);
  const hmac_key = resultVal.substring(0, 32);

  const plain_data = JSON.stringify({
    requestno: req_no,
    returnurl: RETURN_URL,
    sitecode: site_code,
    receivedata
  });

  const enc_data = encrypt(plain_data, key, iv);
  const integrity = createHmacHash(enc_data, hmac_key);

  await saveSession(redisClient, req_no, { token_version_id, key, iv, hmac_key });

  return {
    req_no,
    req_dtim,
    token_version_id,
    enc_data,
    integrity,
    token_val,
    resultVal,
    key,
    iv,
    hmac_key,
    plain: plain_data
  };
}