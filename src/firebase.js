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
// Vercel에서는 빌드 시점에 환경 변수가 자동으로 주입됩니다
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error('❌ Firebase 환경 변수가 설정되지 않았습니다!');
  console.error('현재 환경:', process.env.NODE_ENV);
  console.error('설정된 값:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : '없음',
    authDomain: firebaseConfig.authDomain || '없음',
    projectId: firebaseConfig.projectId || '없음'
  });
  console.error('Vercel 환경 변수 설정 확인:');
  console.error('1. Vercel 대시보드 > Settings > Environment Variables');
  console.error('2. 다음 변수들이 모두 설정되어 있는지 확인:');
  console.error('   - REACT_APP_API_KEY');
  console.error('   - REACT_APP_AUTH_DOMAIN');
  console.error('   - REACT_APP_PROJECT_ID');
  console.error('   - REACT_APP_STORAGE_BUCKET');
  console.error('   - REACT_APP_MESSAGING_SENDER_ID');
  console.error('   - REACT_APP_APP_ID');
  console.error('   - REACT_APP_MEASUREMENT_ID');
  console.error('3. 각 변수에 Production, Preview, Development 모두 체크');
  console.error('4. 환경 변수 추가 후 반드시 Redeploy 필요!');
} else {
  console.log('✅ Firebase 환경 변수가 정상적으로 설정되었습니다.');
}

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // 다른 파일에서 쓸 수 있게 내보내기
export const storage = getStorage(app);
export const auth = getAuth(app); // 인증 기능 내보내기