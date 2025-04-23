import { decrypt, createHmacHash } from '../cryptoHelper';
import { getSession } from '../redisStore';
import { VerifyInput } from '../types';

export async function verifyCallback(redisClient: any, input: VerifyInput) {
  const { token_version_id, enc_data, integrity_value } = input;
  const req_no = enc_data.substring(0, 20); // enc_data의 처음 20자리가 req_no

  const session = await getSession(redisClient, req_no);
  if (!session) throw new Error('세션 데이터가 존재하지 않습니다.');
  if (session.token_version_id !== token_version_id)
    throw new Error('토큰 버전 ID가 일치하지 않습니다.');

  const integrity = createHmacHash(enc_data, session.hmac_key);
  if (integrity !== integrity_value)
    throw new Error('무결성 검증 실패: 인코딩된 데이터가 조작되었을 수 있습니다.');

  const decrypted = decrypt(enc_data, session.key, session.iv);
  const dec_data = JSON.parse(decrypted);

  if (req_no !== dec_data.requestno)
    throw new Error('요청 번호가 일치하지 않습니다.');

  return {
    authtype: dec_data.authtype,
    nationalinfo: dec_data.nationalinfo,
    responseno: dec_data.responseno,
    resultcode: dec_data.resultcode,
    enctime: dec_data.enctime,
    requestno: dec_data.requestno,
    mobileco: dec_data.mobileco,
    mobileno: dec_data.mobileno,
    sitecode: dec_data.sitecode,
    di: dec_data.di,
    ci: dec_data.ci,
    receivedata: dec_data.receivedata,
    birthdate: dec_data.birthdate,
    gender: dec_data.gender,
    name: decodeURI(dec_data.utf8_name)
  };
}