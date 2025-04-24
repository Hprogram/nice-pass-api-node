import axios from 'axios';
import { encrypt, createHmacHash, createSha256Base64 } from '../crypto-helper';
import { saveSession } from '../redis-store';
import { TokenRequestResult } from '../types';
import { getNiceConfig } from '../config';
import debug from 'debug';

const log = debug('nice-pass-api:request-token');

/**
 * NICE API로부터 토큰을 요청하고 세션을 생성합니다.
 * @param redisClient - Redis 클라이언트 인스턴스
 * @param receiveData - 수신 데이터
 * @returns 토큰 요청 결과
 * @throws {Error} API 요청 실패 시 에러 발생
 */
export async function requestToken(redisClient: any, receiveData: string): Promise<TokenRequestResult> {
  const { CLIENT_ID, API_URL, PRODUCT_ID, RETURN_URL, ACCESS_TOKEN } = getNiceConfig();

  const reqDtim = new Date().toISOString().substring(0, 19).replace(/[\D]/g, '');
  const reqNo = 'REQ' + reqDtim + String(Math.floor(Math.random() * 9999)).padStart(4, '0');
  const timestamp = Math.floor(Date.now() / 1000);
  const base64Auth = Buffer.from(`${ACCESS_TOKEN}:${timestamp}:${CLIENT_ID}`).toString('base64');

  const tokenRes = await axios.post(`${API_URL}`, {
    dataHeader: { CNTY_CD: 'ko' },
    dataBody: {
      req_dtim: reqDtim,
      req_no: reqNo,
      enc_mode: '1',
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `bearer ${base64Auth}`,
      productID: PRODUCT_ID
    }
  });

  if (!tokenRes.data?.dataBody) {
    throw new Error('NICE API 응답 데이터가 올바르지 않습니다.');
  }

  // API 응답 데이터를 camelCase로 매핑
  const { token_version_id: tokenVersionId, token_val: tokenVal, site_code: siteCode } = tokenRes.data.dataBody;

  if (!tokenVersionId || !tokenVal || !siteCode) {
    throw new Error('필수 토큰 데이터가 누락되었습니다.');
  }

  const result = reqDtim + reqNo + tokenVal;
  const resultVal = createSha256Base64(result);
  const key = resultVal.substring(0, 16);
  const iv = resultVal.substring(resultVal.length - 16);
  const hmacKey = resultVal.substring(0, 32);

  const plainData = JSON.stringify({
    requestno: reqNo,
    returnurl: RETURN_URL,
    sitecode: siteCode,
    receivedata: receiveData
  });

  const encData = encrypt(plainData, key, iv);
  const integrity = createHmacHash(encData, hmacKey);

  await saveSession(redisClient, reqNo, { tokenVersionId, key, iv, hmacKey });

  log('토큰 요청 성공:', { reqNo, tokenVersionId });

  return {
    reqNo,
    reqDtim,
    tokenVersionId,
    encData,
    integrity,
    tokenVal,
    resultVal,
    key,
    iv,
    hmacKey,
    plain: plainData
  };
}