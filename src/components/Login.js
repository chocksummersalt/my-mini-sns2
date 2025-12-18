import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
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

