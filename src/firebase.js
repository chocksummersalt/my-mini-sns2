import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ▼▼▼ 1. 스토리지 도구 추가 ▼▼▼
import { getStorage } from "firebase/storage";
// ▼▼▼ 2. 인증 도구 추가 ▼▼▼
import { getAuth } from "firebase/auth";

// Firebase 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// 환경 변수 확인 및 에러 처리
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase 환경 변수가 설정되지 않았습니다!');
  console.error('설정된 값:', {
    apiKey: firebaseConfig.apiKey ? '있음' : '없음',
    authDomain: firebaseConfig.authDomain ? '있음' : '없음',
    projectId: firebaseConfig.projectId ? '있음' : '없음'
  });
  console.error('Vercel 환경 변수 설정 확인:');
  console.error('- REACT_APP_API_KEY');
  console.error('- REACT_APP_AUTH_DOMAIN');
  console.error('- REACT_APP_PROJECT_ID');
  console.error('- REACT_APP_STORAGE_BUCKET');
  console.error('- REACT_APP_MESSAGING_SENDER_ID');
  console.error('- REACT_APP_APP_ID');
  console.error('- REACT_APP_MEASUREMENT_ID');
}

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // 다른 파일에서 쓸 수 있게 내보내기
export const storage = getStorage(app);
export const auth = getAuth(app); // 인증 기능 내보내기