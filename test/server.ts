import express from 'express';
import bodyParser from 'body-parser';
import { requestToken } from '../src/handlers/requestToken';
import { createClient } from 'redis';
import { setNiceConfig } from '../src/config';
import path from 'path';
import { verifyCallback } from '../src/handlers/verifyCallback';

const app = express();
const port = 8888;

// Redis 클라이언트 설정
const redisClient = createClient({
  url: ''
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.connect();

// NICE API 설정
setNiceConfig({
  CLIENT_ID: '',
  SECRET_KEY: '',
  API_URL: '',
  PRODUCT_ID: '',
  RETURN_URL: '',
  ACCESS_TOKEN: '',
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get("/", (req, res) => {
  res.send("success logic");
});

// 본인인증 시작 페이지
app.get("/checkplus_main", async (req, res) => {

  const callback = req.query.callback as string;
  if (!callback) {
    throw new Error('callback 파라미터가 누락되었습니다.');
  }

  try {
    const tokenData = await requestToken(redisClient, callback);
    console.log('Token Data:', tokenData);
    
    if (!tokenData.token_version_id || !tokenData.token_val) {
      throw new Error('토큰 데이터가 누락되었습니다.');
    }
    
    res.render('checkplus_main', tokenData);
  } catch (error) {
    console.error('Error in checkplus_main:', error);
    res.status(500).render('error', { 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    });
  }
});

// 본인인증 성공 콜백
app.all("/checkplus_success", async (req, res) => {
  try {
    const { token_version_id, enc_data, integrity_value } = req.method === 'GET' ? req.query : req.body;
    
    console.log("req.body: ", req.body);
    console.log("req.query: ", req.query);
    
    if (!token_version_id || !enc_data || !integrity_value) {
      throw new Error('필수 파라미터가 누락되었습니다.');
    }

    const decryptedData = await verifyCallback(redisClient, {
      token_version_id,
      enc_data,
      integrity_value,
    });

    console.log("리스폰 데이터:", decryptedData);

    const redirectUrl = `${decryptedData.receivedata}?name=${encodeURIComponent(decryptedData.name.toString())}&birthdate=${encodeURIComponent(decryptedData.birthdate.toString())}&gender=${encodeURIComponent(decryptedData.gender.toString())}&mobileco=${encodeURIComponent(decryptedData.mobileco.toString())}&mobileno=${encodeURIComponent(decryptedData.mobileno.toString())}&di=${encodeURIComponent(decryptedData.di.toString())}&ci=${encodeURIComponent(decryptedData.ci.toString())}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error in checkplus_success:', error);
    res.status(500).render('error', { 
      message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
    });
  }
});

app.listen(port, () => {
  console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
}); 