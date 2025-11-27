import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 아까 복사한 설정 코드를 여기에 덮어쓰세요!
// (apiKey, authDomain, projectId 등이 포함된 객체입니다)
const firebaseConfig = {
  apiKey: "AIzaSyCJy_KNwAia5wXeWfIDYuig7xkbK7x9JWE", 
  authDomain: "my-mini-sns2.firebaseapp.com",
  projectId: "my-mini-sns2",
  storageBucket: "my-mini-sns2.firebasestorage.app",
  messagingSenderId: "19426165188",
  appId: "1:19426165188:web:b15ad9f2bc1dec83ffa491",
  measurementId: "G-31ZCKNXMLJ"
};

// 파이어베이스 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app); // 다른 파일에서 쓸 수 있게 내보내기