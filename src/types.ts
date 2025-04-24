export interface TokenRequestResult {
    reqNo: string;
    reqDtim: string;
    tokenVersionId: string;
    encData: string;
    integrity: string;
    tokenVal: string;
    resultVal: string;
    key: string;
    iv: string;
    hmacKey: string;
    plain: string;
  }
  
  export interface TokenSessionData {
    tokenVersionId: string;
    key: string;
    iv: string;
    hmacKey: string;
  }
  
  export interface VerifyInput {
    tokenVersionId: string;
    encData: string;
    integrity: string;
    reqNo?: string;
  }