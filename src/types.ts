export interface TokenRequestResult {
    req_no: string;
    req_dtim: string;
    token_version_id: string;
    enc_data: string;
    integrity: string;
    token_val: string;
    resultVal: string;
    key: string;
    iv: string;
    hmac_key: string;
    plain: string;
  }
  
  export interface TokenSessionData {
    token_version_id: string;
    key: string;
    iv: string;
    hmac_key: string;
  }
  
  export interface VerifyInput {
    token_version_id: string;
    enc_data: string;
    integrity_value: string;
    req_no: string;
  }