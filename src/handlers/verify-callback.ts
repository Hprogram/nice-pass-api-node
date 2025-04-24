import { decrypt, createHmacHash } from '../crypto-helper';
import { getSession } from '../redis-store';
import { VerifyInput } from '../types';
import { getNiceConfig } from '../config';
import debug from 'debug';

const log = debug('nice-pass-api:verify-callback');

/**
 * 본인인증 콜백 데이터를 검증하고 복호화합니다.
 * @param redisClient - Redis 클라이언트 인스턴스
 * @param input - 검증할 입력 데이터
 * @returns 복호화된 사용자 정보
 * @throws {Error} 검증 실패 시 에러 발생
 */
export async function verifyCallback(redisClient: any, input: VerifyInput) {
  const { tokenVersionId, encData, integrity: integrityValue } = input;
  const reqNo = encData.substring(0, 20); // encData의 처음 20자리가 reqNo

  const session = await getSession(redisClient, reqNo);
  if (!session) throw new Error('세션 데이터가 존재하지 않습니다.');
  if (session.tokenVersionId !== tokenVersionId)
    throw new Error('토큰 버전 ID가 일치하지 않습니다.');

  const integrity = createHmacHash(encData, session.hmacKey);
  if (integrity !== integrityValue)
    throw new Error('무결성 검증 실패: 인코딩된 데이터가 조작되었을 수 있습니다.');

  const decrypted = decrypt(encData, session.key, session.iv);
  const decData = JSON.parse(decrypted);

  if (reqNo !== decData.request_no)
    throw new Error('요청 번호가 일치하지 않습니다.');

  log('복호화된 데이터:', decData);

  // 옵션: config가 필요한 경우 이곳에서 사용 가능
  const { CLIENT_ID, RETURN_URL, API_URL, PRODUCT_ID, ACCESS_TOKEN } = getNiceConfig();

  // snake_case를 camelCase로 매핑
  return {
    authType: decData.auth_type,
    nationalInfo: decData.national_info,
    responseNo: decData.response_no,
    resultCode: decData.result_code,
    encTime: decData.enc_time,
    requestNo: decData.request_no,
    mobileCo: decData.mobile_co,
    mobileNo: decData.mobile_no,
    siteCode: decData.site_code,
    di: decData.di,
    ci: decData.ci,
    receiveData: decData.receive_data,
    birthDate: decData.birth_date,
    gender: decData.gender,
    name: decodeURI(decData.utf8_name)
  };
}