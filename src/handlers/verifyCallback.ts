import { decrypt, createHmacHash } from '../cryptoHelper';
import { getSession } from '../redisStore';
import { VerifyInput } from '../types';
import { getNiceConfig } from '../config';

export async function verifyCallback(redisClient: any, input: VerifyInput) {
  const { token_version_id, enc_data, integrity_value } = input;

  const session = await getSession(redisClient, token_version_id);
  if (!session) throw new Error('세션 데이터가 존재하지 않습니다.');
  
  const decrypted = decrypt(enc_data, session.key, session.iv);
  const data = JSON.parse(decrypted);

  if (data.utf8_name) {
    data.name = decodeURIComponent(data.utf8_name);
  }

  if (session.token_version_id !== token_version_id)
    throw new Error('토큰 버전 ID가 일치하지 않습니다.');

  const integrity = createHmacHash(enc_data, session.hmac_key);
  if (integrity !== integrity_value)
    throw new Error('무결성 검증 실패: 인코딩된 데이터가 조작되었을 수 있습니다.');

  // 옵션: config가 필요한 경우 이곳에서 사용 가능
  const { CLIENT_ID, RETURN_URL, API_URL, PRODUCT_ID, ACCESS_TOKEN } = getNiceConfig();

  return data;
}