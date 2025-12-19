import React, { useState } from 'react';
// ▼ GoogleAuthProvider, signInWithPopup 추가됨
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ▼▼▼ 구글 로그인 핸들러 추가됨 ▼▼▼
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 1. 이미 가입된 사용자인지 확인
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        // [기존 회원] 프로필 정보로 바로 이동
        const userData = userDocSnap.data();
        navigate(`/home/${userData.username || user.uid}`);
      } else {
        // [신규 회원] 구글 정보로 자동 회원가입 처리
        
        // 닉네임 자동 생성 (구글이름 + 현재시간 뒷 4자리) -> 중복 방지
        // 예: '길동홍' -> '길동홍1234'
        const baseName = user.displayName ? user.displayName.replace(/\s/g, '') : 'user';
        const uniqueSuffix = Date.now().toString().slice(-4); 
        const autoUsername = `${baseName}${uniqueSuffix}`;

        // 사용자 정보 저장
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          username: autoUsername,
          createdAt: new Date(),
          avatar: user.photoURL || '🧑‍💻', // 구글 프로필 사진이 있으면 사용
          wallColor: '#ffe4e1'
        });

        // 사용자 이름 인덱스 저장 (앱 로직 유지)
        await setDoc(doc(db, 'usernames', autoUsername.toLowerCase()), {
          userId: user.uid
        });

        alert(`구글 계정으로 가입되었습니다! 환영합니다, ${autoUsername}님 🎉`);
        navigate(`/home/${autoUsername}`);
      }
    } catch (err) {
      console.error(err);
      setError('구글 로그인 중 오류가 발생했습니다.');
    }
  };
  // ▲▲▲ 추가 완료 ▲▲▲

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        // 로그인
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // 사용자 프로필 정보 가져오기
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          navigate(`/home/${userData.username || user.uid}`);
        } else {
          navigate(`/home/${user.uid}`);
        }
      } else {
        // 회원가입
        if (!username.trim()) {
          setError('사용자 이름을 입력해주세요.');
          return;
        }

        // 사용자 이름 중복 확인
        const usernameQuery = await getDoc(doc(db, 'usernames', username.toLowerCase()));
        if (usernameQuery.exists()) {
          setError('이미 사용 중인 사용자 이름입니다.');
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // 사용자 정보 저장
        await setDoc(doc(db, 'users', user.uid), {
          email: email,
          username: username,
          createdAt: new Date(),
          avatar: '🧑‍💻',
          wallColor: '#ffe4e1'
        });

        // 사용자 이름 인덱스 저장 (중복 방지)
        await setDoc(doc(db, 'usernames', username.toLowerCase()), {
          userId: user.uid
        });

        navigate(`/home/${username}`);
      }
    } catch (err) {
      setError(err.message || '오류가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>My SNS</h1>
        <h2>{isLogin ? '로그인' : '회원가입'}</h2>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <input
              type="text"
              placeholder="사용자 이름"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          
          {error && <div className="error-message">{error}</div>}
          
          <button type="submit">{isLogin ? '로그인' : '회원가입'}</button>
        </form>
        
        {/* ▼▼▼ 구글 로그인 버튼 추가 ▼▼▼ */}
        <div className="social-login">
          <button onClick={handleGoogleLogin} className="google-btn">
            Google 계정으로 시작하기
          </button>
        </div>

        <p className="toggle-mode">
          {isLogin ? (
            <>
              계정이 없으신가요?{' '}
              <span onClick={() => setIsLogin(false)}>회원가입</span>
            </>
          ) : (
            <>
              이미 계정이 있으신가요?{' '}
              <span onClick={() => setIsLogin(true)}>로그인</span>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Login;