import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// ▼▼▼ 1. 스토리지 도구 추가 ▼▼▼
import { getStorage } from "firebase/storage";

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

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // 다른 파일에서 쓸 수 있게 내보내기
export const storage = getStorage(app);