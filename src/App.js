import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';
import Login from './components/Login';
import MiniRoom from './MiniRoom';
import './App.css';

function App() {
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [userUsername, setUserUsername] = React.useState(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      
      // 사용자 프로필에서 username 가져오기
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserUsername(userData.username || user.uid);
          } else {
            setUserUsername(user.uid);
          }
        } catch (error) {
          console.error('프로필 로드 실패:', error);
          setUserUsername(user.uid);
        }
      } else {
        setUserUsername(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>로딩 중...</div>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={!user ? <Login /> : <Navigate to={userUsername ? `/home/${userUsername}` : '/'} />} />
          <Route path="/home/:username" element={<MiniRoom />} />
          <Route path="/" element={user && userUsername ? <Navigate to={`/home/${userUsername}`} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;