import express from 'express';
import bodyParser from 'body-parser';
import { requestToken } from '../src/handlers/requestToken';
import { createClient } from 'redis';
import { setNiceConfig } from '../src/config';
import path from 'path';
import { verifyCallback } from '../src/handlers/verifyCallback';
import debug from 'debug';

// 디버그 네임스페이스 설정
const debugServer = debug('nice-auth:server');
const debugRedis = debug('nice-auth:redis');
const debugAuth = debug('nice-auth:auth');

const app = express();
const port = 8888;

// Redis 클라이언트 설정
const redisClient = createClient({
  url: '',
});

redisClient.on('error', (err) => debugRedis('Redis Client Error: %O', err));
redisClient.connect();

// NICE API 설정
setNiceConfig({
  CLIENT_ID: '',
  SECRET_KEY: '',
  API_URL: '',
  PRODUCT_ID: '',
  RETURN_URL: '',
  ACCESS_TOKEN: ''
});

app.use(bodyParser.urlencoded({ extended: true }));

// ejs 템플릿 사용시 주석 해제
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// 메인 요청 확인용
app.get("/", (req, res) => {
  res.send("success logic");
});

// 본인인증 시작 페이지
app.get("/checkplus_main", async (req, res) => {
  const callback = req.query.callback as string | undefined;
    
    
  // callback이 undefined이거나 빈 문자열인 경우
  if (!callback || callback.trim() === '') {
    debugAuth('Invalid callback URL provided');
    return res.status(400).render('error', {
      message: '콜백 URL이 지정되지 않았습니다.'
    });
  }

  try {
    const tokenData = await requestToken(redisClient, callback);

    
    if (!tokenData.token_version_id || !tokenData.token_val) {
      debugAuth('Missing token data fields');
      throw new Error('토큰 데이터가 누락되었습니다.');
    }
    
    // 폼 렌더링 대신 직접 리다이렉트
    const redirectUrl = new URL('https://nice.checkplus.co.kr/CheckPlusSafeModel/service.cb');
    redirectUrl.searchParams.append('m', 'service');
    redirectUrl.searchParams.append('token_version_id', tokenData.token_version_id);
    redirectUrl.searchParams.append('enc_data', tokenData.enc_data);
    redirectUrl.searchParams.append('integrity_value', tokenData.integrity);
    
    res.redirect(redirectUrl.toString());
  } catch (error) {
    debugAuth('Error in authentication process: %O', error);
    res.status(500).render('error', { 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    });
  }
});

// 본인인증 성공 콜백
app.all("/checkplus_success", async (req, res) => {
  try {
    const { token_version_id, enc_data, integrity_value } = req.method === 'GET' ? req.query : req.body;
    

    
    if (!token_version_id || !enc_data || !integrity_value) {
      debugAuth('Missing required parameters');
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    const decryptedData = await verifyCallback(redisClient, {
      token_version_id,
      enc_data,
      integrity_value,
    });

    const redirectUrl = `${decryptedData.receivedata}?name=${decryptedData.name}&birthdate=${encodeURIComponent(decryptedData.birthdate)}&gender=${encodeURIComponent(decryptedData.gender)}&mobileco=${encodeURIComponent(decryptedData.mobileco)}&mobileno=${encodeURIComponent(decryptedData.mobileno)}&di=${encodeURIComponent(decryptedData.di)}&ci=${encodeURIComponent(decryptedData.ci)}`;

    res.redirect(redirectUrl);
  } catch (error) {
    debugAuth('Error in callback processing: %O', error);
    res.status(500).render('error', { 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    });
  }
});

app.listen(port, () => {
  debugServer('Server is running on http://localhost:%d', port);
}); 