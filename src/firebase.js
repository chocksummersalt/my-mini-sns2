import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 아까 복사한 설정 코드를 여기에 덮어쓰세요!
// (apiKey, authDomain, projectId 등이 포함된 객체입니다)
const firebaseConfig = {
  apiKey: "AIzaSyD...", 
  authDomain: "my-mini-sns.firebaseapp.com",
  projectId: "my-mini-sns",
  storageBucket: "my-mini-sns.appspot.com",
  messagingSenderId: "12345...",
  appId: "1:12345..."
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // 다른 파일에서 쓸 수 있게 내보내기